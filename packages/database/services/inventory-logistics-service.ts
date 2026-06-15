import { db as prisma } from "../prisma";
import { updateMovingAverageCost, getMovingAverageCost } from "./inventory-cost-service";

export async function receiveInventory(input: {
    organizationId: string;
    warehouseId: string;
    locationId: string;
    skuId: string;
    quantity: number;
    purchaseUnitPrice: number; // Unit price from vendor
    apportionedFreightCost: number; // Freight cost allocated to these units
    userId: string;
    purchaseOrderItemId?: string;
}) {
    return await prisma.$transaction(async (tx) => {
        // 1. Calculate Landed Cost per unit
        const landedCostPerUnit = input.purchaseUnitPrice + (input.apportionedFreightCost / input.quantity);

        // 2. Update Moving Average Cost (MAC)
        const newMAC = await updateMovingAverageCost(tx, input.warehouseId, input.skuId, input.quantity, landedCostPerUnit);

        // 3. Update Inventory Balance
        const existing = await tx.inventoryBalance.findFirst({
            where: { warehouseId: input.warehouseId, locationId: input.locationId, skuId: input.skuId, state: "AVAILABLE" }
        });

        if (existing) {
            await tx.inventoryBalance.update({
                where: { id: existing.id },
                data: { quantityAvailable: { increment: input.quantity } }
            });
        } else {
            await tx.inventoryBalance.create({
                data: {
                    warehouseId: input.warehouseId,
                    locationId: input.locationId,
                    skuId: input.skuId,
                    state: "AVAILABLE",
                    quantityAvailable: input.quantity
                }
            });
        }

        // 4. Record Inventory Transaction
        await tx.inventoryTransaction.create({
            data: {
                warehouseId: input.warehouseId,
                toLocationId: input.locationId,
                skuId: input.skuId,
                performedById: input.userId,
                transactionType: "RECEIVE",
                quantity: input.quantity,
                unitCost: landedCostPerUnit,
                totalValue: landedCostPerUnit * input.quantity
            }
        });

        // 5. Write to CostLedger
        await tx.costLedger.createMany({
            data: [
                {
                    organizationId: input.organizationId,
                    warehouseId: input.warehouseId,
                    type: "PURCHASE",
                    amount: input.purchaseUnitPrice * input.quantity
                },
                {
                    organizationId: input.organizationId,
                    warehouseId: input.warehouseId,
                    type: "FREIGHT",
                    amount: input.apportionedFreightCost
                }
            ]
        });

        if (input.purchaseOrderItemId) {
            const poItem = await tx.purchaseOrderItem.update({
                where: { id: input.purchaseOrderItemId },
                data: { receivedQty: { increment: input.quantity } },
                select: { purchaseOrderId: true },
            });

            const items = await tx.purchaseOrderItem.findMany({
                where: { purchaseOrderId: poItem.purchaseOrderId },
                select: { orderedQty: true, receivedQty: true },
            });

            const allReceived = items.every(
                (line) => Number(line.receivedQty) >= Number(line.orderedQty),
            );
            const anyReceived = items.some(
                (line) => Number(line.receivedQty) > 0,
            );

            await tx.purchaseOrder.update({
                where: { id: poItem.purchaseOrderId },
                data: {
                    status: allReceived
                        ? "RECEIVED"
                        : anyReceived
                            ? "PARTIAL"
                            : "APPROVED",
                },
            });
        }

        return { newMAC, landedCostPerUnit };
    });
}

export async function transferOutbound(input: {
    organizationId: string;
    warehouseId: string; // Source warehouse
    locationId: string;
    skuId: string;
    quantity: number;
    userId: string;
}) {
    return await prisma.$transaction(async (tx) => {
        const currentMAC = await getMovingAverageCost(tx as any, input.warehouseId, input.skuId);
        
        // Decrease Balance
        const existing = await tx.inventoryBalance.findFirst({
            where: { warehouseId: input.warehouseId, locationId: input.locationId, skuId: input.skuId, state: "AVAILABLE" }
        });
        
        if (!existing || Number(existing.quantityAvailable) < input.quantity) {
            throw new Error("Insufficient inventory for transfer");
        }
        
        await tx.inventoryBalance.update({
            where: { id: existing.id },
            data: { quantityAvailable: { decrement: input.quantity } }
        });

        // Record Transaction
        await tx.inventoryTransaction.create({
            data: {
                warehouseId: input.warehouseId,
                fromLocationId: input.locationId,
                skuId: input.skuId,
                performedById: input.userId,
                transactionType: "MOVE", // Or SHIP depending on the exact semantic
                quantity: input.quantity,
                unitCost: currentMAC,
                totalValue: currentMAC * input.quantity
            }
        });
        
        return { unitCostTransfer: currentMAC };
    });
}

export async function receiveTransfer(input: {
    organizationId: string;
    warehouseId: string; // Destination warehouse
    locationId: string;
    skuId: string;
    quantity: number;
    sourceUnitCost: number; // passed from the outbound transfer
    apportionedFreightCost: number;
    userId: string;
}) {
    // Uses the same logic as receiveInventory but treats the 'purchaseUnitPrice' as the source warehouse's MAC
    return receiveInventory({
        organizationId: input.organizationId,
        warehouseId: input.warehouseId,
        locationId: input.locationId,
        skuId: input.skuId,
        quantity: input.quantity,
        purchaseUnitPrice: input.sourceUnitCost,
        apportionedFreightCost: input.apportionedFreightCost,
        userId: input.userId
    });
}

export async function shipSalesOrder(input: {
    organizationId: string;
    warehouseId: string;
    locationId: string;
    skuId: string;
    quantity: number;
    userId: string;
}) {
    return await prisma.$transaction(async (tx) => {
        const currentMAC = await getMovingAverageCost(tx as any, input.warehouseId, input.skuId);
        
        // Decrease Balance
        const existing = await tx.inventoryBalance.findFirst({
            where: { warehouseId: input.warehouseId, locationId: input.locationId, skuId: input.skuId, state: "AVAILABLE" }
        });
        
        if (!existing || Number(existing.quantityAvailable) < input.quantity) {
            throw new Error("Insufficient inventory to ship");
        }
        
        await tx.inventoryBalance.update({
            where: { id: existing.id },
            data: { quantityAvailable: { decrement: input.quantity } }
        });

        const totalCOGS = currentMAC * input.quantity;

        // Record Transaction
        await tx.inventoryTransaction.create({
            data: {
                warehouseId: input.warehouseId,
                fromLocationId: input.locationId,
                skuId: input.skuId,
                performedById: input.userId,
                transactionType: "SHIP",
                quantity: input.quantity,
                unitCost: currentMAC,
                totalValue: totalCOGS
            }
        });

        // Write to CostLedger
        await tx.costLedger.create({
            data: {
                organizationId: input.organizationId,
                warehouseId: input.warehouseId,
                type: "COGS",
                amount: totalCOGS
            }
        });
        
        return { cogs: totalCOGS };
    });
}

export async function returnToSupplier(input: {
    organizationId: string;
    warehouseId: string;
    locationId: string;
    skuId: string;
    quantity: number;
    freightCost: number;
    userId: string;
}) {
    return await prisma.$transaction(async (tx) => {
        const currentMAC = await getMovingAverageCost(tx as any, input.warehouseId, input.skuId);
        
        // Decrease Balance
        const existing = await tx.inventoryBalance.findFirst({
            where: { warehouseId: input.warehouseId, locationId: input.locationId, skuId: input.skuId, state: "AVAILABLE" }
        });
        
        if (!existing || Number(existing.quantityAvailable) < input.quantity) {
            throw new Error("Insufficient inventory for RTV");
        }
        
        await tx.inventoryBalance.update({
            where: { id: existing.id },
            data: { quantityAvailable: { decrement: input.quantity } }
        });

        const creditValue = currentMAC * input.quantity;

        // Record Transaction
        await tx.inventoryTransaction.create({
            data: {
                warehouseId: input.warehouseId,
                fromLocationId: input.locationId,
                skuId: input.skuId,
                performedById: input.userId,
                transactionType: "RETURN",
                quantity: input.quantity,
                unitCost: currentMAC,
                totalValue: creditValue
            }
        });

        // Write to CostLedger
        await tx.costLedger.createMany({
            data: [
                {
                    organizationId: input.organizationId,
                    warehouseId: input.warehouseId,
                    type: "RTV_CREDIT",
                    amount: creditValue // Or whatever vendor actually agreed to refund
                },
                {
                    organizationId: input.organizationId,
                    warehouseId: input.warehouseId,
                    type: "FREIGHT",
                    amount: input.freightCost
                }
            ]
        });
        
        return { creditValue };
    });
}

export async function calculateHoldingCosts(organizationId: string) {
    const warehouses = await prisma.warehouse.findMany({
        where: { organizationId, status: "ACTIVE" }
    });

    for (const wh of warehouses) {
        if (!wh.holdingCostPerVolumeUnit && !wh.holdingCostPerWeightUnit) continue;

        const holdingCostVol = Number(wh.holdingCostPerVolumeUnit || 0);
        const holdingCostWeight = Number(wh.holdingCostPerWeightUnit || 0);

        // Get total volume/weight of all available items
        const balances = await prisma.inventoryBalance.findMany({
            where: { warehouseId: wh.id, state: "AVAILABLE" },
            include: { sku: true }
        });

        let totalVolume = 0;
        let totalWeight = 0;

        for (const b of balances) {
            const qty = Number(b.quantityAvailable);
            const w = Number(b.sku.width || 0);
            const h = Number(b.sku.height || 0);
            const l = Number(b.sku.length || 0);
            const wt = Number(b.sku.weight || 0);

            totalVolume += (w * h * l) * qty;
            totalWeight += wt * qty;
        }

        const costFromVolume = totalVolume * holdingCostVol;
        const costFromWeight = totalWeight * holdingCostWeight;
        const totalHoldingCost = costFromVolume + costFromWeight;

        if (totalHoldingCost > 0) {
            await prisma.costLedger.create({
                data: {
                    organizationId,
                    warehouseId: wh.id,
                    type: "HOLDING_COST",
                    amount: totalHoldingCost
                }
            });
        }
    }
}
