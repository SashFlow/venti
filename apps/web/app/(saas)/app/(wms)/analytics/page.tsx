"use client";

import { useSession } from "@saas/auth/hooks/use-session";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { CostOfDelayTicker } from "./components/cost-of-delay-ticker";
import { FinancialLedger } from "./components/financial-ledger";
import { GeospatialMap } from "./components/geospatial-map";
import { InboundOutboundTimeline } from "./components/inbound-outbound-timeline";
import { KpiSummary } from "./components/kpi-summary";
import { OperationsMetrics } from "./components/operations-metrics";
import { OutlierInsights } from "./components/outlier-insights";
import { PredictiveAlerts } from "./components/predictive-alerts";
import { SkuInvestmentQuadrant } from "./components/sku-investment-quadrant";

export default function AnalyticsDashboardPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	if (!organizationId) return null;

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
			<div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
						Analytics & Control Tower
					</h1>
					<p className="text-sm text-muted-foreground sm:text-base">
						Real-time supply chain intelligence, flow trends, SKU
						capital allocation, and financial ledgers.
					</p>
				</div>

				<CostOfDelayTicker organizationId={organizationId} />

				<KpiSummary organizationId={organizationId} />

				<InboundOutboundTimeline organizationId={organizationId} />

				<OutlierInsights organizationId={organizationId} />

				<Tabs defaultValue="operations" className="flex w-full flex-col gap-4">
					<TabsList className="h-auto w-full shrink-0 justify-start overflow-x-auto">
						<TabsTrigger
							value="operations"
							className="h-10 flex-none px-3 text-xs sm:text-sm"
						>
							Operations & AI Alerts
						</TabsTrigger>
						<TabsTrigger
							value="performance"
							className="h-10 flex-none px-3 text-xs sm:text-sm"
						>
							Performance Metrics
						</TabsTrigger>
						<TabsTrigger
							value="financials"
							className="h-10 flex-none px-3 text-xs sm:text-sm"
						>
							Capital & Ledger
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="operations"
						className="flex-none space-y-4"
					>
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
							<div className="lg:col-span-2">
								<GeospatialMap organizationId={organizationId} />
							</div>
							<div className="lg:col-span-1">
								<PredictiveAlerts organizationId={organizationId} />
							</div>
						</div>
					</TabsContent>

					<TabsContent value="performance" className="flex-none space-y-4">
						<SkuInvestmentQuadrant organizationId={organizationId} />
						<OperationsMetrics organizationId={organizationId} />
					</TabsContent>

					<TabsContent value="financials" className="flex-none">
						<FinancialLedger organizationId={organizationId} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
