import { approveInsightProcedure } from "./procedures/approve-insight";
import { dismissInsightProcedure } from "./procedures/dismiss-insight";
import { getGeospatialRiskProcedure } from "./procedures/get-geospatial-risk";
import { getTruckStockRecommendationProcedure } from "./procedures/get-truck-stock-recommendation";
import { getPredictiveMaintenanceProcedure } from "./procedures/get-predictive-maintenance";
import { getDeadStockRebalanceProcedure } from "./procedures/get-dead-stock-rebalance";
import { getCostOfDelayProcedure } from "./procedures/get-cost-of-delay";
import { getPredictiveDemandProcedure } from "./procedures/get-predictive-demand";
import { getCostLedgerProcedure } from "./procedures/get-cost-ledger";
import { getDashboardAnalyticsProcedure } from "./procedures/get-dashboard-analytics";
import { getOutlierInsightsProcedure } from "./procedures/get-outlier-insights";

export const analyticsRouter = {
        geospatialRisk: getGeospatialRiskProcedure,
        truckStockRecommendation: getTruckStockRecommendationProcedure,
        predictiveMaintenance: getPredictiveMaintenanceProcedure,
        deadStockRebalance: getDeadStockRebalanceProcedure,
        costOfDelay: getCostOfDelayProcedure,
        predictiveDemand: getPredictiveDemandProcedure,
        getCostLedger: getCostLedgerProcedure,
	dashboard: getDashboardAnalyticsProcedure,
	outlierInsights: getOutlierInsightsProcedure,
	approveInsight: approveInsightProcedure,
	dismissInsight: dismissInsightProcedure,
};
