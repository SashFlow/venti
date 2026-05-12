import { db } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";

type ListParams = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

export async function listInboundOrders(params: ListParams) {
	const where = {
		organizationId: params.organizationId,
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

export async function listOutboundOrders(params: ListParams) {
	const where = {
		organizationId: params.organizationId,
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

export async function listTransfers(params: ListParams) {
	const where = {
		warehouse: {
			organizationId: params.organizationId,
		},
		transactionType: "INTERNAL_TRANSFER" as const,
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

export async function listManifests(params: {
	organizationId: string;
	limit: number;
	offset: number;
}) {
	const where: Prisma.ShipmentWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		status: {
			in: ["DISPATCHED", "IN_TRANSIT", "DELIVERED"],
		},
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

export async function listFulfillmentBatches(params: {
	organizationId: string;
	limit: number;
	offset: number;
}) {
	const where = {
		warehouse: {
			organizationId: params.organizationId,
		},
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

export async function listFulfillmentShipments(params: {
	organizationId: string;
	limit: number;
	offset: number;
}) {
	const where: Prisma.ShipmentWhereInput = {
		warehouse: {
			organizationId: params.organizationId,
		},
		status: {
			in: ["PENDING", "READY_TO_SHIP"],
		},
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
