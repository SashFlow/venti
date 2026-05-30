import { getGeospatialRiskProcedure } from "./procedures/get-geospatial-risk";
import { getTruckStockRecommendationProcedure } from "./procedures/get-truck-stock-recommendation";
import { getPredictiveMaintenanceProcedure } from "./procedures/get-predictive-maintenance";
import { getDeadStockRebalanceProcedure } from "./procedures/get-dead-stock-rebalance";
import { getCostOfDelayProcedure } from "./procedures/get-cost-of-delay";
import { getPredictiveDemandProcedure } from "./procedures/get-predictive-demand";
import { getCostLedgerProcedure } from "./procedures/get-cost-ledger";
import { getDashboardAnalyticsProcedure } from "./procedures/get-dashboard-analytics";

export const analyticsRouter = {
        geospatialRisk: getGeospatialRiskProcedure,
        truckStockRecommendation: getTruckStockRecommendationProcedure,
        predictiveMaintenance: getPredictiveMaintenanceProcedure,
        deadStockRebalance: getDeadStockRebalanceProcedure,
        costOfDelay: getCostOfDelayProcedure,
        predictiveDemand: getPredictiveDemandProcedure,
        getCostLedger: getCostLedgerProcedure,
	dashboard: getDashboardAnalyticsProcedure,
};
