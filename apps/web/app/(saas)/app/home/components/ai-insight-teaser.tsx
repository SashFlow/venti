"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, ThermometerSun } from "lucide-react";
import Link from "next/link";

export function AiInsightTeaser({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data } = useQuery({
		...orpc.analytics.predictiveDemand.queryOptions({
			input: { organizationId, zipCode: "110001" },
		}),
		enabled: Boolean(organizationId),
		staleTime: 120_000,
	});

	const top = data?.recommendations?.[0];
	if (!data?.forecast || !top) {
		return null;
	}

	return (
		<Card className="border-orange-500/30 bg-orange-500/5">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-400">
					<ThermometerSun className="size-4" />
					AI insight — {data.forecast.condition.replace("_", " ")}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<p className="text-sm text-muted-foreground">
					<span className="font-mono font-medium text-foreground">
						{top.skuCode}
					</span>{" "}
					stockout risk at {top.warehouseName} (~{top.daysOfCover}d
					cover). Suggested replenishment: {top.suggestedQty} units.
				</p>
				<Button size="sm" variant="outline" asChild className="shrink-0 gap-2">
					<Link href="/app/analytics">
						Review in Control Tower
						<ArrowRight className="size-4" />
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
