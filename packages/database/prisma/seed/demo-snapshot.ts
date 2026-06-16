import { createId } from "@paralleldrive/cuid2";
import { createWave } from "../../services/orders-service";
import { releaseAndOptimizeWave } from "../../services/wave-routing-service";
import { db } from "../client";
import { CONFIG } from "./config";

export type DemoSnapshotResult = {
	warehouseId: string;
	openPoId?: string;
	summerSoId?: string;
	draftWaveId?: string;
	pickWaveId?: string;
	openReturnId?: string;
	comp400aSkuId?: string;
};

async function getAdminUserId(organizationId: string): Promise<string> {
	const member = await db.member.findFirst({
		where: { organizationId },
		select: { userId: true },
	});
	if (!member?.userId) {
		throw new Error("No admin user found for organization.");
	}
	return member.userId;
}

async function ensureInventoryAtLocation(params: {
	warehouseId: string;
	locationId: string;
	skuId: string;
	qty: number;
	userId: string;
	at: Date;
}) {
	const existing = await db.inventoryBalance.findFirst({
		where: {
			warehouseId: params.warehouseId,
			locationId: params.locationId,
			skuId: params.skuId,
			lotId: null,
			state: "AVAILABLE",
		},
	});

	if (existing) {
		await db.inventoryBalance.update({
			where: { id: existing.id },
			data: { quantityAvailable: params.qty, updatedAt: params.at },
		});
	} else {
		await db.inventoryBalance.create({
			data: {
				warehouseId: params.warehouseId,
				locationId: params.locationId,
				skuId: params.skuId,
				state: "AVAILABLE",
				quantityAvailable: params.qty,
				updatedAt: params.at,
			},
		});
	}
}

async function createAllocatedSalesOrder(params: {
	warehouseId: string;
	customerId: string;
	orderNumber: string;
	lines: Array<{ skuId: string; qty: number; unitPrice?: number }>;
	orderedAt: Date;
}) {
	const soId = createId();
	await db.salesOrder.create({
		data: {
			id: soId,
			warehouseId: params.warehouseId,
			customerId: params.customerId,
			orderNumber: params.orderNumber,
			status: "ALLOCATED",
			orderedAt: params.orderedAt,
			items: {
				create: params.lines.map((line) => ({
					skuId: line.skuId,
					orderedQty: line.qty,
					allocatedQty: line.qty,
					pickedQty: 0,
				})),
			},
		},
	});
	return soId;
}

async function seedRecentActivity(params: {
	organizationId: string;
	warehouseId: string;
	customerId: string;
	compSkuId: string;
	outboundLocId: string;
	pickLocId: string;
	userId: string;
	now: Date;
}) {
	const { warehouseId, customerId, compSkuId, outboundLocId, pickLocId, now } =
		params;

	for (let day = 0; day < 7; day++) {
		const shippedAt = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
		const soId = createId();
		await db.salesOrder.create({
			data: {
				id: soId,
				warehouseId,
				customerId,
				orderNumber: `SO-OTIF-${day}-${createId().slice(0, 6).toUpperCase()}`,
				status: "SHIPPED",
				orderedAt: shippedAt,
				items: {
					create: {
						skuId: compSkuId,
						orderedQty: 2,
						allocatedQty: 2,
						pickedQty: 2,
					},
				},
			},
		});
		await db.shipment.create({
			data: {
				warehouseId,
				salesOrderId: soId,
				shipmentNumber: `SHIP-OTIF-${day}`,
				carrier: "BlueDart",
				scheduledAt: shippedAt,
				shippedAt,
				status: "SHIPPED",
			},
		});
	}

	for (let day = 0; day < 30; day++) {
		const createdAt = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
		const shipQty = day < 7 ? 8 : 3;
		await db.inventoryTransaction.create({
			data: {
				warehouseId,
				skuId: compSkuId,
				fromLocationId: pickLocId,
				toLocationId: null,
				quantity: shipQty,
				transactionType: "SHIP",
				createdAt,
				performedById: params.userId,
			},
		});
	}

	await db.warehouseTask.createMany({
		data: [
			{
				warehouseId,
				type: "PICK",
				status: "PENDING",
				priority: "NORMAL",
				skuId: compSkuId,
				fromLocationId: pickLocId,
				toLocationId: outboundLocId,
				quantity: 2,
				createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
			},
			{
				warehouseId,
				type: "MOVE",
				status: "PENDING",
				priority: "NORMAL",
				skuId: compSkuId,
				fromLocationId: pickLocId,
				toLocationId: outboundLocId,
				quantity: 1,
				createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
			},
		],
	});
}

export async function seedDemoSnapshot(params: {
	organizationId: string;
	warehouseCode?: string;
}): Promise<DemoSnapshotResult> {
	const warehouseCode = params.warehouseCode ?? CONFIG.DEMO_WAREHOUSE_CODE;
	const now = new Date();
	const userId = await getAdminUserId(params.organizationId);

	const warehouse = await db.warehouse.findFirst({
		where: {
			organizationId: params.organizationId,
			code: warehouseCode,
		},
	});
	if (!warehouse) {
		throw new Error(`Demo warehouse ${warehouseCode} not found.`);
	}

	const bins = await db.location.findMany({
		where: { warehouseId: warehouse.id, type: "BIN" },
		take: 30,
		select: { id: true, code: true },
	});
	const inbound = await db.location.findFirst({
		where: {
			warehouseId: warehouse.id,
			code: { contains: "IN" },
			type: "ZONE",
		},
	});
	const outbound = await db.location.findFirst({
		where: {
			warehouseId: warehouse.id,
			code: { contains: "OUT" },
			type: "ZONE",
		},
	});

	if (bins.length < 15) {
		throw new Error("Not enough bins in demo warehouse for snapshot.");
	}

	const supplier = await db.supplier.findFirst({
		where: { organizationId: params.organizationId },
	});
	const customer = await db.customer.findFirst({
		where: { organizationId: params.organizationId },
	});
	if (!supplier || !customer) {
		throw new Error("Supplier/customer required for demo snapshot.");
	}

	const compSku = await db.sKU.findFirst({
		where: {
			code: CONFIG.DEMO_SKU_COMPRESSOR,
			product: { organizationId: params.organizationId },
		},
		include: { product: true },
	});
	const pickSkus = await db.sKU.findMany({
		where: {
			product: {
				organizationId: params.organizationId,
				isSerialTracked: false,
			},
		},
		include: { product: true },
		take: 20,
	});
	if (!compSku || pickSkus.length < 12) {
		throw new Error("Insufficient SKUs for demo snapshot.");
	}

	const compBin = bins[1].id;

	for (let i = 0; i < pickSkus.length; i++) {
		await ensureInventoryAtLocation({
			warehouseId: warehouse.id,
			locationId: bins[i % bins.length].id,
			skuId: pickSkus[i].id,
			qty: 50 + i * 5,
			userId,
			at: now,
		});
	}

	await ensureInventoryAtLocation({
		warehouseId: warehouse.id,
		locationId: compBin,
		skuId: compSku.id,
		qty: 4,
		userId,
		at: now,
	});

	const lowStockSku = pickSkus[pickSkus.length - 1];
	await ensureInventoryAtLocation({
		warehouseId: warehouse.id,
		locationId: bins[bins.length - 1].id,
		skuId: lowStockSku.id,
		qty: 3,
		userId,
		at: now,
	});

	const openPoId = createId();
	await db.purchaseOrder.create({
		data: {
			id: openPoId,
			warehouseId: warehouse.id,
			supplierId: supplier.id,
			poNumber: CONFIG.DEMO_PO_OPEN,
			status: "APPROVED",
			expectedAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
			createdAt: now,
			items: {
				create: pickSkus.slice(0, 3).map((sku, idx) => ({
					skuId: sku.id,
					orderedQty: 20 + idx * 10,
					receivedQty: 0,
					unitPrice: Number(sku.unitPrice ?? 100),
				})),
			},
		},
	});

	const partialPoId = createId();
	const partialSku = pickSkus[3];
	await db.purchaseOrder.create({
		data: {
			id: partialPoId,
			warehouseId: warehouse.id,
			supplierId: supplier.id,
			poNumber: CONFIG.DEMO_PO_PARTIAL,
			status: "PARTIAL",
			expectedAt: now,
			createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
			items: {
				create: {
					skuId: partialSku.id,
					orderedQty: 100,
					receivedQty: 40,
					unitPrice: Number(partialSku.unitPrice ?? 100),
				},
			},
		},
	});

	const summerLines = pickSkus.slice(0, 14).map((sku, idx) => ({
		skuId: sku.id,
		qty: 2 + (idx % 4),
		unitPrice: Number(sku.unitPrice ?? 100),
	}));
	const summerSoId = await createAllocatedSalesOrder({
		warehouseId: warehouse.id,
		customerId: customer.id,
		orderNumber: CONFIG.DEMO_SO_SUMMER,
		lines: summerLines,
		orderedAt: now,
	});

	const draftSoId = await createAllocatedSalesOrder({
		warehouseId: warehouse.id,
		customerId: customer.id,
		orderNumber: "SO-DEMO-AUTO-001",
		lines: pickSkus.slice(0, 8).map((sku) => ({
			skuId: sku.id,
			qty: 3,
			unitPrice: Number(sku.unitPrice ?? 100),
		})),
		orderedAt: now,
	});

	const draftWave = await createWave({
		organizationId: params.organizationId,
		warehouseId: warehouse.id,
		waveNumber: CONFIG.DEMO_WAVE_DRAFT,
		type: "ZONE",
		salesOrderIds: [draftSoId],
	});

	let pickWaveId: string | undefined;
	if (CONFIG.DEMO_PRERELEASE_WAVE) {
		const pickSoId = await createAllocatedSalesOrder({
			warehouseId: warehouse.id,
			customerId: customer.id,
			orderNumber: "SO-DEMO-PICK-001",
			lines: pickSkus.slice(0, 6).map((sku) => ({
				skuId: sku.id,
				qty: 2,
				unitPrice: Number(sku.unitPrice ?? 100),
			})),
			orderedAt: now,
		});

		const pickWave = await createWave({
			organizationId: params.organizationId,
			warehouseId: warehouse.id,
			waveNumber: CONFIG.DEMO_WAVE_PICK,
			type: "ZONE",
			salesOrderIds: [pickSoId],
		});

		await releaseAndOptimizeWave({
			organizationId: params.organizationId,
			waveId: pickWave.wave.id,
			releasedByUserId: userId,
			pickerCount: 3,
		});
		pickWaveId = pickWave.wave.id;
	}

	const openReturnId = createId();
	await db.returnOrder.create({
		data: {
			id: openReturnId,
			warehouseId: warehouse.id,
			customerId: customer.id,
			returnNumber: CONFIG.DEMO_RMA_OPEN,
			reason: "Defective unit — demo return",
			status: "RECEIVED",
			createdAt: now,
			items: {
				create: {
					skuId: compSku.id,
					quantity: 1,
				},
			},
		},
	});

	await db.returnOrder.create({
		data: {
			warehouseId: warehouse.id,
			customerId: customer.id,
			returnNumber: CONFIG.DEMO_RMA_INSPECT,
			reason: "Wrong model shipped",
			status: "INSPECTING",
			createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
			items: {
				create: {
					skuId: pickSkus[5].id,
					quantity: 2,
				},
			},
			inspections: {
				create: {
					inspectedById: userId,
					result: "PASSED",
					notes: "Visual inspection in progress",
					createdAt: now,
				},
			},
		},
	});

	if (inbound && outbound) {
		await seedRecentActivity({
			organizationId: params.organizationId,
			warehouseId: warehouse.id,
			customerId: customer.id,
			compSkuId: compSku.id,
			outboundLocId: outbound.id,
			pickLocId: compBin,
			userId,
			now,
		});
	}

	const result: DemoSnapshotResult = {
		warehouseId: warehouse.id,
		openPoId,
		summerSoId,
		draftWaveId: draftWave.wave.id,
		pickWaveId,
		openReturnId,
		comp400aSkuId: compSku.id,
	};

	console.log("\n--- Demo snapshot ---");
	console.log(`  Open PO:     ${CONFIG.DEMO_PO_OPEN} (${openPoId})`);
	console.log(`  Summer SO:   ${CONFIG.DEMO_SO_SUMMER} (${summerSoId})`);
	console.log(`  Draft wave:  ${CONFIG.DEMO_WAVE_DRAFT} (${draftWave.wave.id})`);
	if (pickWaveId) {
		console.log(`  Pick wave:   ${CONFIG.DEMO_WAVE_PICK} (${pickWaveId})`);
		console.log(`  Operator:    /operator/pick/${pickWaveId}?picker=1`);
	}
	console.log(`  Open return: ${CONFIG.DEMO_RMA_OPEN} (${openReturnId})`);
	console.log(`  Receive:     /operator/receive/${openPoId}`);
	console.log("---------------------\n");

	return result;
}
