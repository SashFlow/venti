"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	OrgCurrencyProvider,
	useOrgCurrency,
} from "@saas/organizations/hooks/use-org-currency";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Layers, Timer } from "lucide-react";

function ProgressBar({
	value,
	max,
	color = "bg-primary",
}: {
	value: number;
	max: number;
	color?: string;
}) {
	const pct = Math.min(100, (value / Math.max(1, max)) * 100);
	return (
		<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
			<div
				className={`h-2 rounded-full transition-all ${color}`}
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

function OperationsMetricsContent({
	organizationId,
}: {
	organizationId: string;
}) {
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
			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardContent className="h-48 p-6" />
					</Card>
				))}
			</div>
		);
	}

	if (!data) return null;

	const maxBottleneck = Math.max(
		...data.persona2.bottleneckZones.map((z) => z.avgDelayMinutes),
		1,
	);
	const maxFailure = Math.max(
		...data.persona3.componentFailureCost.map((c) => c.cost),
		1,
	);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-sm">
						<Timer className="size-4 text-orange-500" />
						Bottleneck Zones
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{data.persona2.bottleneckZones.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No completed task data for zone analysis
						</p>
					) : (
						data.persona2.bottleneckZones.slice(0, 6).map((zone) => (
							<div key={zone.name}>
								<div className="mb-1 flex items-center justify-between text-sm">
									<span className="truncate font-medium max-w-[60%]">
										{zone.name}
									</span>
									<span className="font-mono text-xs text-muted-foreground">
										{zone.avgDelayMinutes} min
									</span>
								</div>
								<ProgressBar
									value={zone.avgDelayMinutes}
									max={maxBottleneck}
									color={
										zone.avgDelayMinutes > 45
											? "bg-red-500"
											: zone.avgDelayMinutes > 25
												? "bg-amber-500"
												: "bg-green-500"
									}
								/>
							</div>
						))
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-sm">
						<BarChart3 className="size-4 text-red-500" />
						Component Failure Cost (30d)
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{data.persona3.componentFailureCost.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No return cost data in the last 30 days
						</p>
					) : (
						data.persona3.componentFailureCost.slice(0, 6).map((item) => (
							<div key={item.name}>
								<div className="mb-1 flex items-center justify-between text-sm">
									<span className="truncate font-medium max-w-[55%]">
										{item.name}
									</span>
									<span className="font-mono text-xs">
										{formatCurrency(item.cost)}
										<span className="text-muted-foreground ml-1">
											({item.returnCount})
										</span>
									</span>
								</div>
								<ProgressBar
									value={item.cost}
									max={maxFailure}
									color="bg-red-500"
								/>
							</div>
						))
					)}
				</CardContent>
			</Card>

			<Card className="lg:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-sm">
						<Layers className="size-4 text-blue-500" />
						Warehouse Inventory Distribution
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{data.persona4.warehouseBreakdown.map((wh) => {
							const balance = data.persona4.regionalBalance.find(
								(b) => b.name === wh.name,
							);
							return (
								<div
									key={wh.id}
									className="rounded-lg border p-3 space-y-2"
								>
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm truncate">
											{wh.name}
										</span>
										<span
											className={`text-xs font-semibold ${(balance?.score ?? 0) >= 60 ? "text-green-600" : "text-amber-600"}`}
										>
											{balance?.score ?? "—"}/100
										</span>
									</div>
									<p className="text-xs text-muted-foreground">
										{wh.qty.toLocaleString()} units ·{" "}
										{formatCurrency(wh.value)}
									</p>
									<ProgressBar
										value={balance?.score ?? 0}
										max={100}
										color={
											(balance?.score ?? 0) >= 60
												? "bg-green-500"
												: "bg-amber-500"
										}
									/>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export function OperationsMetrics({
	organizationId,
}: {
	organizationId: string;
}) {
	return (
		<OrgCurrencyProvider organizationId={organizationId}>
			<OperationsMetricsContent organizationId={organizationId} />
		</OrgCurrencyProvider>
	);
}
