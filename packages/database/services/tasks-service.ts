import type { TaskPriority, WarehouseTaskType } from "../prisma/generated/client";
import { db } from "../prisma";

export async function createWarehouseTask(params: {
	organizationId: string;
	warehouseId: string;
	type: WarehouseTaskType;
	skuId?: string;
	quantity?: number;
	fromLocationId?: string;
	toLocationId?: string;
	priority?: TaskPriority;
}) {
	const warehouse = await db.warehouse.findFirst({
		where: {
			id: params.warehouseId,
			organizationId: params.organizationId,
		},
	});

	if (!warehouse) {
		throw new Error("Warehouse not found.");
	}

	return db.warehouseTask.create({
		data: {
			warehouseId: params.warehouseId,
			type: params.type,
			status: "PENDING",
			priority: params.priority ?? "NORMAL",
			skuId: params.skuId,
			quantity: params.quantity,
			fromLocationId: params.fromLocationId,
			toLocationId: params.toLocationId,
		},
		include: {
			sku: { select: { id: true, code: true } },
			fromLocation: { select: { id: true, code: true } },
			toLocation: { select: { id: true, code: true } },
			warehouse: { select: { id: true, name: true, code: true } },
		},
	});
}

export async function listRecentWarehouseTasks(params: {
	organizationId: string;
	warehouseId?: string;
	limit?: number;
}) {
	const limit = params.limit ?? 20;

	return db.warehouseTask.findMany({
		where: {
			warehouse: {
				organizationId: params.organizationId,
				...(params.warehouseId ? { id: params.warehouseId } : {}),
			},
		},
		orderBy: { createdAt: "desc" },
		take: limit,
		include: {
			sku: { select: { code: true } },
			fromLocation: { select: { code: true } },
			toLocation: { select: { code: true } },
			warehouse: { select: { name: true, code: true } },
			assignedUser: { select: { name: true } },
		},
	});
}
