"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	OrgCurrencyProvider,
	useOrgCurrency,
} from "@saas/organizations/hooks/use-org-currency";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Package,
	TrendingDown,
	TrendingUp,
} from "lucide-react";

function KpiSummaryContent({ organizationId }: { organizationId: string }) {
	const { formatCurrency } = useOrgCurrency();
	const { data, isLoading } = useQuery({
		...orpc.analytics.dashboard.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
		staleTime: 60_000,
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardHeader className="pb-2">
							<div className="h-3 w-20 rounded bg-muted" />
						</CardHeader>
						<CardContent>
							<div className="h-7 w-16 rounded bg-muted" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!data) return null;

	const otifTrend =
		data.persona5.otifForecast.projectedRate -
		data.persona5.otifForecast.currentRate;

	const cards = [
		{
			title: "OTIF Rate",
			value: `${data.persona2.otif.rate}%`,
			sub: `${data.persona2.otif.onTimeOrders}/${data.persona2.otif.totalOrders} orders (7d)`,
			icon: data.persona2.otif.rate >= 95 ? TrendingUp : TrendingDown,
			color:
				data.persona2.otif.rate >= 95
					? "text-green-600"
					: data.persona2.otif.rate >= 88
						? "text-amber-600"
						: "text-red-600",
		},
		{
			title: "Inventory Accuracy",
			value: `${data.persona3.inventoryAccuracy.rate}%`,
			sub: `Variance: ${data.persona3.inventoryAccuracy.totalVariance} units`,
			icon: CheckCircle2,
			color:
				data.persona3.inventoryAccuracy.rate >= 99
					? "text-green-600"
					: "text-amber-600",
		},
		{
			title: "Capital at Risk",
			value: formatCurrency(data.persona5.inventoryCapitalAtRisk.total),
			sub: `${data.persona3.deadStock.skuCount} dead-stock SKUs`,
			icon: AlertCircle,
			color: "text-red-600",
		},
		{
			title: "Recovery Yield",
			value: `${data.persona5.recoveryYield.rate}%`,
			sub: `Projected OTIF ${otifTrend >= 0 ? "+" : ""}${otifTrend.toFixed(1)}%`,
			icon: Package,
			color:
				data.persona5.recoveryYield.rate >= 80
					? "text-green-600"
					: "text-amber-600",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<Card key={card.title}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
								{card.title}
							</CardTitle>
							<Icon className={`size-4 shrink-0 ${card.color}`} />
						</CardHeader>
						<CardContent>
							<div className={`text-lg font-bold sm:text-2xl ${card.color}`}>
								{card.value}
							</div>
							<p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
								{card.sub}
							</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

export function KpiSummary({ organizationId }: { organizationId: string }) {
	return (
		<OrgCurrencyProvider organizationId={organizationId}>
			<KpiSummaryContent organizationId={organizationId} />
		</OrgCurrencyProvider>
	);
}
