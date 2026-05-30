"use client";

import { useSession } from "@saas/auth/hooks/use-session";
import { CostOfDelayTicker } from "./components/cost-of-delay-ticker";
import { GeospatialMap } from "./components/geospatial-map";
import { PredictiveAlerts } from "./components/predictive-alerts";
import { FinancialLedger } from "./components/financial-ledger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

export default function AnalyticsDashboardPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	if (!organizationId) return null;

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="space-y-1">
				<h1 className="text-3xl font-semibold tracking-tight">
					Analytics & Control Tower
				</h1>
				<p className="text-muted-foreground">
					Real-time supply chain intelligence and financial ledgers.
				</p>
			</div>

			<CostOfDelayTicker organizationId={organizationId} />

			<Tabs defaultValue="operations" className="w-full">
				<TabsList>
					<TabsTrigger value="operations">
						Operations & AI Alerts
					</TabsTrigger>
					<TabsTrigger value="financials">
						Capital & Ledger
					</TabsTrigger>
				</TabsList>

				<TabsContent value="operations" className="mt-6 space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<GeospatialMap organizationId={organizationId} />
						</div>
						<div className="lg:col-span-1">
							<PredictiveAlerts organizationId={organizationId} />
						</div>
					</div>
				</TabsContent>

				<TabsContent value="financials" className="mt-6">
					<FinancialLedger organizationId={organizationId} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
