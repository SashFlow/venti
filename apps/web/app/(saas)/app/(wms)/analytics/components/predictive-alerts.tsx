"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowRight,
	Package,
	ThermometerSun,
	Wrench,
	X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function PredictiveAlerts({
	organizationId,
}: {
	organizationId: string;
}) {
	const queryClient = useQueryClient();

	const { data: demandData, isLoading: demandLoading } = useQuery({
		...orpc.analytics.predictiveDemand.queryOptions({
			input: { organizationId, zipCode: "500081" },
		}),
		enabled: Boolean(organizationId),
	});

	const { data: maintData, isLoading: maintLoading } = useQuery({
		...orpc.analytics.predictiveMaintenance.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
	});

	const { data: deadStockData, isLoading: deadLoading } = useQuery({
		...orpc.analytics.deadStockRebalance.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
	});

	const approveMutation = useMutation(
		orpc.analytics.approveInsight.mutationOptions(),
	);
	const dismissMutation = useMutation(
		orpc.analytics.dismissInsight.mutationOptions(),
	);

	const invalidate = async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.analytics.predictiveDemand.key(),
		});
		await queryClient.invalidateQueries({
			queryKey: orpc.analytics.predictiveMaintenance.key(),
		});
		await queryClient.invalidateQueries({
			queryKey: orpc.analytics.deadStockRebalance.key(),
		});
		await queryClient.invalidateQueries({
			queryKey: orpc.autopilot.listRecentActions.key(),
		});
	};

	const handleApprove = async (params: {
		insightType:
			| "demand_replenishment"
			| "dead_stock_transfer"
			| "maintenance_replenishment";
		insightKey: string;
		warehouseId?: string;
		skuId?: string;
		quantity?: number;
		fromLocationId?: string;
	}) => {
		try {
			const result = await approveMutation.mutateAsync({
				organizationId,
				...params,
			});
			await invalidate();
			toast.success(
				`Task created — ${result.task.type} for ${result.task.sku?.code ?? "SKU"}`,
			);
			if (result.highlightLocationId && result.task.warehouseId) {
				toast.info("View affected bin in 3D", {
					action: {
						label: "Open",
						onClick: () => {
							window.location.href = `/app/warehouse/${result.task.warehouseId}?tab=layout&view=3d&highlightLocationId=${result.highlightLocationId}`;
						},
					},
				});
			}
		} catch {
			toast.error("Failed to approve insight.");
		}
	};

	const handleDismiss = async (insightKey: string) => {
		try {
			await dismissMutation.mutateAsync({ organizationId, insightKey });
			await invalidate();
			toast.message("Insight dismissed");
		} catch {
			toast.error("Failed to dismiss insight.");
		}
	};

	const loading = demandLoading || maintLoading || deadLoading;
	const topRecommendation = demandData?.recommendations?.[0];

	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle>AI Insights & Approvals</CardTitle>
				{demandData?.dataSources && (
					<Badge variant="outline" className="text-[10px] font-normal">
						Weather: {demandData.dataSources.weather} · Inventory:{" "}
						{demandData.dataSources.inventory}
					</Badge>
				)}
			</CardHeader>
			<CardContent className="space-y-4">
				{loading ? (
					<div className="space-y-4">
						<div className="h-24 bg-muted/20 animate-pulse rounded-md" />
						<div className="h-24 bg-muted/20 animate-pulse rounded-md" />
					</div>
				) : (
					<>
						{demandData?.forecast && topRecommendation && (
							<div className="p-4 border rounded-xl bg-orange-500/5 border-orange-500/20 space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
										<ThermometerSun className="w-5 h-5 shrink-0" />
										<span>
											Weather Alert:{" "}
											{demandData.forecast.condition}
										</span>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 shrink-0"
										onClick={() =>
											handleDismiss(
												demandData.insightKey ??
													"demand:EXTREME_HEAT",
											)
										}
									>
										<X className="size-4" />
									</Button>
								</div>
								<p className="text-sm text-muted-foreground">
									{demandData.action} Top risk:{" "}
									<span className="font-mono font-medium text-foreground">
										{topRecommendation.skuCode}
									</span>{" "}
									({topRecommendation.onHand} on hand, ~
									{topRecommendation.daysOfCover}d cover)
								</p>
								<div className="flex gap-2">
									<Button
										size="sm"
										className="flex-1 gap-2"
										disabled={approveMutation.isPending}
										onClick={() =>
											handleApprove({
												insightType:
													"demand_replenishment",
												insightKey:
													demandData.insightKey ??
													"demand:EXTREME_HEAT",
												warehouseId:
													topRecommendation.warehouseId,
												skuId: topRecommendation.skuId,
												quantity:
													topRecommendation.suggestedQty,
											})
										}
									>
										Approve replenishment
										<ArrowRight className="w-4 h-4" />
									</Button>
								</div>
							</div>
						)}

						{deadStockData?.opportunities?.[0] && (
							<div className="p-4 border rounded-xl bg-amber-500/5 border-amber-500/20 space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
										<Package className="w-5 h-5 shrink-0" />
										<span>Dead stock rebalance</span>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={() =>
											handleDismiss(
												deadStockData.opportunities[0]!
													.insightKey,
											)
										}
									>
										<X className="size-4" />
									</Button>
								</div>
								<p className="text-sm text-muted-foreground">
									{deadStockData.opportunities[0].skuCode} at{" "}
									{deadStockData.opportunities[0].currentWarehouse}
									→ save ₹
									{Math.max(
										0,
										deadStockData.opportunities[0].netSavings,
									).toFixed(0)}
								</p>
								<Button
									size="sm"
									variant="secondary"
									className="w-full gap-2"
									disabled={approveMutation.isPending}
									onClick={() =>
										handleApprove({
											insightType: "dead_stock_transfer",
											insightKey:
												deadStockData.opportunities[0]!
													.insightKey,
											fromLocationId:
												deadStockData.opportunities[0]!
													.fromLocationId,
											skuId:
												deadStockData.opportunities[0]!
													.skuId,
											quantity:
												deadStockData.opportunities[0]!
													.qtyToMove,
										})
									}
								>
									Approve transfer task
									<ArrowRight className="w-4 h-4" />
								</Button>
							</div>
						)}

						{maintData?.alerts?.[0] && (
							<div className="p-4 border rounded-xl bg-blue-500/5 border-blue-500/20 space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
										<Wrench className="w-5 h-5 shrink-0" />
										<span>
											IoT Strain:{" "}
											{maintData.alerts[0].alertType}
										</span>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="size-7"
										onClick={() =>
											handleDismiss(
												maintData.alerts[0]!.insightKey,
											)
										}
									>
										<X className="size-4" />
									</Button>
								</div>
								<p className="text-sm text-muted-foreground">
									Serial {maintData.alerts[0].unitId} —{" "}
									{(maintData.alerts[0].confidence * 100).toFixed(
										0,
									)}
									% failure risk in{" "}
									{maintData.alerts[0].daysToFailureEstimate}{" "}
									days.
								</p>
								<Button
									size="sm"
									variant="secondary"
									className="w-full gap-2"
									disabled={approveMutation.isPending}
									onClick={() =>
										handleApprove({
											insightType:
												"maintenance_replenishment",
											insightKey:
												maintData.alerts[0]!.insightKey,
											skuId: maintData.alerts[0]!.skuId,
										})
									}
								>
									Approve parts replenishment
									<ArrowRight className="w-4 h-4" />
								</Button>
							</div>
						)}

						{!topRecommendation &&
							!deadStockData?.opportunities?.length &&
							!maintData?.alerts?.length && (
								<p className="text-sm text-muted-foreground text-center py-6">
									No actionable insights.{" "}
									<Link
										href="/app/warehouse"
										className="text-primary underline"
									>
										Check inventory
									</Link>
								</p>
							)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
