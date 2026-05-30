import { Prisma } from "../prisma/generated/client";
import { db as prisma } from "../prisma";

export async function updateMovingAverageCost(tx: any, warehouseId: string, skuId: string, addedQuantity: number, unitCost: number) {
    // Get total current quantity available across all locations in this warehouse
    const balances = await tx.inventoryBalance.findMany({
        where: { warehouseId, skuId, state: "AVAILABLE" }
    });
    
    let currentQuantity = 0;
    for (const b of balances) {
        currentQuantity += Number(b.quantityAvailable);
    }
    
    const currentCostRecord = await tx.inventoryCost.findUnique({
        where: { warehouseId_skuId: { warehouseId, skuId } }
    });
    
    const currentMAC = currentCostRecord ? Number(currentCostRecord.averageUnitCost) : 0;
    
    // Calculate new MAC: ((Current Qty * Current MAC) + (Added Qty * New Unit Cost)) / (Current Qty + Added Qty)
    const totalCurrentValue = currentQuantity * currentMAC;
    const addedValue = addedQuantity * unitCost;
    const newTotalQuantity = currentQuantity + addedQuantity;
    
    const newMAC = newTotalQuantity > 0 ? (totalCurrentValue + addedValue) / newTotalQuantity : 0;
    
    await tx.inventoryCost.upsert({
        where: { warehouseId_skuId: { warehouseId, skuId } },
        create: {
            warehouseId,
            skuId,
            averageUnitCost: newMAC,
            lastCalculatedAt: new Date()
        },
        update: {
            averageUnitCost: newMAC,
            lastCalculatedAt: new Date()
        }
    });
    
    return newMAC;
}

export async function getMovingAverageCost(tx: any, warehouseId: string, skuId: string) {
    const cost = await tx.inventoryCost.findUnique({
        where: { warehouseId_skuId: { warehouseId, skuId } }
    });
    return cost ? Number(cost.averageUnitCost) : 0;
}
