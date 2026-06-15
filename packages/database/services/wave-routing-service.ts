import { optimizeRoutes, type RouteStop, type WaveRoutePlan } from "@repo/utils";
import { db } from "../prisma";

type LocationRow = {
	id: string;
	code: string;
	type: string;
	parentLocationId: string | null;
	x: unknown;
	y: unknown;
	z: unknown;
};

function num(v: unknown): number {
	if (v == null) {
		return 0;
	}
	return typeof v === "number" ? v : Number(v);
}

function toPoint(loc: LocationRow) {
	const x = num(loc.x);
	const z = num(loc.z);
	const y = num(loc.y);
	// Designer saves mm; seed saves metres — normalise to metres for routing
	const scale = Math.abs(x) > 500 || Math.abs(z) > 500 ? 0.001 : 1;
	return {
		x: x * scale,
		y: y * scale,
		z: z * scale,
	};
}

function resolveZoneCode(
	locationId: string,
	byId: Map<string, LocationRow>,
): string {
	let current = byId.get(locationId);
	while (current) {
		if (current.type === "ZONE") {
			return current.code;
		}
		current = current.parentLocationId
			? byId.get(current.parentLocationId)
			: undefined;
	}
	return "DEFAULT";
}

async function allocatePickLocations(params: {
	waveId: string;
	warehouseId: string;
	lines: Array<{
		id: string;
		qtyToPick: unknown;
		salesOrderItem: { skuId: string; salesOrderId: string };
	}>;
	byId: Map<string, LocationRow>;
	warnings: string[];
}): Promise<Map<string, string>> {
	const lineToLocation = new Map<string, string>();

	for (const line of params.lines) {
		const qtyNeeded = Number(line.qtyToPick);
		const balances = await db.inventoryBalance.findMany({
			where: {
				warehouseId: params.warehouseId,
				skuId: line.salesOrderItem.skuId,
				state: "AVAILABLE",
				quantityAvailable: { gte: qtyNeeded },
			},
			include: { location: true },
			orderBy: { quantityAvailable: "desc" },
		});

		const preferred = balances.filter((b) => {
			const type = b.location?.type;
			return type === "BIN" || type === "PALLET" || type === "BLOCK";
		});

		const pick =
			preferred[0] ??
			balances.sort((a, b) =>
				(a.location?.code ?? "").localeCompare(b.location?.code ?? ""),
			)[0];

		if (!pick?.locationId) {
			params.warnings.push(
				`No stock found for line ${line.id} (SKU ${line.salesOrderItem.skuId}).`,
			);
			continue;
		}

		lineToLocation.set(line.id, pick.locationId);
		await db.pickWaveLine.update({
			where: { id: line.id },
			data: { locationId: pick.locationId },
		});
	}

	return lineToLocation;
}

export async function releaseAndOptimizeWave(params: {
	organizationId: string;
	waveId: string;
	releasedByUserId: string;
	pickerCount?: number;
}): Promise<{ wave: unknown; routePlan: WaveRoutePlan }> {
	const pickerCount = params.pickerCount ?? 3;
	const warnings: string[] = [];

	const wave = await db.pickWave.findFirst({
		where: {
			id: params.waveId,
			warehouse: { organizationId: params.organizationId },
		},
		include: {
			warehouse: { select: { id: true, name: true } },
			lines: {
				include: {
					salesOrderItem: {
						include: {
							sku: { select: { id: true, code: true } },
						},
					},
				},
				orderBy: { id: "asc" },
			},
		},
	});

	if (!wave) {
		throw new Error("Wave not found.");
	}

	if (wave.status !== "CREATED") {
		throw new Error("Wave has already been released.");
	}

	const locations = await db.location.findMany({
		where: { warehouseId: wave.warehouseId },
		select: {
			id: true,
			code: true,
			type: true,
			parentLocationId: true,
			x: true,
			y: true,
			z: true,
		},
	});

	const byId = new Map(locations.map((l) => [l.id, l]));

	const lineToLocation = await allocatePickLocations({
		waveId: wave.id,
		warehouseId: wave.warehouseId,
		lines: wave.lines,
		byId,
		warnings,
	});

	const routeStops: RouteStop[] = [];

	for (const line of wave.lines) {
		const locationId = lineToLocation.get(line.id);
		if (!locationId) {
			continue;
		}
		const loc = byId.get(locationId);
		if (!loc) {
			continue;
		}
		routeStops.push({
			lineId: line.id,
			locationId,
			locationCode: loc.code,
			skuCode: line.salesOrderItem.sku.code,
			zoneCode: resolveZoneCode(locationId, byId),
			salesOrderId: line.salesOrderItem.salesOrderId,
			point: toPoint(loc),
		});
	}

	const outboundZone = locations.find((l) =>
		l.code.toUpperCase().includes("OUT"),
	);
	const entryPoint = outboundZone ? toPoint(outboundZone) : undefined;

	const routePlan = optimizeRoutes(routeStops, {
		pickerCount,
		waveType: wave.type,
		entryPoint,
	});

	if (warnings.length > 0) {
		routePlan.warnings = [...(routePlan.warnings ?? []), ...warnings];
	}

	await db.$transaction(async (tx) => {
		await tx.pickWave.update({
			where: { id: wave.id },
			data: {
				status: "RELEASED",
				releasedAt: new Date(),
				releasedByUserId: params.releasedByUserId,
				routePlan: routePlan as object,
				naiveDistanceM: routePlan.naiveDistanceM,
				optimizedDistanceM: routePlan.optimizedDistanceM,
				savingsPercent: routePlan.savingsPercent,
				pickerCount: routePlan.pickerCount,
			},
		});

		for (const picker of routePlan.pickers) {
			for (const stop of picker.stops) {
				await tx.pickWaveLine.update({
					where: { id: stop.lineId },
					data: {
						pickSequence: stop.sequence,
						pickerLabel: picker.label,
						cartId: picker.cartId,
						zoneCode: picker.zoneCode,
						locationId: stop.locationId,
					},
				});
			}
		}
	});

	return {
		wave: {
			id: wave.id,
			waveNumber: wave.waveNumber,
			status: "RELEASED",
		},
		routePlan,
	};
}
