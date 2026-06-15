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
