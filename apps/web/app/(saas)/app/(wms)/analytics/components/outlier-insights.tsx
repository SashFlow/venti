"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/collapsible";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import {
	AlertTriangle,
	Bot,
	CheckCircle2,
	ChevronDown,
	ExternalLink,
	Lightbulb,
	RefreshCw,
	Search,
	Sparkles,
} from "lucide-react";
import { useState } from "react";

const severityStyles = {
	critical: "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400",
	warning:
		"border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
	info: "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400",
} as const;

export function OutlierInsights({
	organizationId,
}: {
	organizationId: string;
}) {
	const [openId, setOpenId] = useState<string | null>(null);

	const { data, isLoading, isFetching, refetch } = useQuery({
		...orpc.analytics.outlierInsights.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
		staleTime: 5 * 60_000,
	});

	return (
		<Card>
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
						<Sparkles className="size-5 text-primary" />
						Outlier Detection & AI Analysis
					</CardTitle>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Statistical anomalies enriched with web research
						{data?.summary.aiEnabled ? " and GPT analysis" : " (rule-based fallback)"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{data?.summary && (
						<div className="flex gap-1.5">
							{data.summary.critical > 0 && (
								<Badge variant="destructive" className="text-xs">
									{data.summary.critical} critical
								</Badge>
							)}
							{data.summary.warning > 0 && (
								<Badge
									variant="outline"
									className="border-amber-500/50 text-amber-700 text-xs"
								>
									{data.summary.warning} warning
								</Badge>
							)}
						</div>
					)}
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5"
						onClick={() => refetch()}
						disabled={isFetching}
					>
						<RefreshCw
							className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-20 animate-pulse rounded-lg bg-muted/30"
							/>
						))}
					</div>
				) : !data?.outliers.length ? (
					<div className="flex flex-col items-center gap-2 py-8 text-center">
						<CheckCircle2 className="size-8 text-green-500" />
						<p className="text-sm text-muted-foreground">
							No significant outliers detected. Operations are within
							expected ranges.
						</p>
					</div>
				) : (
					data.outliers.map((outlier) => (
						<Collapsible
							key={outlier.id}
							open={openId === outlier.id}
							onOpenChange={(open) =>
								setOpenId(open ? outlier.id : null)
							}
						>
							<div
								className={`rounded-lg border p-4 ${severityStyles[outlier.severity]}`}
							>
								<CollapsibleTrigger className="flex w-full items-start justify-between gap-3 text-left">
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<AlertTriangle className="size-4 shrink-0" />
											<span className="font-semibold text-sm sm:text-base">
												{outlier.metric}
											</span>
											<Badge
												variant="outline"
												className="text-[10px] capitalize"
											>
												{outlier.severity}
											</Badge>
											{outlier.aiPowered && (
												<Badge
													variant="secondary"
													className="gap-1 text-[10px]"
												>
													<Bot className="size-3" />
													AI
												</Badge>
											)}
										</div>
										<p className="text-sm font-medium">
											{outlier.value}
										</p>
										<p className="text-xs opacity-80">
											Expected: {outlier.expectedRange}
										</p>
									</div>
									<ChevronDown
										className={`size-4 shrink-0 transition-transform ${openId === outlier.id ? "rotate-180" : ""}`}
									/>
								</CollapsibleTrigger>

								<CollapsibleContent className="mt-4 space-y-4 border-t border-current/10 pt-4">
									<div>
										<h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
											<Bot className="size-3.5" />
											Analysis
										</h4>
										<p className="text-sm leading-relaxed">
											{outlier.analysis}
										</p>
									</div>

									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
												<Search className="size-3.5" />
												Likely Causes
											</h4>
											<ul className="space-y-1.5 text-sm">
												{outlier.likelyCauses.map((cause) => (
													<li
														key={cause}
														className="flex gap-2"
													>
														<span className="opacity-50">•</span>
														{cause}
													</li>
												))}
											</ul>
										</div>
										<div>
											<h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
												<Lightbulb className="size-3.5" />
												Recommended Actions
											</h4>
											<ul className="space-y-1.5 text-sm">
												{outlier.recommendedActions.map(
													(action) => (
														<li
															key={action}
															className="flex gap-2"
														>
															<span className="opacity-50">→</span>
															{action}
														</li>
													),
												)}
											</ul>
										</div>
									</div>

									{outlier.webSources.length > 0 && (
										<div>
											<h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-80">
												<ExternalLink className="size-3.5" />
												Web Research
											</h4>
											<div className="space-y-2">
												{outlier.webSources.map((source, i) => (
													<div
														key={i}
														className="rounded-md bg-background/60 p-2.5 text-xs"
													>
														<p className="font-medium">
															{source.title}
														</p>
														<p className="mt-0.5 text-muted-foreground line-clamp-2">
															{source.snippet}
														</p>
													</div>
												))}
											</div>
										</div>
									)}
								</CollapsibleContent>
							</div>
						</Collapsible>
					))
				)}
			</CardContent>
		</Card>
	);
}
