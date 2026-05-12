import { db } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";

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
	carrierId?: string;
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
		organizationId: params.organizationId,
		...(params.supplierId ? { supplierId: params.supplierId } : {}),
		...(params.warehouseId ? { warehouseId: params.warehouseId } : {}),
		...(params.status && params.status.length > 0
			? { status: { in: params.status as Prisma.EnumPurchaseOrderStatusFilter["in"] } }
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
				expectedDate: true,
				supplier: {
					select: { name: true },
				},
				warehouse: {
					select: { name: true },
				},
				_count: {
					select: { lines: true },
				},
			},
		}),
		db.purchaseOrder.count({ where }),
	]);

	return { orders, total };
}

export async function listOutboundOrders(params: OutboundFilterParams) {
	const where: Prisma.SalesOrderWhereInput = {
		organizationId: params.organizationId,
		...(params.customerId ? { customerId: params.customerId } : {}),
		...(params.warehouseId ? { warehouseId: params.warehouseId } : {}),
		...(params.priority ? { priority: params.priority as Prisma.EnumSalesOrderPriorityFilter } : {}),
		...(params.status && params.status.length > 0
			? { status: { in: params.status as Prisma.EnumSalesOrderStatusFilter["in"] } }
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
							customerName: {
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

	const [orders, total] = await Promise.all([
		db.salesOrder.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				orderNumber: true,
				status: true,
				customerName: true,
				customerRef: true,
				createdAt: true,
				requiredByDate: true,
				warehouse: {
					select: { name: true },
				},
				_count: {
					select: { lines: true },
				},
			},
		}),
		db.salesOrder.count({ where }),
	]);

	return { orders, total };
}

export async function listTransfers(params: TransferFilterParams) {
	const where: Prisma.InventoryMovementWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
			...(params.warehouseId ? { id: params.warehouseId } : {}),
		},
		transactionType: "INTERNAL_TRANSFER" as const,
		...(params.status && params.status.length > 0
			? { status: { in: params.status as Prisma.EnumInventoryMovementStatusFilter["in"] } }
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
							referenceNumber: {
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
		db.inventoryMovement.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				referenceNumber: true,
				status: true,
				quantity: true,
				createdAt: true,
				completedAt: true,
				warehouse: {
					select: { name: true },
				},
				fromStorageUnit: {
					select: { code: true },
				},
				toStorageUnit: {
					select: { code: true },
				},
			},
		}),
		db.inventoryMovement.count({ where }),
	]);

	return { transfers, total };
}

export async function listManifests(params: ManifestFilterParams) {
	const where: Prisma.ShipmentWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		status: {
			in: ["DISPATCHED", "IN_TRANSIT", "DELIVERED"],
		},
		...(params.carrierId ? { carrierId: params.carrierId } : {}),
		...(params.startDate || params.endDate
			? {
					createdAt: {
						...(params.startDate ? { gte: params.startDate } : {}),
						...(params.endDate ? { lte: params.endDate } : {}),
					},
				}
			: {}),
	};

	const [manifests, total] = await Promise.all([
		db.shipment.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				shipmentNumber: true,
				createdAt: true,
				status: true,
				carrier: {
					select: { name: true },
				},
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
	const where: Prisma.WaveWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		...(params.status && params.status.length > 0
			? { status: { in: params.status as Prisma.EnumWaveStatusFilter["in"] } }
			: {}),
	};

	const [batches, total] = await Promise.all([
		db.wave.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				waveNumber: true,
				status: true,
				createdAt: true,
				completedAt: true,
				releasedBy: {
					select: { name: true },
				},
				_count: {
					select: { lines: true, salesOrders: true },
				},
			},
		}),
		db.wave.count({ where }),
	]);

	return { batches, total };
}

export async function listFulfillmentShipments(params: ShipmentFilterParams) {
	const where: Prisma.ShipmentWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		status: params.status && params.status.length > 0
			? { in: params.status as Prisma.EnumShipmentStatusFilter["in"] }
			: { in: ["PENDING", "READY_TO_SHIP"] },
	};

	const [shipments, total] = await Promise.all([
		db.shipment.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				shipmentNumber: true,
				status: true,
				createdAt: true,
				scheduledAt: true,
				salesOrder: {
					select: {
						customerName: true,
						customerRef: true,
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
	status: "DRAFT" | "CONFIRMED" | "FULLY_SHIPPED" | "CANCELLED" | "CLOSED";
}) {
	const updated = await db.salesOrder.updateMany({
		where: {
			id: params.orderId,
			organizationId: params.organizationId,
		},
		data: {
			status: params.status,
			...(params.status === "FULLY_SHIPPED"
				? { shippedAt: new Date() }
				: {}),
			...(params.status === "CLOSED" ? { closedAt: new Date() } : {}),
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
			updatedAt: true,
		},
	});
}

export async function completeTransfer(params: {
	organizationId: string;
	transferId: string;
}) {
	const updated = await db.inventoryMovement.updateMany({
		where: {
			id: params.transferId,
			warehouse: {
				organizationId: params.organizationId,
			},
			transactionType: "INTERNAL_TRANSFER",
		},
		data: {
			status: "COMPLETED",
			completedAt: new Date(),
		},
	});

	if (updated.count === 0) {
		return null;
	}

	return db.inventoryMovement.findUnique({
		where: { id: params.transferId },
		select: {
			id: true,
			status: true,
			completedAt: true,
		},
	});
}

export async function updateShipmentStatus(params: {
	organizationId: string;
	shipmentId: string;
	status: "READY_TO_SHIP" | "DISPATCHED" | "DELIVERED";
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
			...(params.status === "DISPATCHED"
				? { dispatchedAt: new Date() }
				: {}),
			...(params.status === "DELIVERED"
				? { deliveredAt: new Date() }
				: {}),
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
			updatedAt: true,
		},
	});
}

export async function bulkUpdateOutboundOrderStatus(params: {
	organizationId: string;
	orderIds: string[];
	status: "DRAFT" | "CONFIRMED" | "FULLY_SHIPPED" | "CANCELLED" | "CLOSED";
}) {
	const uniqueOrderIds = [...new Set(params.orderIds)];
	const targetOrders = await db.salesOrder.findMany({
		where: {
			organizationId: params.organizationId,
			id: { in: uniqueOrderIds },
		},
		select: {
			id: true,
			status: true,
		},
	});

	const actionableOrderIds = targetOrders
		.filter((order) => {
			if (params.status !== "FULLY_SHIPPED") {
				return true;
			}

			return !["FULLY_SHIPPED", "CANCELLED", "CLOSED"].includes(
				order.status,
			);
		})
		.map((order) => order.id);

	const updated = await db.salesOrder.updateMany({
		where: {
			organizationId: params.organizationId,
			id: { in: actionableOrderIds },
		},
		data: {
			status: params.status,
			...(params.status === "FULLY_SHIPPED"
				? { shippedAt: new Date() }
				: {}),
			...(params.status === "CLOSED" ? { closedAt: new Date() } : {}),
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
		status: "READY_TO_SHIP" | "DISPATCHED" | "DELIVERED";
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
					...(update.status === "DISPATCHED"
						? { dispatchedAt: new Date() }
						: {}),
					...(update.status === "DELIVERED"
						? { deliveredAt: new Date() }
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
		where: { id: params.orderId, organizationId: params.organizationId },
		select: {
			id: true,
			poNumber: true,
			status: true,
			createdAt: true,
			updatedAt: true,
			expectedDate: true,
			orderedAt: true,
			closedAt: true,
			notes: true,
			supplier: { select: { id: true, name: true } },
			warehouse: { select: { id: true, name: true } },
			createdBy: { select: { name: true } },
			approvedBy: { select: { name: true } },
			approvedAt: true,
			lines: {
				orderBy: { lineNumber: "asc" },
				select: {
					id: true,
					lineNumber: true,
					orderedQty: true,
					receivedQty: true,
					unitCost: true,
					status: true,
					expectedDate: true,
					sku: { select: { id: true, name: true, sku: true } },
					uom: { select: { id: true, name: true, abbreviation: true } },
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
		where: { id: params.orderId, organizationId: params.organizationId },
		select: {
			id: true,
			orderNumber: true,
			status: true,
			priority: true,
			customerName: true,
			customerEmail: true,
			customerRef: true,
			createdAt: true,
			updatedAt: true,
			requestedShipDate: true,
			requiredByDate: true,
			shippedAt: true,
			closedAt: true,
			notes: true,
			shippingAddress: true,
			warehouse: { select: { id: true, name: true } },
			customer: { select: { id: true, name: true } },
			createdBy: { select: { name: true } },
			lines: {
				orderBy: { lineNumber: "asc" },
				select: {
					id: true,
					lineNumber: true,
					orderedQty: true,
					allocatedQty: true,
					pickedQty: true,
					shippedQty: true,
					unitPrice: true,
					status: true,
					sku: { select: { id: true, name: true, sku: true } },
					uom: { select: { id: true, name: true, abbreviation: true } },
				},
			},
		},
	});
}

export async function getTransferById(params: {
	organizationId: string;
	transferId: string;
}) {
	return db.inventoryMovement.findFirst({
		where: {
			id: params.transferId,
			transactionType: "INTERNAL_TRANSFER",
			warehouse: { organizationId: params.organizationId },
		},
		select: {
			id: true,
			referenceNumber: true,
			status: true,
			quantity: true,
			notes: true,
			createdAt: true,
			updatedAt: true,
			startedAt: true,
			completedAt: true,
			warehouse: { select: { id: true, name: true } },
			fromStorageUnit: { select: { id: true, code: true } },
			toStorageUnit: { select: { id: true, code: true } },
			inventoryItem: {
				select: {
					id: true,
					sku: { select: { id: true, name: true, sku: true } },
				},
			},
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
			shipmentNumber: true,
			status: true,
			trackingNumber: true,
			notes: true,
			shippingAddress: true,
			scheduledAt: true,
			dispatchedAt: true,
			deliveredAt: true,
			createdAt: true,
			updatedAt: true,
			warehouse: { select: { id: true, name: true } },
			carrier: { select: { id: true, name: true } },
			dockDoor: { select: { id: true, name: true } },
			salesOrder: {
				select: {
					id: true,
					orderNumber: true,
					customerName: true,
					customerRef: true,
				},
			},
			dispatchedBy: { select: { name: true } },
			lines: {
				select: {
					id: true,
					shippedQty: true,
					batchNumber: true,
					serialNumbers: true,
					sku: { select: { id: true, name: true, sku: true } },
				},
			},
		},
	});
}

export async function getWaveById(params: {
	organizationId: string;
	waveId: string;
}) {
	return db.wave.findFirst({
		where: {
			id: params.waveId,
			warehouse: { organizationId: params.organizationId },
		},
		select: {
			id: true,
			waveNumber: true,
			type: true,
			status: true,
			notes: true,
			createdAt: true,
			updatedAt: true,
			releasedAt: true,
			completedAt: true,
			warehouse: { select: { id: true, name: true } },
			releasedBy: { select: { name: true } },
			salesOrders: {
				select: {
					id: true,
					orderNumber: true,
					customerName: true,
					status: true,
				},
			},
			lines: {
				select: {
					id: true,
					qtyToPick: true,
					qtyPicked: true,
					salesOrderLine: {
						select: {
							lineNumber: true,
							sku: { select: { id: true, name: true, sku: true } },
							salesOrder: { select: { orderNumber: true } },
						},
					},
				},
			},
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
			organizationId: params.organizationId,
			warehouseId: params.warehouseId,
			supplierId: params.supplierId,
			poNumber: params.poNumber,
			status: "DRAFT",
			expectedDate: params.expectedDate,
			notes: params.notes,
			createdById: params.createdById,
			lines: {
				create: params.lines.map((line, index) => ({
					lineNumber: index + 1,
					skuId: line.skuId,
					uomId: line.uomId,
					orderedQty: line.orderedQty,
					unitCost: line.unitCost,
					expectedDate: line.expectedDate,
					status: "PENDING" as const,
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
			organizationId: params.organizationId,
			warehouseId: params.warehouseId,
			customerId: params.customerId,
			orderNumber: params.orderNumber,
			customerName: params.customerName,
			customerEmail: params.customerEmail,
			customerRef: params.customerRef,
			priority: params.priority ?? "NORMAL",
			status: "DRAFT",
			requestedShipDate: params.requestedShipDate,
			requiredByDate: params.requiredByDate,
			notes: params.notes,
			createdById: params.createdById,
			lines: {
				create: params.lines.map((line, index) => ({
					lineNumber: index + 1,
					skuId: line.skuId,
					uomId: line.uomId,
					orderedQty: line.orderedQty,
					unitPrice: line.unitPrice,
					status: "PENDING" as const,
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
	inventoryItemId: string;
	fromStorageUnitId?: string;
	toStorageUnitId?: string;
	quantity: number;
	referenceNumber?: string;
	notes?: string;
}) {
	const transfer = await db.inventoryMovement.create({
		data: {
			warehouseId: params.warehouseId,
			inventoryItemId: params.inventoryItemId,
			transactionType: "INTERNAL_TRANSFER",
			status: "PENDING",
			fromStorageUnitId: params.fromStorageUnitId,
			toStorageUnitId: params.toStorageUnitId,
			quantity: params.quantity,
			referenceNumber: params.referenceNumber,
			notes: params.notes,
			performedByUserId: params.performedByUserId,
		},
		select: {
			id: true,
			referenceNumber: true,
			status: true,
		},
	});

	return { transfer };
}

export async function createShipment(params: {
	organizationId: string;
	warehouseId: string;
	salesOrderId: string;
	shipmentNumber: string;
	carrierId?: string;
	dockDoorId?: string;
	trackingNumber?: string;
	scheduledAt?: Date;
	notes?: string;
}) {
	const shipment = await db.shipment.create({
		data: {
			warehouseId: params.warehouseId,
			salesOrderId: params.salesOrderId,
			shipmentNumber: params.shipmentNumber,
			status: "PENDING",
			carrierId: params.carrierId,
			dockDoorId: params.dockDoorId,
			trackingNumber: params.trackingNumber,
			scheduledAt: params.scheduledAt,
			notes: params.notes,
		},
		select: {
			id: true,
			shipmentNumber: true,
			status: true,
		},
	});

	return { shipment };
}

export async function createWave(params: {
	organizationId: string;
	releasedById: string;
	warehouseId: string;
	waveNumber: string;
	type: "SINGLE_ORDER" | "BATCH" | "ZONE" | "CLUSTER";
	salesOrderIds: string[];
	notes?: string;
}) {
	const wave = await db.wave.create({
		data: {
			warehouseId: params.warehouseId,
			waveNumber: params.waveNumber,
			type: params.type,
			status: "DRAFT",
			notes: params.notes,
			releasedById: params.releasedById,
			salesOrders: {
				connect: params.salesOrderIds.map((id) => ({ id })),
			},
		},
		select: {
			id: true,
			waveNumber: true,
			status: true,
		},
	});

	return { wave };
}
