import { db } from "@repo/database";

interface PutawaySuggestion {
	storageUnitId: string;
	storageUnitCode: string;
	storageUnitName: string | null;
	zoneType: string | null;
	qtyOnHand: number;
	maxUnits: number | null;
	fillRatePct: number;
	distanceMm: number;
	hasSameSku: boolean;
	score: number;
}

/**
 * Score a set of candidate bins for putaway.
 *
 * Scoring (lower = better rank):
 *   score = distanceMm * 0.001 + fillRatePct - (hasSameSku ? 20 : 0)
 *
 * Returns up to `limit` suggestions sorted by score ascending.
 */
export async function suggestPutawayLocations(params: {
	warehouseId: string;
	skuId: string;
	limit?: number;
}): Promise<PutawaySuggestion[]> {
	const { warehouseId, skuId, limit = 3 } = params;

	// Find the INBOUND zone origin to use as "start position" for distance
	const inboundZone = await db.zone.findFirst({
		where: { warehouseId, type: "INBOUND" },
		select: {
			storageUnits: { select: { startX: true, startY: true }, take: 1 },
		},
	});

	const originX = Number(inboundZone?.storageUnits[0]?.startX ?? 0);
	const originY = Number(inboundZone?.storageUnits[0]?.startY ?? 0);

	// Fetch all active, storable, non-blocked bins in this warehouse
	const bins = await db.storageUnit.findMany({
		where: {
			warehouseId,
			isStorable: true,
			isBlocked: false,
			isInboundAllowed: true,
			status: "ACTIVE",
		},
		select: {
			id: true,
			code: true,
			name: true,
			startX: true,
			startY: true,
			maxUnits: true,
			zone: { select: { type: true } },
			inventoryBalances: {
				where: { warehouseId },
				select: { qtyOnHand: true, skuId: true },
			},
		},
	});

	const suggestions: PutawaySuggestion[] = bins.map((bin) => {
		const totalOnHand = bin.inventoryBalances.reduce(
			(s, b) => s + Number(b.qtyOnHand),
			0,
		);
		const maxUnits = bin.maxUnits ?? null;
		const fillRatePct =
			maxUnits && maxUnits > 0 ? (totalOnHand / maxUnits) * 100 : 0;

		const dx = Number(bin.startX ?? 0) - originX;
		const dy = Number(bin.startY ?? 0) - originY;
		const distanceMm = Math.sqrt(dx * dx + dy * dy);

		const hasSameSku = bin.inventoryBalances.some((b) => b.skuId === skuId);

		const score = distanceMm * 0.001 + fillRatePct - (hasSameSku ? 20 : 0);

		return {
			storageUnitId: bin.id,
			storageUnitCode: bin.code,
			storageUnitName: bin.name,
			zoneType: bin.zone?.type ?? null,
			qtyOnHand: totalOnHand,
			maxUnits,
			fillRatePct: Math.round(fillRatePct * 10) / 10,
			distanceMm: Math.round(distanceMm),
			hasSameSku,
			score,
		};
	});

	// Skip fully occupied bins
	const eligible = suggestions.filter(
		(s) => s.maxUnits === null || s.qtyOnHand < s.maxUnits,
	);

	eligible.sort((a, b) => a.score - b.score);

	return eligible.slice(0, limit);
}
