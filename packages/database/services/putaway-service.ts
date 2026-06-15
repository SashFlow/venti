import { db } from "../prisma";

export async function suggestPutawayLocation(params: {
	organizationId: string;
	warehouseId: string;
	skuId: string;
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

	const existingBalance = await db.inventoryBalance.findFirst({
		where: {
			warehouseId: params.warehouseId,
			skuId: params.skuId,
			state: "AVAILABLE",
			quantityAvailable: { gt: 0 },
		},
		include: { location: true },
		orderBy: { quantityAvailable: "desc" },
	});

	if (existingBalance?.location) {
		return {
			locationId: existingBalance.locationId,
			locationCode: existingBalance.location.code,
			reason: "Consolidate with existing stock for this SKU",
		};
	}

	const bins = await db.location.findMany({
		where: {
			warehouseId: params.warehouseId,
			type: "BIN",
		},
		select: {
			id: true,
			code: true,
			parentLocationId: true,
		},
	});

	const occupied = await db.inventoryBalance.findMany({
		where: {
			warehouseId: params.warehouseId,
			quantityAvailable: { gt: 0 },
		},
		select: { locationId: true },
	});
	const occupiedIds = new Set(occupied.map((o) => o.locationId));

	const receivingBin = bins.find(
		(b) =>
			!occupiedIds.has(b.id) &&
			(b.code.toUpperCase().includes("RCV") ||
				b.code.toUpperCase().includes("RECV") ||
				b.code.toUpperCase().includes("STAGE")),
	);

	if (receivingBin) {
		return {
			locationId: receivingBin.id,
			locationCode: receivingBin.code,
			reason: "Empty receiving/staging bin",
		};
	}

	const emptyBin = bins.find((b) => !occupiedIds.has(b.id));
	if (emptyBin) {
		return {
			locationId: emptyBin.id,
			locationCode: emptyBin.code,
			reason: "Nearest available empty bin",
		};
	}

	const fallback = bins[0];
	if (fallback) {
		return {
			locationId: fallback.id,
			locationCode: fallback.code,
			reason: "Default bin (warehouse full — demo)",
		};
	}

	throw new Error("No putaway location available.");
}
