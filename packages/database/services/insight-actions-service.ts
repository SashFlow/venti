import { db } from "../prisma";
import {
	dismissInsight,
	getDeadStockRebalanceOpportunities,
	getPredictiveDemandInsights,
	getPredictiveMaintenanceAlerts,
} from "./insights-service";
import { createWarehouseTask } from "./tasks-service";

export type ApproveInsightParams = {
	organizationId: string;
	insightType:
		| "demand_replenishment"
		| "dead_stock_transfer"
		| "maintenance_replenishment";
	insightKey: string;
	warehouseId?: string;
	skuId?: string;
	quantity?: number;
	fromLocationId?: string;
	toLocationId?: string;
};

export async function approveInsight(params: ApproveInsightParams) {
	if (params.insightType === "demand_replenishment") {
		if (!params.warehouseId || !params.skuId) {
			throw new Error("warehouseId and skuId are required.");
		}

		const demand = await getPredictiveDemandInsights(params.organizationId);
		const match =
			demand.recommendations.find((r) => r.skuId === params.skuId) ??
			demand.recommendations[0];

		const quantity = params.quantity ?? match?.suggestedQty ?? 10;
		const toLocationId = params.toLocationId ?? match?.locationId;

		const task = await createWarehouseTask({
			organizationId: params.organizationId,
			warehouseId: params.warehouseId,
			type: "REPLENISHMENT",
			skuId: params.skuId,
			quantity,
			toLocationId,
			priority: "HIGH",
		});

		return {
			task,
			highlightLocationId: toLocationId ?? task.toLocationId ?? undefined,
		};
	}

	if (params.insightType === "dead_stock_transfer") {
		const deadStock = await getDeadStockRebalanceOpportunities(
			params.organizationId,
		);
		const opp =
			deadStock.opportunities.find(
				(o) => o.insightKey === params.insightKey,
			) ?? deadStock.opportunities[0];

		if (!opp) {
			throw new Error("No dead stock opportunity found.");
		}

		const task = await createWarehouseTask({
			organizationId: params.organizationId,
			warehouseId: opp.currentWarehouseId,
			type: "MOVE",
			skuId: opp.skuId,
			quantity: params.quantity ?? opp.qtyToMove,
			fromLocationId: params.fromLocationId ?? opp.fromLocationId,
			toLocationId: params.toLocationId,
			priority: "NORMAL",
		});

		return {
			task,
			highlightLocationId:
				opp.fromLocationId ?? task.fromLocationId ?? undefined,
		};
	}

	if (params.insightType === "maintenance_replenishment") {
		const maint = await getPredictiveMaintenanceAlerts(params.organizationId);
		const alert =
			maint.alerts.find((a) => a.insightKey === params.insightKey) ??
			maint.alerts[0];

		if (!alert) {
			throw new Error("No maintenance alert found.");
		}

		const warehouse = params.warehouseId
			? { id: params.warehouseId }
			: await db.warehouse.findFirst({
					where: { organizationId: params.organizationId },
					orderBy: { createdAt: "asc" },
				});

		if (!warehouse) {
			throw new Error("No warehouse found.");
		}

		const task = await createWarehouseTask({
			organizationId: params.organizationId,
			warehouseId: warehouse.id,
			type: "REPLENISHMENT",
			skuId: alert.skuId,
			quantity: params.quantity ?? 1,
			toLocationId: alert.locationId,
			priority: "URGENT",
		});

		return {
			task,
			highlightLocationId: alert.locationId,
		};
	}

	throw new Error("Unsupported insight type.");
}

export { dismissInsight };
