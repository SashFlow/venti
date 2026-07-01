"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@repo/ui/card";

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
		<Card className="border-red-500/20 bg-red-500/5">
			<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3 min-w-0">
					<TrendingDown className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
					<div className="min-w-0">
						<span className="font-semibold text-base sm:text-lg text-red-700 dark:text-red-400">
							Current Profit Bleed: $
							{data.currentBleedRatePerHour.toFixed(2)}/hr
						</span>
						{data.action && (
							<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
								{data.action}
							</p>
						)}
					</div>
				</div>
				<div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400 sm:max-w-[45%] sm:text-right">
					<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
					<span className="line-clamp-3">
						Bottleneck: {data.criticalBottleneck}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
