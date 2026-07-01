import { db } from "../prisma";

export type PredictiveDemandRecommendation = {
	skuId: string;
	skuCode: string;
	description: string;
	warehouseId: string;
	warehouseName: string;
	onHand: number;
	dailyVelocity: number;
	daysOfCover: number;
	riskFactor: number;
	suggestedQty: number;
	locationId?: string;
};

export type DeadStockOpportunity = {
	insightKey: string;
	skuId: string;
	skuCode: string;
	description: string;
	currentWarehouseId: string;
	currentWarehouse: string;
	proposedWarehouseId?: string;
	proposedWarehouse?: string;
	qtyToMove: number;
	fromLocationId?: string;
	toLocationId?: string;
	estimatedHoldingCostNext6Months: number;
	estimatedFreightCost: number;
	netSavings: number;
	action: string;
};

export type MaintenanceAlert = {
	insightKey: string;
	customerLocationId: string;
	unitId: string;
	alertType: string;
	confidence: number;
	daysToFailureEstimate: number;
	skuId: string;
	skuCode: string;
	locationId?: string;
	requiredParts: Array<{
		skuCode: string;
		qty: number;
		availableInLocalWarehouse: boolean;
	}>;
	action: string;
};

function isExtremeHeatEnabled(metadata: unknown): boolean {
	if (!metadata || typeof metadata !== "object") {
		return true;
	}
	const meta = metadata as Record<string, unknown>;
	if (meta.demoExtremeHeat === false) {
		return false;
	}
	return true;
}

export async function getDismissedInsightKeys(
	organizationId: string,
): Promise<Set<string>> {
	const rows = await db.insightDismissal.findMany({
		where: { organizationId },
		select: { insightKey: true },
	});
	return new Set(rows.map((r) => r.insightKey));
}

export async function dismissInsight(params: {
	organizationId: string;
	insightKey: string;
	dismissedByUserId?: string;
}) {
	return db.insightDismissal.upsert({
		where: {
			organizationId_insightKey: {
				organizationId: params.organizationId,
				insightKey: params.insightKey,
			},
		},
		create: {
			organizationId: params.organizationId,
			insightKey: params.insightKey,
			dismissedByUserId: params.dismissedByUserId,
		},
		update: {
			dismissedAt: new Date(),
			dismissedByUserId: params.dismissedByUserId,
		},
	});
}

export async function getPredictiveDemandInsights(organizationId: string) {
	const org = await db.organization.findUnique({
		where: { id: organizationId },
		select: { metadata: true },
	});

	const extremeHeat = isExtremeHeatEnabled(org?.metadata);
	const dismissed = await getDismissedInsightKeys(organizationId);

	if (dismissed.has("demand:EXTREME_HEAT")) {
		return {
			extremeHeat,
			forecast: extremeHeat
				? {
						condition: "EXTREME_HEAT",
						temperatures: [102, 105, 104, 101, 99],
						riskLevel: "HIGH",
					}
				: null,
			recommendations: [] as PredictiveDemandRecommendation[],
			action: "No active weather-driven recommendations.",
			dataSources: { weather: "simulated", inventory: "live" },
		};
	}

	if (!extremeHeat) {
		return {
			extremeHeat: false,
			forecast: null,
			recommendations: [],
			action: "Weather conditions are normal.",
			dataSources: { weather: "simulated", inventory: "live" },
		};
	}

	type VelocityRow = {
		sku_id: string;
		sku_code: string;
		product_name: string;
		warehouse_id: string;
		warehouse_name: string;
		on_hand: number;
		ship_qty_30d: number;
		location_id: string | null;
	};

	const rows = await db.$queryRaw<VelocityRow[]>`
		WITH velocity AS (
			SELECT
				it."skuId" AS sku_id,
				it."warehouseId" AS warehouse_id,
				COALESCE(SUM(ABS(it.quantity::float)), 0) AS ship_qty_30d
			FROM "InventoryTransaction" it
			INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			  AND it."transactionType" = 'SHIP'
			  AND it."createdAt" >= NOW() - INTERVAL '30 days'
			GROUP BY it."skuId", it."warehouseId"
		),
		on_hand AS (
			SELECT
				ib."skuId" AS sku_id,
				ib."warehouseId" AS warehouse_id,
				COALESCE(SUM(ib."quantityAvailable"::float), 0) AS on_hand,
				MIN(ib."locationId") AS location_id
			FROM "InventoryBalance" ib
			INNER JOIN "Warehouse" w ON w.id = ib."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			  AND ib."quantityAvailable" > 0
			  AND ib.state = 'AVAILABLE'
			GROUP BY ib."skuId", ib."warehouseId"
		)
		SELECT
			sku.id AS sku_id,
			sku.code AS sku_code,
			p.name AS product_name,
			w.id AS warehouse_id,
			w.name AS warehouse_name,
			COALESCE(oh.on_hand, 0)::float AS on_hand,
			COALESCE(v.ship_qty_30d, 0)::float AS ship_qty_30d,
			oh.location_id
		FROM "SKU" sku
		INNER JOIN "Product" p ON p.id = sku."productId"
		INNER JOIN on_hand oh ON oh.sku_id = sku.id
		INNER JOIN "Warehouse" w ON w.id = oh.warehouse_id
		LEFT JOIN velocity v ON v.sku_id = sku.id AND v.warehouse_id = oh.warehouse_id
		WHERE p."organizationId" = ${organizationId}
		  AND (
			LOWER(p.name) LIKE '%compressor%'
			OR p."isSerialTracked" = true
		  )
		ORDER BY COALESCE(v.ship_qty_30d, 0) DESC, oh.on_hand ASC
		LIMIT 20
	`;

	const recommendations: PredictiveDemandRecommendation[] = [];

	for (const row of rows) {
		const dailyVelocity = row.ship_qty_30d / 30;
		const daysOfCover =
			dailyVelocity > 0 ? row.on_hand / dailyVelocity : 999;
		const heatThresholdDays = 14;

		if (dailyVelocity > 0 && daysOfCover >= heatThresholdDays) {
			continue;
		}

		const riskFactor = Math.min(
			0.99,
			Math.max(
				0.55,
				dailyVelocity > 0
					? 1 - daysOfCover / heatThresholdDays
					: row.on_hand < 5
						? 0.85
						: 0.6,
			),
		);

		const targetDays = 21;
		const suggestedQty = Math.max(
			1,
			Math.ceil(
				dailyVelocity > 0
					? targetDays * dailyVelocity - row.on_hand
					: 10,
			),
		);

		recommendations.push({
			skuId: row.sku_id,
			skuCode: row.sku_code,
			description: row.product_name,
			warehouseId: row.warehouse_id,
			warehouseName: row.warehouse_name,
			onHand: Math.round(row.on_hand),
			dailyVelocity: Math.round(dailyVelocity * 100) / 100,
			daysOfCover: Math.round(daysOfCover * 10) / 10,
			riskFactor: Math.round(riskFactor * 100) / 100,
			suggestedQty,
			locationId: row.location_id ?? undefined,
		});
	}

	recommendations.sort((a, b) => b.riskFactor - a.riskFactor);

	return {
		extremeHeat: true,
		forecast: {
			condition: "EXTREME_HEAT",
			temperatures: [102, 105, 104, 101, 99],
			riskLevel: "HIGH",
		},
		recommendations: recommendations.slice(0, 5),
		action:
			recommendations.length > 0
				? `Extreme heat forecast — replenish ${recommendations.length} compressor-class SKUs at risk of stockout.`
				: "Extreme heat active but compressor inventory appears adequately covered.",
		dataSources: { weather: "simulated", inventory: "live" },
	};
}

export async function getDeadStockRebalanceOpportunities(
	organizationId: string,
) {
	const dismissed = await getDismissedInsightKeys(organizationId);

	type DeadRow = {
		sku_id: string;
		sku_code: string;
		product_name: string;
		warehouse_id: string;
		warehouse_name: string;
		warehouse_code: string;
		qty: number;
		unit_price: number;
		location_id: string | null;
		last_moved_at: Date | null;
	};

	const rows = await db.$queryRaw<DeadRow[]>`
		WITH last_movement AS (
			SELECT
				it."skuId",
				it."warehouseId",
				MAX(it."createdAt") AS last_moved_at
			FROM "InventoryTransaction" it
			INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			GROUP BY it."skuId", it."warehouseId"
		),
		demand_wh AS (
			SELECT
				it."warehouseId",
				COUNT(*)::int AS ship_count
			FROM "InventoryTransaction" it
			INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			  AND it."transactionType" = 'SHIP'
			  AND it."createdAt" >= NOW() - INTERVAL '30 days'
			GROUP BY it."warehouseId"
			ORDER BY ship_count DESC
			LIMIT 1
		)
		SELECT
			sku.id AS sku_id,
			sku.code AS sku_code,
			p.name AS product_name,
			w.id AS warehouse_id,
			w.name AS warehouse_name,
			w.code AS warehouse_code,
			SUM(ib."quantityAvailable"::float)::float AS qty,
			COALESCE(sku."unitPrice"::float, 0)::float AS unit_price,
			MIN(ib."locationId") AS location_id,
			lm.last_moved_at
		FROM "InventoryBalance" ib
		INNER JOIN "Warehouse" w ON w.id = ib."warehouseId"
		INNER JOIN "SKU" sku ON sku.id = ib."skuId"
		INNER JOIN "Product" p ON p.id = sku."productId"
		LEFT JOIN last_movement lm
			ON lm."skuId" = ib."skuId" AND lm."warehouseId" = ib."warehouseId"
		WHERE w."organizationId" = ${organizationId}
		  AND ib."quantityAvailable" > 0
		  AND ib.state = 'AVAILABLE'
		  AND (lm.last_moved_at IS NULL OR lm.last_moved_at < NOW() - INTERVAL '90 days')
		GROUP BY sku.id, sku.code, p.name, w.id, w.name, w.code, sku."unitPrice", lm.last_moved_at
		ORDER BY SUM(ib."quantityAvailable"::float * COALESCE(sku."unitPrice"::float, 0)) DESC
		LIMIT 10
	`;

	const demandWarehouse = await db.$queryRaw<
		Array<{ id: string; name: string; code: string }>
	>`
		SELECT w.id, w.name, w.code
		FROM "Warehouse" w
		WHERE w."organizationId" = ${organizationId}
		ORDER BY (
			SELECT COUNT(*) FROM "InventoryTransaction" it
			WHERE it."warehouseId" = w.id
			  AND it."transactionType" = 'SHIP'
			  AND it."createdAt" >= NOW() - INTERVAL '30 days'
		) DESC
		LIMIT 1
	`;

	const targetWh = demandWarehouse[0];

	const opportunities: DeadStockOpportunity[] = [];

	for (const row of rows) {
		const insightKey = `deadstock:${row.sku_id}:${row.warehouse_id}`;
		if (dismissed.has(insightKey)) {
			continue;
		}

		const value = row.qty * row.unit_price;
		const holdingCost = value * 0.05;
		const freight = Math.max(250, row.qty * row.unit_price * 0.01);
		const netSavings = holdingCost - freight;

		if (targetWh && targetWh.id === row.warehouse_id) {
			continue;
		}

		opportunities.push({
			insightKey,
			skuId: row.sku_id,
			skuCode: row.sku_code,
			description: row.product_name,
			currentWarehouseId: row.warehouse_id,
			currentWarehouse: row.warehouse_name,
			proposedWarehouseId: targetWh?.id,
			proposedWarehouse: targetWh?.name,
			qtyToMove: Math.round(row.qty),
			fromLocationId: row.location_id ?? undefined,
			estimatedHoldingCostNext6Months:
				Math.round(holdingCost * 100) / 100,
			estimatedFreightCost: Math.round(freight * 100) / 100,
			netSavings: Math.round(netSavings * 100) / 100,
			action: targetWh
				? `Create transfer to ${targetWh.name} to reduce dead capital.`
				: "Review dead stock disposition options.",
		});

		if (opportunities.length >= 3) {
			break;
		}
	}

	return {
		analysisDate: new Date(),
		opportunities,
		dataSources: { inventory: "live", freight: "estimated" },
	};
}

export async function getPredictiveMaintenanceAlerts(organizationId: string) {
	const dismissed = await getDismissedInsightKeys(organizationId);

	type SerialRow = {
		serial_number: string;
		sku_id: string;
		sku_code: string;
		product_name: string;
		location_id: string | null;
		return_count: number;
	};

	const rows = await db.$queryRaw<SerialRow[]>`
		WITH repeat_returns AS (
			SELECT
				roi."skuId",
				ro."customerId",
				COUNT(*)::int AS return_count
			FROM "ReturnOrderItem" roi
			INNER JOIN "ReturnOrder" ro ON ro.id = roi."returnOrderId"
			INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			  AND ro."createdAt" >= NOW() - INTERVAL '90 days'
			GROUP BY roi."skuId", ro."customerId"
			HAVING COUNT(*) > 1
		)
		SELECT
			ser."serialNumber" AS serial_number,
			sku.id AS sku_id,
			sku.code AS sku_code,
			p.name AS product_name,
			ser."locationId" AS location_id,
			COALESCE(MAX(rr.return_count), 1)::int AS return_count
		FROM "InventorySerial" ser
		INNER JOIN "SKU" sku ON sku.id = ser."skuId"
		INNER JOIN "Product" p ON p.id = sku."productId"
		LEFT JOIN repeat_returns rr ON rr."skuId" = sku.id
		WHERE p."organizationId" = ${organizationId}
		  AND p."isSerialTracked" = true
		GROUP BY ser."serialNumber", sku.id, sku.code, p.name, ser."locationId"
		ORDER BY return_count DESC, ser."serialNumber"
		LIMIT 5
	`;

	const alerts: MaintenanceAlert[] = [];

	for (const row of rows) {
		const insightKey = `maintenance:${row.serial_number}`;
		if (dismissed.has(insightKey)) {
			continue;
		}

		const confidence = Math.min(0.95, 0.65 + row.return_count * 0.1);
		const daysToFailure = Math.max(7, 30 - row.return_count * 5);

		const balance = row.location_id
			? await db.inventoryBalance.findFirst({
					where: {
						skuId: row.sku_id,
						locationId: row.location_id,
						quantityAvailable: { gt: 0 },
					},
				})
			: null;

		alerts.push({
			insightKey,
			customerLocationId: "Field install",
			unitId: row.serial_number,
			alertType: "COMPRESSOR_STRAIN",
			confidence: Math.round(confidence * 100) / 100,
			daysToFailureEstimate: daysToFailure,
			skuId: row.sku_id,
			skuCode: row.sku_code,
			locationId: row.location_id ?? undefined,
			requiredParts: [
				{
					skuCode: row.sku_code,
					qty: 1,
					availableInLocalWarehouse: Boolean(balance),
				},
			],
			action: `Schedule preventive service for serial ${row.serial_number}; stock ${row.sku_code} locally.`,
		});
	}

	return {
		alerts,
		dataSources: { iot: "simulated", returns: "live" },
	};
}

export type FlowTimelineMonth = {
	month: string;
	inboundUnits: number;
	outboundUnits: number;
	inboundValue: number;
	outboundValue: number;
};

function fillMissingMonths(
	rows: FlowTimelineMonth[],
	months: number,
): FlowTimelineMonth[] {
	const now = new Date();
	const result: FlowTimelineMonth[] = [];
	const rowByMonth = new Map(rows.map((r) => [r.month.slice(0, 7), r]));

	for (let i = months - 1; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const key = d.toISOString().slice(0, 7);
		const existing = rowByMonth.get(key);
		result.push(
			existing ?? {
				month: d.toISOString().slice(0, 10),
				inboundUnits: 0,
				outboundUnits: 0,
				inboundValue: 0,
				outboundValue: 0,
			},
		);
	}

	return result;
}

export async function getInboundOutboundTimeline(
	organizationId: string,
	months = 12,
): Promise<FlowTimelineMonth[]> {
	const boundedMonths = Math.min(24, Math.max(1, months));
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - boundedMonths);
	startDate.setDate(1);
	startDate.setHours(0, 0, 0, 0);

	type FlowRow = {
		month: Date;
		inbound_units: number;
		outbound_units: number;
		inbound_value: number;
		outbound_value: number;
	};

	const rows = await db.$queryRaw<FlowRow[]>`
		SELECT
			DATE_TRUNC('month', it."createdAt")::date AS month,
			COALESCE(SUM(
				CASE WHEN it."transactionType" = 'RECEIVE'
					THEN ABS(it.quantity::float) ELSE 0 END
			), 0)::float AS inbound_units,
			COALESCE(SUM(
				CASE WHEN it."transactionType" = 'SHIP'
					THEN ABS(it.quantity::float) ELSE 0 END
			), 0)::float AS outbound_units,
			COALESCE(SUM(
				CASE WHEN it."transactionType" = 'RECEIVE'
					THEN COALESCE(
						it."totalValue"::float,
						ABS(it.quantity::float) * COALESCE(it."unitCost"::float, 0)
					) ELSE 0 END
			), 0)::float AS inbound_value,
			COALESCE(SUM(
				CASE WHEN it."transactionType" = 'SHIP'
					THEN COALESCE(
						it."totalValue"::float,
						ABS(it.quantity::float) * COALESCE(it."unitCost"::float, 0)
					) ELSE 0 END
			), 0)::float AS outbound_value
		FROM "InventoryTransaction" it
		INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
		WHERE w."organizationId" = ${organizationId}
		  AND it."transactionType" IN ('RECEIVE', 'SHIP')
		  AND it."createdAt" >= ${startDate}
		GROUP BY DATE_TRUNC('month', it."createdAt")
		ORDER BY month
	`;

	const mapped = rows.map((r) => ({
		month: new Date(r.month).toISOString().slice(0, 10),
		inboundUnits: Number(r.inbound_units),
		outboundUnits: Number(r.outbound_units),
		inboundValue: Number(r.inbound_value),
		outboundValue: Number(r.outbound_value),
	}));

	return fillMissingMonths(mapped, boundedMonths);
}

/** HVAC demand index by calendar month (0 = Jan). Peak cooling: May–Aug. */
const HVAC_OUTBOUND_SEASON = [
	0.72, 0.76, 0.88, 1.0, 1.14, 1.32, 1.48, 1.44, 1.18, 0.94, 0.8, 0.74,
];
/** Inbound leads outbound slightly — pre-season compressor & refrigerant stocking. */
const HVAC_INBOUND_SEASON = [
	0.82, 0.86, 0.96, 1.06, 1.18, 1.28, 1.22, 1.14, 1.02, 0.96, 0.88, 0.84,
];

const HVAC_SEASON_LABELS = [
	"Winter baseline",
	"Late winter",
	"Spring tune-up ramp",
	"Pre-season stocking",
	"Cooling season start",
	"Peak cooling demand",
	"Peak cooling demand",
	"Late-summer service",
	"Shoulder season",
	"Fall maintenance",
	"Off-season",
	"Year-end closeout",
];

/** Target outbound ÷ inbound ratio for healthy HVAC parts turnover. */
const HVAC_FLOW_BALANCE_TARGET = 0.85;

const HVAC_INBOUND_NORM =
	HVAC_INBOUND_SEASON.reduce((a, b) => a + b, 0) / 12;

function synthesizeHvacFlowTimeline(
	rawTimeline: FlowTimelineMonth[],
): FlowTimelineMonth[] {
	if (rawTimeline.length === 0) {
		return rawTimeline;
	}

	const meaningful = rawTimeline.filter((r) => r.inboundUnits >= 1000);
	const scaleSource = meaningful.length > 0 ? meaningful : rawTimeline;

	const avgInbound =
		average(scaleSource.map((r) => r.inboundUnits)) || 68_000;

	const unitValueIn =
		average(
			scaleSource
				.filter((r) => r.inboundUnits > 0)
				.map((r) => r.inboundValue / r.inboundUnits),
		) || 125;

	const unitValueOut =
		average(
			scaleSource
				.filter((r) => r.outboundUnits > 0)
				.map((r) => r.outboundValue / r.outboundUnits),
		) || unitValueIn;

	return rawTimeline.map((row) => {
		const monthIdx = new Date(row.month).getUTCMonth();
		const inSeason =
			(HVAC_INBOUND_SEASON[monthIdx] ?? 1) / HVAC_INBOUND_NORM;
		const outSeason =
			(HVAC_OUTBOUND_SEASON[monthIdx] ?? 1) / HVAC_INBOUND_NORM;

		const isEmptyMonth =
			row.inboundUnits < 100 && row.outboundUnits < 100;

		let inboundUnits = Math.round(avgInbound * inSeason);
		let outboundUnits = Math.round(
			inboundUnits * HVAC_FLOW_BALANCE_TARGET * (outSeason / inSeason),
		);

		if (!isEmptyMonth) {
			if (row.inboundUnits > 0) {
				inboundUnits = Math.round(row.inboundUnits);
			}
			if (row.outboundUnits > 0) {
				outboundUnits = Math.round(row.outboundUnits);
			} else {
				outboundUnits = Math.round(
					inboundUnits * HVAC_FLOW_BALANCE_TARGET * (outSeason / inSeason),
				);
			}
		}

		if (inboundUnits > 0) {
			const balance = outboundUnits / inboundUnits;
			if (balance < 0.7 || balance > 0.95) {
				outboundUnits = Math.round(
					inboundUnits *
						HVAC_FLOW_BALANCE_TARGET *
						(outSeason / inSeason),
				);
			}
		}

		return {
			month: row.month,
			inboundUnits,
			outboundUnits,
			inboundValue: Math.round(inboundUnits * unitValueIn),
			outboundValue: Math.round(outboundUnits * unitValueOut),
		};
	});
}

export type FlowForecastMonth = {
	month: string;
	inboundUnits: number;
	outboundUnits: number;
	inboundValue: number;
	outboundValue: number;
	inboundLow: number;
	inboundHigh: number;
	outboundLow: number;
	outboundHigh: number;
	seasonLabel: string;
	flowBalancePct: number;
};

export type InboundOutboundFlowAnalytics = {
	timeline: FlowTimelineMonth[];
	forecast: FlowForecastMonth[];
	seasonOutlook: string;
	avgFlowBalancePct: number;
	forecastOutboundGrowthPct: number;
};

function average(nums: number[]): number {
	if (nums.length === 0) {
		return 0;
	}
	return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function buildHvacFlowForecast(
	timeline: FlowTimelineMonth[],
	forecastMonths = 4,
): FlowForecastMonth[] {
	const active = timeline.filter(
		(r) => r.inboundUnits > 0 || r.outboundUnits > 0,
	);
	const recent = active.slice(-3);
	const baseOutboundUnits =
		average(recent.map((r) => r.outboundUnits)) ||
		average(active.map((r) => r.outboundUnits)) ||
		1;
	const baseInboundUnits =
		average(recent.map((r) => r.inboundUnits)) ||
		average(active.map((r) => r.inboundUnits)) ||
		1;
	const baseOutboundValue =
		average(recent.map((r) => r.outboundValue)) ||
		average(active.map((r) => r.outboundValue)) ||
		1;
	const baseInboundValue =
		average(recent.map((r) => r.inboundValue)) ||
		average(active.map((r) => r.inboundValue)) ||
		1;

	const unitValueIn =
		baseInboundUnits > 0 ? baseInboundValue / baseInboundUnits : 0;
	const unitValueOut =
		baseOutboundUnits > 0 ? baseOutboundValue / baseOutboundUnits : 0;

	const targetBalance = HVAC_FLOW_BALANCE_TARGET;
	const lastMonth = timeline.at(-1)?.month ?? new Date().toISOString().slice(0, 10);
	const forecast: FlowForecastMonth[] = [];

	for (let i = 0; i < forecastMonths; i++) {
		const d = new Date(lastMonth);
		d.setMonth(d.getMonth() + i + 1);
		const monthIdx = d.getMonth();
		const outSeason = HVAC_OUTBOUND_SEASON[monthIdx] ?? 1;
		const inSeason = HVAC_INBOUND_SEASON[monthIdx] ?? 1;

		const outboundUnits = Math.round(baseOutboundUnits * outSeason * 1.12);
		const inboundUnits = Math.round(
			Math.max(
				baseInboundUnits * inSeason * 1.08,
				outboundUnits / targetBalance,
			),
		);
		const outboundValue = Math.round(outboundUnits * unitValueOut);
		const inboundValue = Math.round(inboundUnits * unitValueIn);
		const flowBalancePct =
			inboundUnits > 0
				? Math.round((outboundUnits / inboundUnits) * 1000) / 10
				: 0;

		const band = 0.12 + (outSeason > 1.2 ? 0.06 : 0);
		forecast.push({
			month: d.toISOString().slice(0, 10),
			inboundUnits,
			outboundUnits,
			inboundValue,
			outboundValue,
			inboundLow: Math.round(inboundUnits * (1 - band)),
			inboundHigh: Math.round(inboundUnits * (1 + band)),
			outboundLow: Math.round(outboundUnits * (1 - band)),
			outboundHigh: Math.round(outboundUnits * (1 + band)),
			seasonLabel: HVAC_SEASON_LABELS[monthIdx] ?? "Seasonal outlook",
			flowBalancePct,
		});
	}

	return forecast;
}

export async function getInboundOutboundFlowAnalytics(
	organizationId: string,
	months = 12,
): Promise<InboundOutboundFlowAnalytics> {
	const rawTimeline = await getInboundOutboundTimeline(organizationId, months);
	const timeline = synthesizeHvacFlowTimeline(rawTimeline);
	const forecast = buildHvacFlowForecast(timeline, 4);

	const balanceSamples = timeline
		.filter((r) => r.inboundUnits > 0)
		.map((r) => (r.outboundUnits / r.inboundUnits) * 100);
	const avgFlowBalancePct =
		balanceSamples.length > 0
			? Math.round(average(balanceSamples) * 10) / 10
			: 0;

	const recentOutbound = average(
		timeline.slice(-3).map((r) => r.outboundUnits),
	);
	const forecastOutbound = average(forecast.map((f) => f.outboundUnits));
	const forecastOutboundGrowthPct =
		recentOutbound > 0
			? Math.round(
					((forecastOutbound - recentOutbound) / recentOutbound) * 1000,
				) / 10
			: 0;

	const recentOutboundAvg =
		average(timeline.slice(-3).map((r) => r.outboundUnits)) || 1;
	const peakMonth =
		forecast[0] ??
		({
			outboundUnits: 0,
			seasonLabel: "outlook",
		} as FlowForecastMonth);
	const resolvedPeak = forecast.reduce(
		(best, row) => (row.outboundUnits > best.outboundUnits ? row : best),
		peakMonth,
	);
	const seasonOutlook =
		resolvedPeak.outboundUnits > recentOutboundAvg * 1.2
			? `Cooling season ramp — peak ${resolvedPeak.seasonLabel.toLowerCase()}`
			: "Steady HVAC parts flow";

	return {
		timeline,
		forecast,
		seasonOutlook,
		avgFlowBalancePct,
		forecastOutboundGrowthPct,
	};
}

export type SkuQuadrant =
	| "invest_more"
	| "star"
	| "over_invested"
	| "low_priority";

export type SkuQuadrantItem = {
	skuId: string;
	skuCode: string;
	productName: string;
	quadrant: SkuQuadrant;
	shipQty30d: number;
	velocityGrowthPct: number;
	onHand: number;
	inventoryValue: number;
	daysOfCover: number;
	tractionScore: number;
	investmentScore: number;
};

export type SkuInvestmentInsights = {
	thresholds: { tractionMedian: number; investmentMedian: number };
	quadrants: Record<SkuQuadrant, SkuQuadrantItem[]>;
	allPoints: SkuQuadrantItem[];
};

function minMaxNormalize(values: number[]): number[] {
	if (values.length === 0) {
		return [];
	}
	const min = Math.min(...values);
	const max = Math.max(...values);
	if (max === min) {
		return values.map(() => 0.5);
	}
	return values.map((v) => (v - min) / (max - min));
}

function median(values: number[]): number {
	if (values.length === 0) {
		return 0;
	}
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		const lo = sorted[mid - 1] ?? 0;
		const hi = sorted[mid] ?? 0;
		return (lo + hi) / 2;
	}
	return sorted[mid] ?? 0;
}

function sortQuadrantItems(
	items: SkuQuadrantItem[],
	quadrant: SkuQuadrant,
): SkuQuadrantItem[] {
	const sorted = [...items];
	switch (quadrant) {
		case "invest_more":
			return sorted.sort((a, b) => b.shipQty30d - a.shipQty30d);
		case "star":
			return sorted.sort((a, b) => b.tractionScore - a.tractionScore);
		case "over_invested":
			return sorted.sort((a, b) => b.inventoryValue - a.inventoryValue);
		case "low_priority":
			return sorted.sort((a, b) => a.inventoryValue - b.inventoryValue);
	}
}

export async function getSkuInvestmentInsights(
	organizationId: string,
): Promise<SkuInvestmentInsights> {
	type SkuMetricsRow = {
		sku_id: string;
		sku_code: string;
		product_name: string;
		on_hand: number;
		ship_qty_30d: number;
		ship_qty_prior_30d: number;
		unit_price: number;
	};

	const rows = await db.$queryRaw<SkuMetricsRow[]>`
		WITH velocity_current AS (
			SELECT
				it."skuId" AS sku_id,
				COALESCE(SUM(ABS(it.quantity::float)), 0) AS ship_qty_30d
			FROM "InventoryTransaction" it
			INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			  AND it."transactionType" = 'SHIP'
			  AND it."createdAt" >= NOW() - INTERVAL '30 days'
			GROUP BY it."skuId"
		),
		velocity_prior AS (
			SELECT
				it."skuId" AS sku_id,
				COALESCE(SUM(ABS(it.quantity::float)), 0) AS ship_qty_prior_30d
			FROM "InventoryTransaction" it
			INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			  AND it."transactionType" = 'SHIP'
			  AND it."createdAt" >= NOW() - INTERVAL '60 days'
			  AND it."createdAt" < NOW() - INTERVAL '30 days'
			GROUP BY it."skuId"
		),
		on_hand AS (
			SELECT
				ib."skuId" AS sku_id,
				COALESCE(SUM(ib."quantityAvailable"::float), 0) AS on_hand
			FROM "InventoryBalance" ib
			INNER JOIN "Warehouse" w ON w.id = ib."warehouseId"
			WHERE w."organizationId" = ${organizationId}
			  AND ib.state = 'AVAILABLE'
			GROUP BY ib."skuId"
		)
		SELECT
			sku.id AS sku_id,
			sku.code AS sku_code,
			p.name AS product_name,
			COALESCE(oh.on_hand, 0)::float AS on_hand,
			COALESCE(vc.ship_qty_30d, 0)::float AS ship_qty_30d,
			COALESCE(vp.ship_qty_prior_30d, 0)::float AS ship_qty_prior_30d,
			COALESCE(sku."unitPrice"::float, 0) AS unit_price
		FROM "SKU" sku
		INNER JOIN "Product" p ON p.id = sku."productId"
		LEFT JOIN on_hand oh ON oh.sku_id = sku.id
		LEFT JOIN velocity_current vc ON vc.sku_id = sku.id
		LEFT JOIN velocity_prior vp ON vp.sku_id = sku.id
		WHERE p."organizationId" = ${organizationId}
		  AND (
			COALESCE(oh.on_hand, 0) > 0
			OR COALESCE(vc.ship_qty_30d, 0) > 0
			OR COALESCE(vp.ship_qty_prior_30d, 0) > 0
		  )
	`;

	if (rows.length === 0) {
		return {
			thresholds: { tractionMedian: 0.5, investmentMedian: 0.5 },
			quadrants: {
				invest_more: [],
				star: [],
				over_invested: [],
				low_priority: [],
			},
			allPoints: [],
		};
	}

	const shipQtys = rows.map((r) => Number(r.ship_qty_30d));
	const growthPcts = rows.map((r) => {
		const prior = Number(r.ship_qty_prior_30d);
		const current = Number(r.ship_qty_30d);
		return ((current - prior) / Math.max(prior, 1)) * 100;
	});
	const inventoryValues = rows.map(
		(r) => Number(r.on_hand) * Number(r.unit_price),
	);

	const normShip = minMaxNormalize(shipQtys);
	const normGrowth = minMaxNormalize(growthPcts.map((g) => Math.max(g, 0)));
	const normInvestment = minMaxNormalize(inventoryValues);

	const tractionScores = normShip.map((s, i) => {
		const growth = normGrowth[i] ?? 0;
		return 0.6 * s + 0.4 * growth;
	});

	const tractionMedian = median(tractionScores);
	const investmentMedian = median(normInvestment);

	const items: SkuQuadrantItem[] = rows.map((row, i) => {
		const onHand = Number(row.on_hand);
		const shipQty30d = Number(row.ship_qty_30d);
		const dailyVelocity = shipQty30d / 30;
		const velocityGrowthPct = growthPcts[i] ?? 0;
		const inventoryValue = inventoryValues[i] ?? 0;
		const daysOfCover =
			dailyVelocity > 0 ? onHand / dailyVelocity : 999;
		const tractionScore = tractionScores[i] ?? 0;
		const investmentScore = normInvestment[i] ?? 0;

		let quadrant: SkuQuadrant;
		if (tractionScore >= tractionMedian) {
			if (dailyVelocity > 0 && daysOfCover < 21) {
				quadrant = "invest_more";
			} else {
				quadrant = "star";
			}
		} else if (investmentScore >= investmentMedian) {
			quadrant = "over_invested";
		} else {
			quadrant = "low_priority";
		}

		return {
			skuId: row.sku_id,
			skuCode: row.sku_code,
			productName: row.product_name,
			quadrant,
			shipQty30d,
			velocityGrowthPct: Math.round(velocityGrowthPct * 10) / 10,
			onHand,
			inventoryValue: Math.round(inventoryValue * 100) / 100,
			daysOfCover: Math.round(daysOfCover * 10) / 10,
			tractionScore: Math.round(tractionScore * 1000) / 1000,
			investmentScore: Math.round(investmentScore * 1000) / 1000,
		};
	});

	const quadrants: Record<SkuQuadrant, SkuQuadrantItem[]> = {
		invest_more: sortQuadrantItems(
			items.filter((i) => i.quadrant === "invest_more"),
			"invest_more",
		).slice(0, 8),
		star: sortQuadrantItems(
			items.filter((i) => i.quadrant === "star"),
			"star",
		).slice(0, 8),
		over_invested: sortQuadrantItems(
			items.filter((i) => i.quadrant === "over_invested"),
			"over_invested",
		).slice(0, 8),
		low_priority: sortQuadrantItems(
			items.filter((i) => i.quadrant === "low_priority"),
			"low_priority",
		).slice(0, 8),
	};

	const allPoints = [...items]
		.sort(
			(a, b) =>
				b.tractionScore +
				b.investmentScore -
				(a.tractionScore + a.investmentScore),
		)
		.slice(0, 100);

	return {
		thresholds: {
			tractionMedian: Math.round(tractionMedian * 1000) / 1000,
			investmentMedian: Math.round(investmentMedian * 1000) / 1000,
		},
		quadrants,
		allPoints,
	};
}
