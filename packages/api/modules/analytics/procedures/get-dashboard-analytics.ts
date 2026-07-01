import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getDashboardAnalyticsInput = z.object({
	organizationId: z.string(),
});

// ─── Raw query result shapes ──────────────────────────────────────────────────

type TaskAgingRow = { avg_minutes: number; open_count: number };
type TaskAccuracyRow = { completed: number; total: number };
type ReturnAgingRow = {
	avg_days: number;
	bucket_0_3: number;
	bucket_4_7: number;
	bucket_7_plus: number;
};
type OtifRow = {
	day: Date;
	day_rate: number;
	total_orders: number;
	on_time_orders: number;
};
type BottleneckZoneRow = { zone_name: string; avg_delay_minutes: number };
type FifoComplianceRow = { compliant: number; total: number };
type HighValueReturnRow = { avg_days: number; total_value: number };
type InventoryAccuracyRow = {
	total_variance: number;
	total_system_qty: number;
};
type DeadStockRow = { sku_count: number; total_value: number };
type ComponentFailureCostRow = {
	product_name: string;
	total_cost: number;
	return_count: number;
};
type RepeatFailureRow = {
	product_name: string;
	total_returns: number;
	repeat_returns: number;
};
type AmcComplianceRow = {
	customer_name: string;
	total_items: number;
	returned_items: number;
};
type RepairReplaceRow = {
	repaired: number;
	replaced: number;
	restocked: number;
};
type WarehouseStockRow = {
	id: string;
	name: string;
	code: string;
	total_qty: number;
	total_value: number;
};
type ReverseValueRow = {
	warehouse_id: string;
	warehouse_name: string;
	pending_value: number;
	recovered_value: number;
};
type RecoveryYieldRow = { recovered_value: number; total_return_value: number };
type ComponentCostDrainRow = {
	product_name: string;
	replacement_cost: number;
	replacement_qty: number;
};
type InventoryCapitalRiskRow = {
	dead_stock_value: number;
	slow_moving_value: number;
	excess_stock_value: number;
};
type RecoveryBacklogRow = { product_name: string; unit_count: number };

export const getDashboardAnalyticsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/dashboard",
		tags: ["Analytics"],
		summary: "Dashboard Analytics",
		description:
			"Returns all KPI metrics for the WMS intelligence dashboard",
	})
	.input(getDashboardAnalyticsInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		return fetchDashboardAnalytics(input.organizationId);
	});

export async function fetchDashboardAnalytics(organizationId: string) {
		// ── Run all analytics queries in parallel ──────────────────────────────

		const [
			taskAgingRows,
			taskAccuracyRows,
			returnAgingRows,
			otifRows,
			bottleneckRows,
			fifoRows,
			highValueReturnRows,
			inventoryAccuracyRows,
			deadStockRows,
			componentFailureCostRows,
			repeatFailureRows,
			amcComplianceRows,
			repairReplaceRows,
			warehouseStockRows,
			reverseValueRows,
			recoveryYieldRows,
			componentCostDrainRows,
			inventoryCapitalRiskRows,
			recoveryBacklogRows,
		] = await Promise.all([
			// ── Persona 1: Warehouse Associate ─────────────────────────────────

			// Open Task Aging – avg(now - createdAt) for open assigned tasks
			db.$queryRaw<TaskAgingRow[]>`
				SELECT
					COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - wt."createdAt"))/60), 0)::float AS avg_minutes,
					COUNT(*)::int AS open_count
				FROM "WarehouseTask" wt
				INNER JOIN "Warehouse" w ON w.id = wt."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND wt.status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS')
			`,

			// First-Pass Accuracy – COMPLETED / (COMPLETED + CANCELLED) last 30d
			db.$queryRaw<TaskAccuracyRow[]>`
				SELECT
					COUNT(CASE WHEN wt.status = 'COMPLETED' THEN 1 END)::int AS completed,
					COUNT(CASE WHEN wt.status IN ('COMPLETED','CANCELLED') THEN 1 END)::int AS total
				FROM "WarehouseTask" wt
				INNER JOIN "Warehouse" w ON w.id = wt."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND wt."createdAt" >= NOW() - INTERVAL '30 days'
			`,

			// Reverse Processing Aging – open return orders with age buckets
			db.$queryRaw<ReturnAgingRow[]>`
				SELECT
					COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - ro."createdAt"))/86400), 0)::float AS avg_days,
					COUNT(CASE WHEN EXTRACT(EPOCH FROM (NOW() - ro."createdAt"))/86400 <= 3 THEN 1 END)::int AS bucket_0_3,
					COUNT(CASE WHEN EXTRACT(EPOCH FROM (NOW() - ro."createdAt"))/86400 > 3
					                AND EXTRACT(EPOCH FROM (NOW() - ro."createdAt"))/86400 <= 7 THEN 1 END)::int AS bucket_4_7,
					COUNT(CASE WHEN EXTRACT(EPOCH FROM (NOW() - ro."createdAt"))/86400 > 7 THEN 1 END)::int AS bucket_7_plus
				FROM "ReturnOrder" ro
				INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND ro.status IN ('RECEIVED', 'INSPECTING')
			`,

			// ── Persona 2: Warehouse Control Lead ─────────────────────────────

			// OTIF – 7-day daily breakdown
			db.$queryRaw<OtifRow[]>`
				SELECT
					DATE_TRUNC('day', s."shippedAt")::date AS day,
					COUNT(*)::int AS total_orders,
					COUNT(CASE WHEN s."scheduledAt" IS NULL OR s."shippedAt" <= s."scheduledAt" THEN 1 END)::int AS on_time_orders,
					(COUNT(CASE WHEN s."scheduledAt" IS NULL OR s."shippedAt" <= s."scheduledAt" THEN 1 END)::float /
					 NULLIF(COUNT(*),0) * 100) AS day_rate
				FROM "Shipment" s
				INNER JOIN "Warehouse" w ON w.id = s."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND s.status = 'SHIPPED'
				  AND s."shippedAt" >= NOW() - INTERVAL '7 days'
				GROUP BY DATE_TRUNC('day', s."shippedAt")
				ORDER BY day
			`,

			// Bottleneck Zone – avg task duration by fromLocation
			db.$queryRaw<BottleneckZoneRow[]>`
				SELECT
					COALESCE(l.name, l.code, 'Unknown') AS zone_name,
					AVG(EXTRACT(EPOCH FROM (wt."completedAt" - wt."startedAt"))/60)::float AS avg_delay_minutes
				FROM "WarehouseTask" wt
				INNER JOIN "Warehouse" w ON w.id = wt."warehouseId"
				LEFT JOIN "Location" l ON l.id = wt."fromLocationId"
				WHERE w."organizationId" = ${organizationId}
				  AND wt.status = 'COMPLETED'
				  AND wt."startedAt" IS NOT NULL
				  AND wt."completedAt" IS NOT NULL
				  AND wt."fromLocationId" IS NOT NULL
				GROUP BY l.name, l.code
				ORDER BY avg_delay_minutes DESC NULLS LAST
				LIMIT 8
			`,

			// FIFO Recovery Compliance – oldest return orders processed first
			// Uses most recent ReturnInspection.createdAt as the processing timestamp
			db.$queryRaw<FifoComplianceRow[]>`
				WITH order_times AS (
					SELECT
						ro.id,
						ro."warehouseId",
						ro."createdAt",
						MAX(ri."createdAt") AS inspection_at
					FROM "ReturnOrder" ro
					INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
					LEFT JOIN "ReturnInspection" ri ON ri."returnOrderId" = ro.id
					WHERE w."organizationId" = ${organizationId}
					  AND ro.status = 'COMPLETED'
					  AND ro."createdAt" >= NOW() - INTERVAL '30 days'
					GROUP BY ro.id, ro."warehouseId", ro."createdAt"
				),
				ranked AS (
					SELECT
						id,
						ROW_NUMBER() OVER (PARTITION BY "warehouseId" ORDER BY "createdAt" ASC) AS fifo_rank,
						ROW_NUMBER() OVER (PARTITION BY "warehouseId" ORDER BY COALESCE(inspection_at, "createdAt") ASC) AS processed_rank
					FROM order_times
				)
				SELECT
					COUNT(CASE WHEN fifo_rank = processed_rank THEN 1 END)::int AS compliant,
					COUNT(*)::int AS total
				FROM ranked
			`,

			// High-Value Reverse Aging – returns with items whose unit price is high
			db.$queryRaw<HighValueReturnRow[]>`
				SELECT
					COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - ro."createdAt"))/86400), 0)::float AS avg_days,
					COALESCE(SUM(roi.quantity * COALESCE(sku."unitPrice"::float, 0)), 0)::float AS total_value
				FROM "ReturnOrder" ro
				INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
				INNER JOIN "ReturnOrderItem" roi ON roi."returnOrderId" = ro.id
				INNER JOIN "SKU" sku ON sku.id = roi."skuId"
				WHERE w."organizationId" = ${organizationId}
				  AND ro.status IN ('RECEIVED', 'INSPECTING', 'CREATED', 'IN_TRANSIT')
				  AND COALESCE(sku."unitPrice"::float, 0) > 5000
			`,

			// ── Persona 3: Inventory & Quality Lead ───────────────────────────

			// Inventory Accuracy – from completed cycle count sessions
			db.$queryRaw<InventoryAccuracyRow[]>`
				SELECT
					COALESCE(SUM(ABS(cci.variance::float)), 0)::float AS total_variance,
					COALESCE(SUM(cci."expectedQty"::float), 1)::float AS total_system_qty
				FROM "CycleCountItem" cci
				INNER JOIN "CycleCountSession" ccs ON ccs.id = cci."sessionId"
				INNER JOIN "Warehouse" w ON w.id = ccs."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND ccs.status = 'COMPLETED'
				  AND ccs."createdAt" >= NOW() - INTERVAL '90 days'
			`,

			// Dead Stock – inventory not moved in 90+ days
			db.$queryRaw<DeadStockRow[]>`
				WITH last_movement AS (
					SELECT
						it."skuId",
						it."warehouseId",
						MAX(it."createdAt") AS last_moved_at
					FROM "InventoryTransaction" it
					INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
					WHERE w."organizationId" = ${organizationId}
					GROUP BY it."skuId", it."warehouseId"
				)
				SELECT
					COUNT(DISTINCT ib."skuId")::int AS sku_count,
					COALESCE(SUM(ib."quantityAvailable"::float * COALESCE(sku."unitPrice"::float, 0)), 0)::float AS total_value
				FROM "InventoryBalance" ib
				INNER JOIN "Warehouse" w ON w.id = ib."warehouseId"
				INNER JOIN "SKU" sku ON sku.id = ib."skuId"
				LEFT JOIN last_movement lm ON lm."skuId" = ib."skuId" AND lm."warehouseId" = ib."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND ib."quantityAvailable" > 0
				  AND (lm.last_moved_at IS NULL OR lm.last_moved_at < NOW() - INTERVAL '90 days')
			`,

			// Component Failure Cost – return value by product, ranked
			db.$queryRaw<ComponentFailureCostRow[]>`
				SELECT
					p.name AS product_name,
					COALESCE(SUM(roi.quantity::float * COALESCE(sku."unitPrice"::float, 0)), 0)::float AS total_cost,
					COUNT(roi.id)::int AS return_count
				FROM "ReturnOrderItem" roi
				INNER JOIN "ReturnOrder" ro ON ro.id = roi."returnOrderId"
				INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
				INNER JOIN "SKU" sku ON sku.id = roi."skuId"
				INNER JOIN "Product" p ON p.id = sku."productId"
				WHERE w."organizationId" = ${organizationId}
				  AND ro."createdAt" >= NOW() - INTERVAL '30 days'
				GROUP BY p.name, p.id
				ORDER BY total_cost DESC
				LIMIT 10
			`,

			// Repeat Failure Rate – same product returned by same customer >1x
			db.$queryRaw<RepeatFailureRow[]>`
				WITH per_customer AS (
					SELECT
						roi."skuId",
						ro."customerId",
						COUNT(*) AS return_count
					FROM "ReturnOrderItem" roi
					INNER JOIN "ReturnOrder" ro ON ro.id = roi."returnOrderId"
					INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
					WHERE w."organizationId" = ${organizationId}
					  AND ro."createdAt" >= NOW() - INTERVAL '90 days'
					GROUP BY roi."skuId", ro."customerId"
				)
				SELECT
					p.name AS product_name,
					COUNT(*)::int AS total_returns,
					COUNT(CASE WHEN pc.return_count > 1 THEN 1 END)::int AS repeat_returns
				FROM per_customer pc
				INNER JOIN "SKU" sku ON sku.id = pc."skuId"
				INNER JOIN "Product" p ON p.id = sku."productId"
				GROUP BY p.name, p.id
				ORDER BY repeat_returns DESC
				LIMIT 8
			`,

			// AMC Return Compliance – return rate by wholesale customers
			db.$queryRaw<AmcComplianceRow[]>`
				SELECT
					c.name AS customer_name,
					COUNT(DISTINCT so.id)::int AS total_items,
					COUNT(DISTINCT ro.id)::int AS returned_items
				FROM "Customer" c
				INNER JOIN "SalesOrder" so ON so."customerId" = c.id
				INNER JOIN "Warehouse" w ON w.id = so."warehouseId"
				LEFT JOIN "ReturnOrder" ro ON ro."customerId" = c.id AND ro."salesOrderId" = so.id
				WHERE c."organizationId" = ${organizationId}
				  AND c.type = 'WHOLESALE'
				  AND so."orderedAt" >= NOW() - INTERVAL '90 days'
				GROUP BY c.name, c.id
				ORDER BY (COUNT(DISTINCT ro.id)::float / NULLIF(COUNT(DISTINCT so.id),0)) ASC
				LIMIT 10
			`,

			// Repair vs Replace Ratio
			db.$queryRaw<RepairReplaceRow[]>`
				SELECT
					COUNT(CASE WHEN roi.disposition = 'REFURBISH' THEN 1 END)::int AS repaired,
					COUNT(CASE WHEN roi.disposition IN ('SCRAP','RETURN_TO_VENDOR') THEN 1 END)::int AS replaced,
					COUNT(CASE WHEN roi.disposition = 'RESTOCK' THEN 1 END)::int AS restocked
				FROM "ReturnOrderItem" roi
				INNER JOIN "ReturnOrder" ro ON ro.id = roi."returnOrderId"
				INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND ro.status = 'COMPLETED'
				  AND ro."createdAt" >= NOW() - INTERVAL '30 days'
			`,

			// ── Persona 4 & 5 shared ───────────────────────────────────────────

			// Per-warehouse inventory summary
			db.$queryRaw<WarehouseStockRow[]>`
				SELECT
					w.id,
					w.name,
					w.code,
					COALESCE(SUM(ib."quantityAvailable"::float), 0)::float AS total_qty,
					COALESCE(SUM(ib."quantityAvailable"::float * COALESCE(sku."unitPrice"::float, 0)), 0)::float AS total_value
				FROM "Warehouse" w
				LEFT JOIN "InventoryBalance" ib ON ib."warehouseId" = w.id
				LEFT JOIN "SKU" sku ON sku.id = ib."skuId"
				WHERE w."organizationId" = ${organizationId}
				GROUP BY w.id, w.name, w.code
			`,

			// Regional Reverse Value Gap – pending vs recovered return value per warehouse
			db.$queryRaw<ReverseValueRow[]>`
				SELECT
					w.id AS warehouse_id,
					w.name AS warehouse_name,
					COALESCE(SUM(CASE WHEN ro.status NOT IN ('COMPLETED','CANCELLED')
					              THEN roi.quantity::float * COALESCE(sku."unitPrice"::float, 0) ELSE 0 END), 0)::float AS pending_value,
					COALESCE(SUM(CASE WHEN roi.disposition = 'RESTOCK'
					              THEN roi.quantity::float * COALESCE(sku."unitPrice"::float, 0) ELSE 0 END), 0)::float AS recovered_value
				FROM "Warehouse" w
				LEFT JOIN "ReturnOrder" ro ON ro."warehouseId" = w.id
				LEFT JOIN "ReturnOrderItem" roi ON roi."returnOrderId" = ro.id
				LEFT JOIN "SKU" sku ON sku.id = roi."skuId"
				WHERE w."organizationId" = ${organizationId}
				  AND (ro."createdAt" IS NULL OR ro."createdAt" >= NOW() - INTERVAL '365 days')
				GROUP BY w.id, w.name
			`,

			// Recovery Yield – YTD recovered value vs total return value
			db.$queryRaw<RecoveryYieldRow[]>`
				SELECT
					COALESCE(SUM(CASE WHEN roi.disposition = 'RESTOCK'
					              THEN roi.quantity::float * COALESCE(sku."unitPrice"::float, 0) ELSE 0 END), 0)::float AS recovered_value,
					COALESCE(SUM(roi.quantity::float * COALESCE(sku."unitPrice"::float, 0)), 0)::float AS total_return_value
				FROM "ReturnOrderItem" roi
				INNER JOIN "ReturnOrder" ro ON ro.id = roi."returnOrderId"
				INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
				INNER JOIN "SKU" sku ON sku.id = roi."skuId"
				WHERE w."organizationId" = ${organizationId}
				  AND ro."createdAt" >= DATE_TRUNC('year', NOW())
			`,

			// Component Cost Drain – total cost of replacements issued (SHIP transactions)
			db.$queryRaw<ComponentCostDrainRow[]>`
				SELECT
					p.name AS product_name,
					COALESCE(SUM(it.quantity::float), 0)::float AS replacement_qty,
					COALESCE(SUM(it.quantity::float * COALESCE(sku."unitPrice"::float, 0)), 0)::float AS replacement_cost
				FROM "InventoryTransaction" it
				INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
				INNER JOIN "SKU" sku ON sku.id = it."skuId"
				INNER JOIN "Product" p ON p.id = sku."productId"
				WHERE w."organizationId" = ${organizationId}
				  AND it."transactionType" = 'SHIP'
				  AND it."createdAt" >= DATE_TRUNC('year', NOW())
				GROUP BY p.name, p.id
				ORDER BY replacement_cost DESC
				LIMIT 10
			`,

			// Inventory Capital at Risk – dead + slow-moving + excess
			db.$queryRaw<InventoryCapitalRiskRow[]>`
				WITH last_movement AS (
					SELECT it."skuId", it."warehouseId", MAX(it."createdAt") AS last_moved_at
					FROM "InventoryTransaction" it
					INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
					WHERE w."organizationId" = ${organizationId}
					GROUP BY it."skuId", it."warehouseId"
				)
				SELECT
					COALESCE(SUM(CASE WHEN lm.last_moved_at < NOW() - INTERVAL '90 days' OR lm.last_moved_at IS NULL
					              THEN ib."quantityAvailable"::float * COALESCE(sku."unitPrice"::float, 0) ELSE 0 END), 0)::float AS dead_stock_value,
					COALESCE(SUM(CASE WHEN lm.last_moved_at >= NOW() - INTERVAL '90 days'
					                   AND lm.last_moved_at < NOW() - INTERVAL '30 days'
					              THEN ib."quantityAvailable"::float * COALESCE(sku."unitPrice"::float, 0) ELSE 0 END), 0)::float AS slow_moving_value,
					COALESCE(SUM(CASE WHEN ib."quantityAvailable"::float > ib."quantityReserved"::float * 3
					              THEN (ib."quantityAvailable"::float - ib."quantityReserved"::float * 3) * COALESCE(sku."unitPrice"::float, 0) ELSE 0 END), 0)::float AS excess_stock_value
				FROM "InventoryBalance" ib
				INNER JOIN "Warehouse" w ON w.id = ib."warehouseId"
				INNER JOIN "SKU" sku ON sku.id = ib."skuId"
				LEFT JOIN last_movement lm ON lm."skuId" = ib."skuId" AND lm."warehouseId" = ib."warehouseId"
				WHERE w."organizationId" = ${organizationId}
				  AND ib."quantityAvailable" > 0
			`,

			// Recovery Backlog – repairable items waiting transfer (REFURBISH disposition, not completed)
			db.$queryRaw<RecoveryBacklogRow[]>`
				SELECT
					p.name AS product_name,
					COUNT(roi.id)::int AS unit_count
				FROM "ReturnOrderItem" roi
				INNER JOIN "ReturnOrder" ro ON ro.id = roi."returnOrderId"
				INNER JOIN "Warehouse" w ON w.id = ro."warehouseId"
				INNER JOIN "SKU" sku ON sku.id = roi."skuId"
				INNER JOIN "Product" p ON p.id = sku."productId"
				WHERE w."organizationId" = ${organizationId}
				  AND roi.disposition = 'REFURBISH'
				  AND ro.status NOT IN ('COMPLETED','CANCELLED')
				GROUP BY p.name, p.id
				ORDER BY unit_count DESC
				LIMIT 10
			`,
		]);

		// ── Compute derived metrics ────────────────────────────────────────────

		// Persona 1
		const taskAging = taskAgingRows[0] ?? { avg_minutes: 0, open_count: 0 };
		const taskAccuracy = taskAccuracyRows[0] ?? { completed: 0, total: 0 };
		const firstPassAccuracyRate =
			taskAccuracy.total > 0
				? (taskAccuracy.completed / taskAccuracy.total) * 100
				: 0;

		const returnAging = returnAgingRows[0] ?? {
			avg_days: 0,
			bucket_0_3: 0,
			bucket_4_7: 0,
			bucket_7_plus: 0,
		};

		// Persona 2 – OTIF
		const totalOrders = otifRows.reduce((s, r) => s + r.total_orders, 0);
		const onTimeOrders = otifRows.reduce((s, r) => s + r.on_time_orders, 0);
		const otifRate =
			totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 0;
		const otifTrend = otifRows.map((r) => ({
			date:
				r.day instanceof Date
					? r.day.toISOString().slice(0, 10)
					: String(r.day),
			rate: r.day_rate ?? 0,
		}));

		const fifo = fifoRows[0] ?? { compliant: 0, total: 0 };
		const fifoComplianceRate =
			fifo.total > 0 ? (fifo.compliant / fifo.total) * 100 : 0;

		const highValueReturn = highValueReturnRows[0] ?? {
			avg_days: 0,
			total_value: 0,
		};

		// Persona 3
		const invAcc = inventoryAccuracyRows[0] ?? {
			total_variance: 0,
			total_system_qty: 1,
		};
		const inventoryAccuracyRate =
			invAcc.total_system_qty > 0
				? (1 - invAcc.total_variance / invAcc.total_system_qty) * 100
				: 100;

		const deadStock = deadStockRows[0] ?? { sku_count: 0, total_value: 0 };

		const repairReplace = repairReplaceRows[0] ?? {
			repaired: 0,
			replaced: 0,
			restocked: 0,
		};
		const repairTotal =
			repairReplace.repaired +
			repairReplace.replaced +
			repairReplace.restocked;
		const repairRate =
			repairTotal > 0 ? (repairReplace.repaired / repairTotal) * 100 : 0;
		const replaceRate =
			repairTotal > 0 ? (repairReplace.replaced / repairTotal) * 100 : 0;

		const amcCompliance = amcComplianceRows.map((r) => ({
			name: r.customer_name,
			total: r.total_items,
			returned: r.returned_items,
			rate:
				r.total_items > 0
					? (r.returned_items / r.total_items) * 100
					: 0,
		}));

		// Persona 4 – warehouse-level metrics
		const totalInventoryValue = warehouseStockRows.reduce(
			(s, r) => s + r.total_value,
			0,
		);
		const regionalBalance = warehouseStockRows.map((w) => {
			const avgFill =
				totalInventoryValue > 0
					? (w.total_value / totalInventoryValue) * 100
					: 0;
			// Balance score: normalized around even distribution
			const expectedShare = 100 / (warehouseStockRows.length || 1);
			const coverScore = Math.min(100, avgFill);
			const gapScore = Math.max(
				0,
				100 - Math.abs(avgFill - expectedShare) * 2,
			);
			const score = 0.5 * coverScore + 0.5 * gapScore;
			return {
				warehouseId: w.id,
				name: w.name,
				score: Math.round(score),
			};
		});

		const transferNeedTotal = warehouseStockRows.reduce(
			(sum, w, _i, arr) => {
				const avgQty =
					arr.reduce((s, r) => s + r.total_qty, 0) /
					(arr.length || 1);
				const deficit = Math.max(0, avgQty - w.total_qty);
				return sum + deficit;
			},
			0,
		);

		const reverseValueGap = reverseValueRows.map((r) => ({
			warehouseId: r.warehouse_id,
			name: r.warehouse_name,
			pendingValue: r.pending_value,
			recoveredValue: r.recovered_value,
			gap: r.pending_value - r.recovered_value,
		}));

		const recoveryBacklogTotal = recoveryBacklogRows.reduce(
			(s, r) => s + r.unit_count,
			0,
		);

		// High-value concentration risk – top components by inventory value
		const highValueConcentration = componentCostDrainRows
			.slice(0, 5)
			.map((r) => ({
				name: r.product_name,
				cost: r.replacement_cost,
				pct:
					totalInventoryValue > 0
						? (r.replacement_cost / totalInventoryValue) * 100
						: 0,
			}));

		// Persona 5 – executive
		const recovery = recoveryYieldRows[0] ?? {
			recovered_value: 0,
			total_return_value: 0,
		};
		const recoveryYieldRate =
			recovery.total_return_value > 0
				? (recovery.recovered_value / recovery.total_return_value) * 100
				: 0;

		const capitalRisk = inventoryCapitalRiskRows[0] ?? {
			dead_stock_value: 0,
			slow_moving_value: 0,
			excess_stock_value: 0,
		};
		const totalCapitalAtRisk =
			capitalRisk.dead_stock_value +
			capitalRisk.slow_moving_value +
			capitalRisk.excess_stock_value;

		const totalReturnValue = reverseValueRows.reduce(
			(s, r) => s + r.pending_value,
			0,
		);
		const totalRecoveredValue = reverseValueRows.reduce(
			(s, r) => s + r.recovered_value,
			0,
		);
		const leakageValue = totalReturnValue - totalRecoveredValue;

		const amcNonReturnExposure = componentCostDrainRows
			.map((r) => ({ name: r.product_name, cost: r.replacement_cost }))
			.slice(0, 6);

		// Simple EMA-based OTIF forecast (extrapolate from last 7 days trend)
		const otifForecastRate = (() => {
			if (otifTrend.length < 2) return otifRate;
			const alpha = 0.3;
			let ema = otifTrend[0]?.rate ?? otifRate;
			for (const d of otifTrend) {
				ema = alpha * d.rate + (1 - alpha) * ema;
			}
			const lastTwo = otifTrend.slice(-2);
			const slope =
				lastTwo.length === 2 ? lastTwo[1].rate - lastTwo[0].rate : 0;
			return Math.max(0, Math.min(100, ema + slope));
		})();

		// ── Shape final response ──────────────────────────────────────────────

		return {
			persona1: {
				openTaskAging: {
					avgMinutes: Math.round(taskAging.avg_minutes),
					openCount: taskAging.open_count,
				},
				firstPassAccuracy: {
					rate: Number(firstPassAccuracyRate.toFixed(1)),
					completedCount: taskAccuracy.completed,
					totalCount: taskAccuracy.total,
				},
				reverseProcessingAging: {
					avgDays: Number(returnAging.avg_days.toFixed(1)),
					bucket0to3: returnAging.bucket_0_3,
					bucket4to7: returnAging.bucket_4_7,
					bucket7plus: returnAging.bucket_7_plus,
				},
			},
			persona2: {
				otif: {
					rate: Number(otifRate.toFixed(1)),
					totalOrders,
					onTimeOrders,
					trend: otifTrend,
				},
				bottleneckZones: bottleneckRows.map((r) => ({
					name: r.zone_name,
					avgDelayMinutes: Number(
						(r.avg_delay_minutes ?? 0).toFixed(1),
					),
				})),
				fifoCompliance: {
					rate: Number(fifoComplianceRate.toFixed(1)),
					compliant: fifo.compliant,
					total: fifo.total,
				},
				highValueReverseAging: {
					avgDays: Number(highValueReturn.avg_days.toFixed(1)),
					totalValue: Math.round(highValueReturn.total_value),
				},
			},
			persona3: {
				inventoryAccuracy: {
					rate: Number(
						Math.min(100, inventoryAccuracyRate).toFixed(1),
					),
					totalVariance: Number(invAcc.total_variance.toFixed(0)),
				},
				deadStock: {
					totalValue: Math.round(deadStock.total_value),
					skuCount: deadStock.sku_count,
				},
				componentFailureCost: componentFailureCostRows.map((r) => ({
					name: r.product_name,
					cost: Math.round(r.total_cost),
					returnCount: r.return_count,
				})),
				repeatFailureRate: repeatFailureRows.map((r) => ({
					name: r.product_name,
					totalReturns: r.total_returns,
					repeatReturns: r.repeat_returns,
					rate:
						r.total_returns > 0
							? Number(
									(
										(r.repeat_returns / r.total_returns) *
										100
									).toFixed(1),
								)
							: 0,
				})),
				amcCompliance,
				repairVsReplace: {
					repairRate: Number(repairRate.toFixed(1)),
					replaceRate: Number(replaceRate.toFixed(1)),
					repaired: repairReplace.repaired,
					replaced: repairReplace.replaced,
					restocked: repairReplace.restocked,
				},
			},
			persona4: {
				regionalBalance,
				transferNeedUnits: Math.round(transferNeedTotal),
				warehouseBreakdown: warehouseStockRows.map((w) => ({
					id: w.id,
					name: w.name,
					qty: Math.round(w.total_qty),
					value: Math.round(w.total_value),
				})),
				reverseValueGap,
				recoveryBacklog: {
					total: recoveryBacklogTotal,
					byComponent: recoveryBacklogRows.map((r) => ({
						name: r.product_name,
						count: r.unit_count,
					})),
				},
				amcNonReturnExposure,
				highValueConcentration,
			},
			persona5: {
				inventoryCapitalAtRisk: {
					total: Math.round(totalCapitalAtRisk),
					deadStock: Math.round(capitalRisk.dead_stock_value),
					slowMoving: Math.round(capitalRisk.slow_moving_value),
					excessStock: Math.round(capitalRisk.excess_stock_value),
				},
				otifForecast: {
					currentRate: Number(otifRate.toFixed(1)),
					projectedRate: Number(otifForecastRate.toFixed(1)),
					trend: otifTrend,
				},
				reverseLeakage: {
					total: Math.round(leakageValue),
					pendingReturnValue: Math.round(totalReturnValue),
					recoveredValue: Math.round(totalRecoveredValue),
				},
				recoveryYield: {
					rate: Number(recoveryYieldRate.toFixed(1)),
					recoveredValue: Math.round(recovery.recovered_value),
					totalReturnValue: Math.round(recovery.total_return_value),
				},
				componentCostDrain: componentCostDrainRows.map((r) => ({
					name: r.product_name,
					cost: Math.round(r.replacement_cost),
					qty: Math.round(r.replacement_qty),
				})),
				recoveryOpportunity: {
					total: Math.round(
						recoveryBacklogRows.reduce(
							(s, r) =>
								s +
								r.unit_count *
									(componentCostDrainRows.find((c) =>
										c.product_name.includes(
											r.product_name.split(" ")[0] ?? "",
										),
									)?.replacement_cost ?? 0),
							0,
						),
					),
					repairableItems: recoveryBacklogTotal,
				},
			},
		};
}
