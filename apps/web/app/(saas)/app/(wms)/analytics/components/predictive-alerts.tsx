"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { orpc } from "@shared/lib/orpc-query-utils";
import { ThermometerSun, Wrench, ArrowRight } from "lucide-react";
import { Badge } from "@repo/ui/badge";

export function PredictiveAlerts({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data: demandData, isLoading: demandLoading } =
		orpc.analytics.predictiveDemand.useQuery({
			organizationId,
			zipCode: "75001",
		});

	const { data: maintData, isLoading: maintLoading } =
		orpc.analytics.predictiveMaintenance.useQuery({
			organizationId,
		});

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>AI Insights & Approvals</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{demandLoading || maintLoading ? (
					<div className="space-y-4">
						<div className="h-24 bg-muted/20 animate-pulse rounded-md" />
						<div className="h-24 bg-muted/20 animate-pulse rounded-md" />
					</div>
				) : (
					<>
						{/* Weather Demand Card */}
						{demandData && (
							<div className="p-4 border rounded-xl bg-orange-500/5 border-orange-500/20 space-y-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium">
										<ThermometerSun className="w-5 h-5" />
										<span>
											Weather Alert:{" "}
											{demandData.forecast.condition}
										</span>
									</div>
									<Badge variant="destructive">
										Action Required
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">
									{demandData.action}. AI suggests
									transferring{" "}
									{demandData.recommendations.length} critical
									SKUs based on historical failure rates.
								</p>
								<Button size="sm" className="w-full gap-2">
									Review Transfer Order{" "}
									<ArrowRight className="w-4 h-4" />
								</Button>
							</div>
						)}

						{/* Predictive Maintenance Card */}
						{maintData?.alerts.map((alert, i) => (
							<div
								key={i}
								className="p-4 border rounded-xl bg-blue-500/5 border-blue-500/20 space-y-3"
							>
								<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
									<Wrench className="w-5 h-5" />
									<span>IoT Strain: {alert.alertType}</span>
								</div>
								<p className="text-sm text-muted-foreground">
									Unit {alert.unitId} at{" "}
									{alert.customerLocationId} has a{" "}
									{(alert.confidence * 100).toFixed(0)}%
									chance of failure in{" "}
									{alert.daysToFailureEstimate} days.
								</p>
								<p className="text-xs text-muted-foreground font-medium">
									Recommended: {alert.action}
								</p>
								<Button
									size="sm"
									variant="secondary"
									className="w-full gap-2"
								>
									Draft Purchase Order{" "}
									<ArrowRight className="w-4 h-4" />
								</Button>
							</div>
						))}
					</>
				)}
			</CardContent>
		</Card>
	);
}
