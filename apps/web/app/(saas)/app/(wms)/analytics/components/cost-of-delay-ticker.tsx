"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, TrendingDown } from "lucide-react";
import { Card } from "@repo/ui/card";

export function CostOfDelayTicker({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data, isLoading } = useQuery({
		...orpc.analytics.costOfDelay.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
	});

	if (isLoading)
		return <Card className="p-4 animate-pulse h-16 bg-muted/20" />;
	if (!data) return null;

	return (
		<Card className="flex items-center justify-between p-4 bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400">
			<div className="flex items-center gap-3">
				<TrendingDown className="h-5 w-5" />
				<span className="font-semibold text-lg">
					Current Profit Bleed: $
					{data.currentBleedRatePerHour.toFixed(2)}/hr
				</span>
			</div>
			<div className="flex items-center gap-2 text-sm">
				<AlertCircle className="h-4 w-4" />
				<span>Bottleneck: {data.criticalBottleneck}</span>
			</div>
		</Card>
	);
}
