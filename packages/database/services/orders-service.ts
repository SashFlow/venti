import type { Prisma } from "@prisma/client";
import { db } from "../prisma";

type ListParams = {
	organizationId: string;
	customerId?: string;
	query?: string;
	limit: number;
	offset: number;
};

type InboundFilterParams = ListParams & {
	status?: string[];
	warehouseId?: string;
	supplierId?: string;
	startDate?: Date;
	endDate?: Date;
};

type OutboundFilterParams = ListParams & {
	status?: string[];
	warehouseId?: string;
	priority?: string;
	startDate?: Date;
	endDate?: Date;
};

type TransferFilterParams = ListParams & {
	status?: string[];
	warehouseId?: string;
	startDate?: Date;
	endDate?: Date;
};

type ManifestFilterParams = {
	organizationId: string;
	limit: number;
	offset: number;
	carrier?: string;
	startDate?: Date;
	endDate?: Date;
};

type BatchFilterParams = {
	organizationId: string;
	limit: number;
	offset: number;
	status?: string[];
};

type ShipmentFilterParams = {
	organizationId: string;
	limit: number;
	offset: number;
	status?: string[];
};

export async function listInboundOrders(params: InboundFilterParams) {
	const where: Prisma.PurchaseOrderWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
			...(params.warehouseId ? { id: params.warehouseId } : {}),
		},
		...(params.supplierId ? { supplierId: params.supplierId } : {}),
		...(params.status && params.status.length > 0
			? {
					status: {
						in: params.status as Prisma.EnumPurchaseOrderStatusFilter["in"],
					},
				}
			: {}),
		...(params.startDate || params.endDate
			? {
					createdAt: {
						...(params.startDate ? { gte: params.startDate } : {}),
						...(params.endDate ? { lte: params.endDate } : {}),
					},
				}
			: {}),
		...(params.query
			? {
					OR: [
						{
							poNumber: {
								contains: params.query,
								mode: "insensitive" as const,
							},
						},
						{
							supplier: {
								name: {
									contains: params.query,
									mode: "insensitive" as const,
								},
							},
						},
						{
							warehouse: {
								name: {
									contains: params.query,
									mode: "insensitive" as const,
								},
							},
						},
					],
				}
			: {}),
	};

	const [orders, total] = await Promise.all([
		db.purchaseOrder.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				poNumber: true,
				status: true,
				createdAt: true,
				expectedAt: true,
				supplier: {
					select: { name: true },
				},
				warehouse: {
					select: { name: true },
				},
				_count: {
					select: { items: true },
				},
			},
		}),
		db.purchaseOrder.count({ where }),
	]);

	return { orders, total };
}

export async function listOutboundOrders(params: OutboundFilterParams) {
	const where: Prisma.SalesOrderWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
			...(params.warehouseId ? { id: params.warehouseId } : {}),
		},
		...(params.customerId ? { customerId: params.customerId } : {}),
		// Removed priority as it's not in the new v3 SalesOrder model
		...(params.status && params.status.length > 0
			? {
					status: {
						in: params.status as Prisma.EnumSalesOrderStatusFilter["in"],
					},
				}
			: {}),
		...(params.startDate || params.endDate
			? {
					createdAt: {
						...(params.startDate ? { gte: params.startDate } : {}),
						...(params.endDate ? { lte: params.endDate } : {}),
					},
				}
			: {}),
		...(params.query
			? {
					OR: [
						{
							orderNumber: {
								contains: params.query,
								mode: "insensitive" as const,
							},
						},
						{
							customer: {
								name: {
									contains: params.query,
									mode: "insensitive" as const,
								},
							},
						},
						{
							warehouse: {
								name: {
									contains: params.query,
									mode: "insensitive" as const,
								},
							},
						},
					],
				}
			: {}),
	};

	const [orders, total] = await Promise.all([
		db.salesOrder.findMany({
			where,
			orderBy: { orderedAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				orderNumber: true,
				status: true,
				customer: {
					select: { name: true, code: true },
				},
				orderedAt: true,
				createdAt: true,
				warehouse: {
					select: { name: true },
				},
				_count: {
					select: { items: true },
				},
			},
		}),
		db.salesOrder.count({ where }),
	]);

	return { orders, total };
}

export async function listTransfers(params: TransferFilterParams) {
	const where: Prisma.InventoryTransactionWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
			...(params.warehouseId ? { id: params.warehouseId } : {}),
		},
		transactionType: "MOVE",
		...(params.startDate || params.endDate
			? {
					createdAt: {
						...(params.startDate ? { gte: params.startDate } : {}),
						...(params.endDate ? { lte: params.endDate } : {}),
					},
				}
			: {}),
		...(params.query
			? {
					OR: [
						{
							referenceId: {
								contains: params.query,
								mode: "insensitive" as const,
							},
						},
						{
							warehouse: {
								name: {
									contains: params.query,
									mode: "insensitive" as const,
								},
							},
						},
					],
				}
			: {}),
	};

	const [transfers, total] = await Promise.all([
		db.inventoryTransaction.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				referenceId: true,
				transactionType: true,
				quantity: true,
				createdAt: true,
				warehouse: {
					select: { name: true },
				},
				fromLocation: {
					select: { code: true },
				},
				toLocation: {
					select: { code: true },
				},
			},
		}),
		db.inventoryTransaction.count({ where }),
	]);

	return { transfers, total };
}

export async function listManifests(params: ManifestFilterParams) {
	const where: Prisma.ShipmentWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		status: {
			in: ["SHIPPED", "DELIVERED"],
		},
		...(params.carrier ? { carrier: params.carrier } : {}),
		...(params.startDate || params.endDate
			? {
					shippedAt: {
						...(params.startDate ? { gte: params.startDate } : {}),
						...(params.endDate ? { lte: params.endDate } : {}),
					},
				}
			: {}),
	};

	const [manifests, total] = await Promise.all([
		db.shipment.findMany({
			where,
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				trackingNumber: true,
				status: true,
				carrier: true,
			},
		}),
		db.shipment.count({ where }),
	]);

	return {
		manifests: manifests.map((manifest) => ({
			...manifest,
			shipmentsCount: 1,
		})),
		total,
	};
}

export async function listFulfillmentBatches(params: BatchFilterParams) {
	const where: Prisma.PickWaveWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		...(params.status && params.status.length > 0
			? {
					status: {
						in: params.status as Prisma.EnumWaveStatusFilter["in"],
					},
				}
			: {}),
	};

	const [batches, total] = await Promise.all([
		db.pickWave.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				waveNumber: true,
				status: true,
				createdAt: true,
				_count: {
					select: { tasks: true },
				},
			},
		}),
		db.pickWave.count({ where }),
	]);

	return { batches, total };
}

export async function listFulfillmentShipments(params: ShipmentFilterParams) {
	const where: Prisma.ShipmentWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		status:
			params.status && params.status.length > 0
				? {
						in: params.status as Prisma.EnumShipmentStatusFilter<"Shipment">["in"],
					}
				: { in: ["PENDING", "PACKED"] },
	};

	const [shipments, total] = await Promise.all([
		db.shipment.findMany({
			where,
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				trackingNumber: true,
				status: true,
				salesOrder: {
					select: {
						customer: { select: { name: true, code: true } },
					},
				},
			},
		}),
		db.shipment.count({ where }),
	]);

	return { shipments, total };
}

export async function updateOutboundOrderStatus(params: {
	organizationId: string;
	orderId: string;
	status:
		| "DRAFT"
		| "ALLOCATED"
		| "PICKING"
		| "PACKING"
		| "SHIPPED"
		| "CANCELLED";
}) {
	const updated = await db.salesOrder.updateMany({
		where: {
			id: params.orderId,
			warehouse: {
				organizationId: params.organizationId,
			},
		},
		data: {
			status: params.status,
		},
	});

	if (updated.count === 0) {
		return null;
	}

	return db.salesOrder.findUnique({
		where: { id: params.orderId },
		select: {
			id: true,
			status: true,
		},
	});
}

export async function completeTransfer(params: {
	organizationId: string;
	transferId: string;
}) {
	const updated = await db.inventoryTransaction.updateMany({
		where: {
			id: params.transferId,
			warehouse: {
				organizationId: params.organizationId,
			},
			transactionType: "MOVE",
		},
		data: {
			metadata: { status: "COMPLETED" },
		},
	});

	if (updated.count === 0) {
		return null;
	}

	return db.inventoryTransaction.findUnique({
		where: { id: params.transferId },
		select: {
			id: true,
			createdAt: true,
		},
	});
}

export async function updateShipmentStatus(params: {
	organizationId: string;
	shipmentId: string;
	status: "PENDING" | "PACKED" | "SHIPPED" | "DELIVERED" | "FAILED";
}) {
	const updated = await db.shipment.updateMany({
		where: {
			id: params.shipmentId,
			warehouse: {
				organizationId: params.organizationId,
			},
		},
		data: {
			status: params.status,
			...(params.status === "SHIPPED" ? { shippedAt: new Date() } : {}),
		},
	});

	if (updated.count === 0) {
		return null;
	}

	return db.shipment.findUnique({
		where: { id: params.shipmentId },
		select: {
			id: true,
			status: true,
		},
	});
}

export async function bulkUpdateOutboundOrderStatus(params: {
	organizationId: string;
	orderIds: string[];
	status:
		| "DRAFT"
		| "ALLOCATED"
		| "PICKING"
		| "PACKING"
		| "SHIPPED"
		| "CANCELLED";
}) {
	const uniqueOrderIds = [...new Set(params.orderIds)];
	const targetOrders = await db.salesOrder.findMany({
		where: {
			warehouse: { organizationId: params.organizationId },
			id: { in: uniqueOrderIds },
		},
		select: {
			id: true,
			status: true,
		},
	});

	const actionableOrderIds = targetOrders
		.filter((order) => {
			if (params.status !== "SHIPPED") {
				return true;
			}

			return !["SHIPPED", "CANCELLED"].includes(order.status);
		})
		.map((order) => order.id);

	const updated = await db.salesOrder.updateMany({
		where: {
			warehouse: { organizationId: params.organizationId },
			id: { in: actionableOrderIds },
		},
		data: {
			status: params.status,
			...(params.status === "SHIPPED" ? {} : {}),
		},
	});

	const updatedIds = actionableOrderIds;
	const skippedIds = uniqueOrderIds.filter((id) => !updatedIds.includes(id));

	return {
		requested: uniqueOrderIds.length,
		updated: updated.count,
		updatedIds,
		skipped: skippedIds.length,
		skippedIds,
	};
}

export async function bulkUpdateShipmentStatuses(params: {
	organizationId: string;
	updates: Array<{
		shipmentId: string;
		status: "PENDING" | "PACKED" | "SHIPPED" | "DELIVERED" | "FAILED";
	}>;
}) {
	const dedupedUpdates = Array.from(
		new Map(
			params.updates.map((update) => [update.shipmentId, update]),
		).values(),
	);
	const requestedIds = dedupedUpdates.map((update) => update.shipmentId);

	const result = await db.$transaction(async (tx) => {
		let updated = 0;
		const updatedIds: string[] = [];

		for (const update of dedupedUpdates) {
			const res = await tx.shipment.updateMany({
				where: {
					id: update.shipmentId,
					warehouse: {
						organizationId: params.organizationId,
					},
				},
				data: {
					status: update.status,
					...(update.status === "SHIPPED"
						? { shippedAt: new Date() }
						: {}),
				},
			});

			updated += res.count;

			if (res.count > 0) {
				updatedIds.push(update.shipmentId);
			}
		}

		const skippedIds = requestedIds.filter(
			(id) => !updatedIds.includes(id),
		);

		return {
			requested: dedupedUpdates.length,
			updated,
			updatedIds,
			skipped: skippedIds.length,
			skippedIds,
		};
	});

	return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// Get-by-id
// ──────────────────────────────────────────────────────────────────────────────

export async function getPurchaseOrderById(params: {
	organizationId: string;
	orderId: string;
}) {
	return db.purchaseOrder.findFirst({
		where: {
			id: params.orderId,
			warehouse: { organizationId: params.organizationId },
		},
		select: {
			id: true,
			poNumber: true,
			status: true,
			createdAt: true,
			expectedAt: true,
			supplier: { select: { id: true, name: true } },
			warehouse: { select: { id: true, name: true } },
			items: {
				select: {
					id: true,
					orderedQty: true,
					receivedQty: true,
					unitPrice: true,
					sku: { select: { id: true, name: true, code: true } },
				},
			},
		},
	});
}

export async function getSalesOrderById(params: {
	organizationId: string;
	orderId: string;
}) {
	return db.salesOrder.findFirst({
		where: {
			id: params.orderId,
			warehouse: { organizationId: params.organizationId },
		},
		select: {
			id: true,
			orderNumber: true,
			status: true,
			orderedAt: true,
			warehouse: { select: { id: true, name: true } },
			customer: { select: { id: true, name: true } },
			items: {
				select: {
					id: true,
					orderedQty: true,
					allocatedQty: true,
					pickedQty: true,
					sku: { select: { id: true, name: true, code: true } },
				},
			},
			shipment: {
				select: {
					id: true,
					trackingNumber: true,
					status: true,
				},
			},
		},
	});
}

export async function getTransferById(params: {
	organizationId: string;
	transferId: string;
}) {
	return db.inventoryTransaction.findFirst({
		where: {
			id: params.transferId,
			transactionType: "MOVE",
			warehouse: { organizationId: params.organizationId },
		},
		select: {
			id: true,
			referenceId: true,
			transactionType: true,
			quantity: true,
			metadata: true,
			createdAt: true,

			warehouse: { select: { id: true, name: true } },
			fromLocation: { select: { id: true, code: true } },
			toLocation: { select: { id: true, code: true } },
			sku: { select: { id: true, name: true, code: true } },
			performedBy: { select: { name: true } },
		},
	});
}

export async function getShipmentById(params: {
	organizationId: string;
	shipmentId: string;
}) {
	return db.shipment.findFirst({
		where: {
			id: params.shipmentId,
			warehouse: { organizationId: params.organizationId },
		},
		select: {
			id: true,
			status: true,
			trackingNumber: true,
			shippedAt: true,
			carrier: true,
			warehouse: { select: { id: true, name: true } },
			salesOrder: {
				select: {
					id: true,
					orderNumber: true,
					customer: { select: { name: true, code: true } },
				},
			},
		},
	});
}

export async function getWaveById(params: {
	organizationId: string;
	waveId: string;
}) {
	return db.pickWave.findFirst({
		where: {
			id: params.waveId,
			warehouse: { organizationId: params.organizationId },
		},
		select: {
			id: true,
			waveNumber: true,
			status: true,
			createdAt: true,
			tasks: true,
		},
	});
}

// ──────────────────────────────────────────────────────────────────────────────
// Create
// ──────────────────────────────────────────────────────────────────────────────

export async function createPurchaseOrder(params: {
	organizationId: string;
	createdById: string;
	warehouseId: string;
	supplierId: string;
	poNumber: string;
	expectedDate?: Date;
	notes?: string;
	lines: Array<{
		skuId: string;
		uomId?: string;
		orderedQty: number;
		unitCost?: number;
		expectedDate?: Date;
	}>;
}) {
	const order = await db.purchaseOrder.create({
		data: {
			warehouseId: params.warehouseId,
			supplierId: params.supplierId,
			poNumber: params.poNumber,
			status: "DRAFT",
			expectedAt: params.expectedDate,
			items: {
				create: params.lines.map((line, index) => ({
					skuId: line.skuId,
					orderedQty: line.orderedQty,
					unitPrice: line.unitCost,
				})),
			},
		},
		select: {
			id: true,
			poNumber: true,
			status: true,
		},
	});

	return { order };
}

export async function createSalesOrder(params: {
	organizationId: string;
	createdById: string;
	warehouseId: string;
	customerId?: string;
	orderNumber: string;
	customerName?: string;
	customerEmail?: string;
	customerRef?: string;
	priority?: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
	requestedShipDate?: Date;
	requiredByDate?: Date;
	notes?: string;
	lines: Array<{
		skuId: string;
		uomId?: string;
		orderedQty: number;
		unitPrice?: number;
	}>;
}) {
	const order = await db.salesOrder.create({
		data: {
			warehouseId: params.warehouseId,
			customerId: params.customerId!,
			orderNumber: params.orderNumber,
			status: "DRAFT",
			items: {
				create: params.lines.map((line, index) => ({
					skuId: line.skuId,
					orderedQty: line.orderedQty,
				})),
			},
		},
		select: {
			id: true,
			orderNumber: true,
			status: true,
		},
	});

	return { order };
}

export async function createTransfer(params: {
	organizationId: string;
	performedByUserId: string;
	warehouseId: string;
	skuId: string;
	fromLocationId?: string;
	toLocationId?: string;
	quantity: number;
	referenceId?: string;
	notes?: string;
}) {
	const transfer = await db.inventoryTransaction.create({
		data: {
			warehouseId: params.warehouseId,
			skuId: params.skuId,
			transactionType: "MOVE",
			fromLocationId: params.fromLocationId,
			toLocationId: params.toLocationId,
			quantity: params.quantity,
			referenceId: params.referenceId,
			metadata: { notes: params.notes },
			performedById: params.performedByUserId,
		},
		select: {
			id: true,
			referenceId: true,
			transactionType: true,
		},
	});

	return { transfer };
}

export async function createShipment(params: {
	organizationId: string;
	warehouseId: string;
	salesOrderId: string;
	shipmentNumber: string;
	trackingNumber?: string;
	carrierId?: string;
	dockDoorId?: string;
	scheduledAt?: Date;
	notes?: string;
}) {
	const shipment = await db.shipment.create({
		data: {
			warehouseId: params.warehouseId,
			salesOrderId: params.salesOrderId,
			shipmentNumber: params.shipmentNumber,
			trackingNumber: params.trackingNumber,
			status: "PENDING",
			carrier: params.carrierId,
			dockDoorId: params.dockDoorId,
			scheduledAt: params.scheduledAt,
			notes: params.notes,
		},
		select: {
			id: true,
			shipmentNumber: true,
			trackingNumber: true,
			status: true,
		},
	});

	return { shipment };
}

export async function createWave(params: {
	organizationId: string;
	warehouseId: string;
	waveNumber: string;
	salesOrderIds: string[];
}) {
	const wave = await db.pickWave.create({
		data: {
			warehouseId: params.warehouseId,
			waveNumber: params.waveNumber,
			status: "CREATED",
		},
		select: {
			id: true,
			waveNumber: true,
			status: true,
		},
	});

	return { wave };
}
