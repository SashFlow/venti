import { db } from "@repo/database";

/**
 * Suggest a putaway bin for a given warehouse + weight class combination.
 *
 * Routing rules:
 *   HEAVY → GROUND_FLOOR levels → BULK/RACKING zones → PALLET_SLOT/DOCK bins
 *            (prefers forkliftRequired = true)
 *   LIGHT → MEZZANINE levels → any zone → MEZZANINE_SHELF/BIN bins
 *
 * Returns the first available (active) bin ID, or null if no suitable bin exists.
 * When null is returned the caller should prompt the operator to assign manually.
 */
export async function suggestPutawayBin(
	warehouseId: string,
	weightClass: "LIGHT" | "HEAVY",
	overrideZoneType?: string,
): Promise<string | null> {
	if (weightClass === "HEAVY") {
		// Ground floor, pallet-capable bins
		const bin = await db.warehouseBin.findFirst({
			where: {
				active: true,
				aisle: {
					zone: {
						active: true,
						type: overrideZoneType
							? { equals: overrideZoneType as never }
							: { in: ["BULK", "RACKING"] as never[] },
						level: {
							active: true,
							type: "GROUND_FLOOR",
							warehouseId,
						},
					},
				},
				type: { in: ["PALLET_SLOT", "DOCK"] as never[] },
			},
			orderBy: [{ forkliftRequired: "desc" }, { sequence: "asc" }],
		});
		return bin?.id ?? null;
	}

	// LIGHT → Mezzanine
	const bin = await db.warehouseBin.findFirst({
		where: {
			active: true,
			aisle: {
				zone: {
					active: true,
					type: overrideZoneType
						? { equals: overrideZoneType as never }
						: undefined,
					level: {
						active: true,
						type: "MEZZANINE",
						warehouseId,
					},
				},
			},
			type: { in: ["MEZZANINE_SHELF", "BIN"] as never[] },
		},
		orderBy: { sequence: "asc" },
	});
	return bin?.id ?? null;
}

/**
 * Find the first bin of a given zone type in a warehouse — used to route
 * defective/QC-hold items to their designated hold zones.
 */
export async function findZoneBin(
	warehouseId: string,
	zoneType: string,
): Promise<string | null> {
	const bin = await db.warehouseBin.findFirst({
		where: {
			active: true,
			aisle: {
				zone: {
					active: true,
					type: { equals: zoneType as never },
					level: {
						active: true,
						warehouseId,
					},
				},
			},
		},
		orderBy: { sequence: "asc" },
	});
	return bin?.id ?? null;
}
