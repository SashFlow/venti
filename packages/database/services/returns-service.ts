import { db } from "../prisma";
import type { ReturnDisposition } from "../prisma/generated/client";
import { adjustInventory } from "./inventory-service";
import { suggestPutawayLocation } from "./putaway-service";

export async function listReturnOrders(params: {
	organizationId: string;
	limit?: number;
}) {
	const orders = await db.returnOrder.findMany({
		where: {
			warehouse: { organizationId: params.organizationId },
		},
		orderBy: { createdAt: "desc" },
		take: params.limit ?? 20,
		include: {
			customer: { select: { id: true, name: true } },
			warehouse: { select: { id: true, name: true } },
			items: {
				include: {
					sku: { select: { id: true, code: true, barcode: true } },
				},
			},
		},
	});

	return orders;
}

export async function completeReturnDisposition(params: {
	organizationId: string;
	returnOrderId: string;
	itemId: string;
	disposition: ReturnDisposition;
	inspectionPassed: boolean;
	userId: string;
	locationId?: string;
}) {
	const item = await db.returnOrderItem.findFirst({
		where: {
			id: params.itemId,
			returnOrderId: params.returnOrderId,
			returnOrder: {
				warehouse: { organizationId: params.organizationId },
			},
		},
		include: {
			sku: true,
			returnOrder: {
				include: { warehouse: true },
			},
		},
	});

	if (!item) {
		throw new Error("Return item not found.");
	}

	await db.returnInspection.create({
		data: {
			returnOrderId: params.returnOrderId,
			inspectedById: params.userId,
			result: params.inspectionPassed ? "PASSED" : "FAILED",
			notes: `Disposition: ${params.disposition}`,
		},
	});

	await db.returnOrderItem.update({
		where: { id: params.itemId },
		data: { disposition: params.disposition },
	});

	let restockLocationCode: string | null = null;

	if (params.disposition === "RESTOCK" && params.inspectionPassed) {
		const warehouseId = item.returnOrder.warehouseId;
		let locationId = params.locationId;
		if (!locationId) {
			const suggestion = await suggestPutawayLocation({
				organizationId: params.organizationId,
				warehouseId,
				skuId: item.skuId,
			});
			locationId = suggestion.locationId;
			restockLocationCode = suggestion.locationCode;
		}

		await adjustInventory({
			organizationId: params.organizationId,
			warehouseId,
			locationId,
			skuId: item.skuId,
			quantityChange: Number(item.quantity),
			reason: `Return RESTOCK — ${item.returnOrder.returnNumber}`,
			userId: params.userId,
		});
	}

	await db.returnOrder.update({
		where: { id: params.returnOrderId },
		data: { status: "COMPLETED" },
	});

	return {
		returnOrderId: params.returnOrderId,
		itemId: params.itemId,
		disposition: params.disposition,
		restockLocationCode,
	};
}
