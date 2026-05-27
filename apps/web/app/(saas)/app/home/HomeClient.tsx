"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	BarChart3,
	CheckCircle2,
	Clock,
	Cpu,
	DollarSign,
	Layers,
	Package,
	RefreshCw,
	ShieldCheck,
	Timer,
	TrendingDown,
	TrendingUp,
	Truck,
	Users,
	Warehouse,
	Wrench,
	Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalyticsData = {
	persona1: {
		openTaskAging: { avgMinutes: number; openCount: number };
		firstPassAccuracy: {
			rate: number;
			completedCount: number;
			totalCount: number;
		};
		reverseProcessingAging: {
			avgDays: number;
			bucket0to3: number;
			bucket4to7: number;
			bucket7plus: number;
		};
	};
	persona2: {
		otif: {
			rate: number;
			totalOrders: number;
			onTimeOrders: number;
			trend: { date: string; rate: number }[];
		};
		bottleneckZones: { name: string; avgDelayMinutes: number }[];
		fifoCompliance: { rate: number; compliant: number; total: number };
		highValueReverseAging: { avgDays: number; totalValue: number };
	};
	persona3: {
		inventoryAccuracy: { rate: number; totalVariance: number };
		deadStock: { totalValue: number; skuCount: number };
		componentFailureCost: {
			name: string;
			cost: number;
			returnCount: number;
		}[];
		repeatFailureRate: {
			name: string;
			totalReturns: number;
			repeatReturns: number;
			rate: number;
		}[];
		amcCompliance: {
			name: string;
			total: number;
			returned: number;
			rate: number;
		}[];
		repairVsReplace: {
			repairRate: number;
			replaceRate: number;
			repaired: number;
			replaced: number;
			restocked: number;
		};
	};
	persona4: {
		regionalBalance: { warehouseId: string; name: string; score: number }[];
		transferNeedUnits: number;
		warehouseBreakdown: {
			id: string;
			name: string;
			qty: number;
			value: number;
		}[];
		reverseValueGap: {
			warehouseId: string;
			name: string;
			pendingValue: number;
			recoveredValue: number;
			gap: number;
		}[];
		recoveryBacklog: {
			total: number;
			byComponent: { name: string; count: number }[];
		};
		amcNonReturnExposure: { name: string; cost: number }[];
		highValueConcentration: { name: string; cost: number; pct: number }[];
	};
	persona5: {
		inventoryCapitalAtRisk: {
			total: number;
			deadStock: number;
			slowMoving: number;
			excessStock: number;
		};
		otifForecast: {
			currentRate: number;
			projectedRate: number;
			trend: { date: string; rate: number }[];
		};
		reverseLeakage: {
			total: number;
			pendingReturnValue: number;
			recoveredValue: number;
		};
		recoveryYield: {
			rate: number;
			recoveredValue: number;
			totalReturnValue: number;
		};
		componentCostDrain: { name: string; cost: number; qty: number }[];
		recoveryOpportunity: { total: number; repairableItems: number };
	};
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
	if (amount >= 10_000_000) {
		return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
	}
	if (amount >= 100_000) {
		return `₹${(amount / 100_000).toFixed(1)} L`;
	}
	if (amount >= 1_000) {
		return `₹${(amount / 1_000).toFixed(0)}K`;
	}
	return `₹${amount.toFixed(0)}`;
}

function formatMinutes(mins: number): string {
	if (mins < 60) {
		return `${mins} min`;
	}
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function TrendArrow({
	value,
	inverse = false,
}: {
	value: number;
	inverse?: boolean;
}) {
	const positive = inverse ? value < 0 : value > 0;
	if (value === 0) {
		return <span className="text-gray-400 text-sm">→ flat</span>;
	}
	return (
		<span
			className={`inline-flex items-center gap-0.5 text-sm font-medium ${positive ? "text-green-600" : "text-red-600"}`}
		>
			{positive ? (
				<ArrowUp className="w-3.5 h-3.5" />
			) : (
				<ArrowDown className="w-3.5 h-3.5" />
			)}
			{Math.abs(value).toFixed(1)}%
		</span>
	);
}

function ProgressBar({
	value,
	max = 100,
	color = "bg-blue-500",
}: {
	value: number;
	max?: number;
	color?: string;
}) {
	const pct = Math.min(100, (value / Math.max(1, max)) * 100);
	return (
		<div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
			<div
				className={`h-2 rounded-full ${color} transition-all`}
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

function KpiCard({
	title,
	value,
	sub,
	icon: Icon,
	trend,
	color = "text-blue-600",
	trendInverse = false,
}: {
	title: string;
	value: string;
	sub?: string;
	icon: React.ComponentType<{ className?: string }>;
	trend?: number;
	color?: string;
	trendInverse?: boolean;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				<Icon className={`h-4 w-4 ${color}`} />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{sub && (
					<p className="text-xs text-muted-foreground mt-1">{sub}</p>
				)}
				{trend !== undefined && (
					<div className="mt-1">
						<TrendArrow value={trend} inverse={trendInverse} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function MiniSparkline({ data }: { data: { date: string; rate: number }[] }) {
	if (data.length < 2) {
		return null;
	}
	const max = Math.max(...data.map((d) => d.rate), 100);
	const min = Math.min(...data.map((d) => d.rate), 0);
	const range = max - min || 1;
	const h = 32;
	const w = 80;
	const pts = data
		.map(
			(d, i) =>
				`${(i / (data.length - 1)) * w},${h - ((d.rate - min) / range) * h}`,
		)
		.join(" ");
	return (
		<svg
			width={w}
			height={h}
			className="inline-block align-middle ml-2"
			aria-hidden="true"
			role="presentation"
		>
			<polyline
				points={pts}
				fill="none"
				stroke="#3b82f6"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

function SkeletonCard() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
			</CardHeader>
			<CardContent>
				<div className="h-7 bg-gray-100 rounded w-16 animate-pulse mb-2" />
				<div className="h-2 bg-gray-100 rounded w-32 animate-pulse" />
			</CardContent>
		</Card>
	);
}

// ─── Persona 1: Warehouse Associate ──────────────────────────────────────────

function WarehouseAssociatePanel({
	data,
}: {
	data: AnalyticsData["persona1"];
}) {
	const { openTaskAging, firstPassAccuracy, reverseProcessingAging } = data;
	const reverseTotal =
		reverseProcessingAging.bucket0to3 +
		reverseProcessingAging.bucket4to7 +
		reverseProcessingAging.bucket7plus;
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<KpiCard
					title="Open Task Aging"
					value={formatMinutes(openTaskAging.avgMinutes)}
					sub={`${openTaskAging.openCount} open tasks`}
					icon={Clock}
					color="text-orange-600"
				/>
				<KpiCard
					title="First-Pass Accuracy"
					value={`${firstPassAccuracy.rate}%`}
					sub={`${firstPassAccuracy.completedCount} / ${firstPassAccuracy.totalCount} tasks (30d)`}
					icon={CheckCircle2}
					color={
						firstPassAccuracy.rate >= 95
							? "text-green-600"
							: "text-amber-600"
					}
				/>
				<KpiCard
					title="Reverse Aging"
					value={`${reverseProcessingAging.avgDays}d avg`}
					sub={`${reverseTotal} returns pending`}
					icon={RefreshCw}
					color={
						reverseProcessingAging.avgDays > 5
							? "text-red-600"
							: "text-blue-600"
					}
				/>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">
						First-Pass Accuracy
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							{firstPassAccuracy.completedCount} correctly
							completed
						</span>
						<span className="font-semibold">
							{firstPassAccuracy.rate}%
						</span>
					</div>
					<ProgressBar
						value={firstPassAccuracy.rate}
						color={
							firstPassAccuracy.rate >= 95
								? "bg-green-500"
								: "bg-amber-500"
						}
					/>
					<p className="text-xs text-muted-foreground">
						Target: 98% — Based on last 30 days
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">
						Reverse Processing Aging Buckets
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-3">
						{[
							{
								label: "0–3 days",
								value: reverseProcessingAging.bucket0to3,
								color: "bg-green-100 text-green-800",
							},
							{
								label: "4–7 days",
								value: reverseProcessingAging.bucket4to7,
								color: "bg-amber-100 text-amber-800",
							},
							{
								label: "7+ days",
								value: reverseProcessingAging.bucket7plus,
								color: "bg-red-100 text-red-800",
							},
						].map((b) => (
							<div
								key={b.label}
								className={`rounded-lg p-3 text-center ${b.color}`}
							>
								<div className="text-2xl font-bold">
									{b.value}
								</div>
								<div className="text-xs font-medium mt-1">
									{b.label}
								</div>
							</div>
						))}
					</div>
					{reverseProcessingAging.bucket7plus > 0 && (
						<div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded p-2">
							<AlertTriangle className="w-3.5 h-3.5 shrink-0" />
							{reverseProcessingAging.bucket7plus} returned units
							pending more than 7 days
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Persona 2: Warehouse Control Lead ───────────────────────────────────────

function WarehouseControlLeadPanel({
	data,
}: {
	data: AnalyticsData["persona2"];
}) {
	const { otif, bottleneckZones, fifoCompliance, highValueReverseAging } =
		data;
	const otifColor =
		otif.rate >= 95
			? "text-green-600"
			: otif.rate >= 88
				? "text-amber-600"
				: "text-red-600";
	const maxDelay = Math.max(
		...bottleneckZones.map((z) => z.avgDelayMinutes),
		1,
	);
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="sm:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							OTIF (On-Time In-Full)
						</CardTitle>
						<TrendingUp className={`h-4 w-4 ${otifColor}`} />
					</CardHeader>
					<CardContent>
						<div className={`text-3xl font-bold ${otifColor}`}>
							{otif.rate}%<MiniSparkline data={otif.trend} />
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{otif.onTimeOrders} / {otif.totalOrders} orders
							on-time (7d)
						</p>
						<div className="mt-2">
							<ProgressBar
								value={otif.rate}
								color={
									otif.rate >= 95
										? "bg-green-500"
										: otif.rate >= 88
											? "bg-amber-500"
											: "bg-red-500"
								}
							/>
						</div>
					</CardContent>
				</Card>
				<KpiCard
					title="FIFO Recovery Compliance"
					value={`${fifoCompliance.rate}%`}
					sub={`${fifoCompliance.compliant} / ${fifoCompliance.total} lots (30d)`}
					icon={Layers}
					color={
						fifoCompliance.rate >= 90
							? "text-green-600"
							: "text-red-600"
					}
				/>
				<KpiCard
					title="High-Value Reverse Aging"
					value={`${highValueReverseAging.avgDays}d avg`}
					sub={`${formatINR(highValueReverseAging.totalValue)} pending`}
					icon={AlertCircle}
					color="text-red-600"
				/>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm flex items-center gap-2">
						<Zap className="w-4 h-4 text-amber-500" />
						Bottleneck Zones — Avg Task Completion Time
					</CardTitle>
				</CardHeader>
				<CardContent>
					{bottleneckZones.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No completed task data available
						</p>
					) : (
						<div className="space-y-3">
							{bottleneckZones.map((zone) => {
								const pct =
									(zone.avgDelayMinutes / maxDelay) * 100;
								return (
									<div key={zone.name}>
										<div className="flex items-center justify-between text-sm mb-1">
											<span className="font-medium">
												{zone.name}
											</span>
											<span
												className={
													pct > 66
														? "text-red-600 font-semibold"
														: "text-muted-foreground"
												}
											>
												{formatMinutes(
													Math.round(
														zone.avgDelayMinutes,
													),
												)}{" "}
												avg
											</span>
										</div>
										<ProgressBar
											value={pct}
											color={
												pct > 66
													? "bg-red-500"
													: pct > 33
														? "bg-amber-400"
														: "bg-green-500"
											}
										/>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
			{otif.trend.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							7-Day OTIF Trend
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="text-left py-1.5 px-2 font-medium text-muted-foreground">
											Date
										</th>
										<th className="text-right py-1.5 px-2 font-medium text-muted-foreground">
											OTIF %
										</th>
									</tr>
								</thead>
								<tbody>
									{otif.trend.map((row) => (
										<tr
											key={row.date}
											className="border-b last:border-0 hover:bg-muted/30"
										>
											<td className="py-1.5 px-2">
												{row.date}
											</td>
											<td
												className={`py-1.5 px-2 text-right font-medium ${row.rate >= 95 ? "text-green-600" : row.rate >= 85 ? "text-amber-600" : "text-red-600"}`}
											>
												{row.rate.toFixed(1)}%
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// ─── Persona 3: Inventory & Quality Lead ─────────────────────────────────────

function InventoryQualityPanel({ data }: { data: AnalyticsData["persona3"] }) {
	const {
		inventoryAccuracy,
		deadStock,
		componentFailureCost,
		repeatFailureRate,
		amcCompliance,
		repairVsReplace,
	} = data;
	const maxCost = Math.max(...componentFailureCost.map((c) => c.cost), 1);
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<KpiCard
					title="Inventory Accuracy"
					value={`${inventoryAccuracy.rate}%`}
					sub={`${inventoryAccuracy.totalVariance} units variance (90d cycle counts)`}
					icon={ShieldCheck}
					color={
						inventoryAccuracy.rate >= 98
							? "text-green-600"
							: "text-amber-600"
					}
				/>
				<KpiCard
					title="Dead Stock Value"
					value={formatINR(deadStock.totalValue)}
					sub={`Across ${deadStock.skuCount} SKUs (90+ days no movement)`}
					icon={Package}
					color="text-red-600"
				/>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Repair vs Replace
						</CardTitle>
						<Wrench className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{repairVsReplace.repairRate.toFixed(0)}%
							<span className="text-sm font-normal text-muted-foreground ml-1">
								repaired
							</span>
						</div>
						<div className="mt-2 space-y-1.5">
							{[
								{
									label: "Repaired",
									val: repairVsReplace.repaired,
									c: "bg-green-500",
								},
								{
									label: "Replaced",
									val: repairVsReplace.replaced,
									c: "bg-red-500",
								},
								{
									label: "Restocked",
									val: repairVsReplace.restocked,
									c: "bg-blue-500",
								},
							].map((b) => (
								<div
									key={b.label}
									className="flex items-center justify-between text-xs"
								>
									<span className="flex items-center gap-1">
										<span
											className={`w-2 h-2 rounded-full ${b.c} inline-block`}
										/>
										{b.label}
									</span>
									<span>{b.val}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm flex items-center gap-2">
						<BarChart3 className="w-4 h-4 text-red-500" />
						Component Failure Cost Index — Pareto (30d)
					</CardTitle>
				</CardHeader>
				<CardContent>
					{componentFailureCost.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No return data this period
						</p>
					) : (
						<div className="space-y-3">
							{componentFailureCost.map((item) => (
								<div key={item.name}>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="font-medium truncate max-w-[180px]">
											{item.name}
										</span>
										<span className="font-semibold text-red-700 ml-4 whitespace-nowrap">
											{formatINR(item.cost)}
											<span className="text-xs font-normal text-muted-foreground ml-1">
												({item.returnCount} returns)
											</span>
										</span>
									</div>
									<ProgressBar
										value={item.cost}
										max={maxCost}
										color="bg-red-400"
									/>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							Repeat Failure Rate by Component (90d)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{repeatFailureRate.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-4">
								No repeat failures detected
							</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b">
											<th className="text-left py-1.5 font-medium text-muted-foreground">
												Component
											</th>
											<th className="text-right py-1.5 font-medium text-muted-foreground">
												Returns
											</th>
											<th className="text-right py-1.5 font-medium text-muted-foreground">
												Repeat %
											</th>
										</tr>
									</thead>
									<tbody>
										{repeatFailureRate.map((r) => (
											<tr
												key={r.name}
												className="border-b last:border-0"
											>
												<td className="py-1.5 truncate max-w-[120px]">
													{r.name}
												</td>
												<td className="py-1.5 text-right text-muted-foreground">
													{r.totalReturns}
												</td>
												<td
													className={`py-1.5 text-right font-semibold ${r.rate > 20 ? "text-red-600" : r.rate > 10 ? "text-amber-600" : "text-green-600"}`}
												>
													{r.rate}%
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm flex items-center gap-2">
							<Users className="w-4 h-4" />
							AMC Partner Return Compliance (90d)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{amcCompliance.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-4">
								No AMC partner data
							</p>
						) : (
							<div className="space-y-3">
								{amcCompliance.map((p) => (
									<div key={p.name}>
										<div className="flex items-center justify-between text-sm mb-1">
											<span className="font-medium truncate max-w-[120px]">
												{p.name}
											</span>
											<span
												className={`font-semibold ${p.rate >= 90 ? "text-green-600" : p.rate >= 70 ? "text-amber-600" : "text-red-600"}`}
											>
												{p.rate.toFixed(0)}%
												{p.rate < 70 && (
													<span className="ml-1 text-xs text-red-500">
														Escalate
													</span>
												)}
											</span>
										</div>
										<ProgressBar
											value={p.rate}
											color={
												p.rate >= 90
													? "bg-green-500"
													: p.rate >= 70
														? "bg-amber-400"
														: "bg-red-500"
											}
										/>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// ─── Persona 4: Regional Supply Chain Manager ─────────────────────────────────

function RegionalSupplyPanel({ data }: { data: AnalyticsData["persona4"] }) {
	const {
		regionalBalance,
		transferNeedUnits,
		warehouseBreakdown,
		reverseValueGap,
		recoveryBacklog,
		amcNonReturnExposure,
		highValueConcentration,
	} = data;
	const totalNonReturnExposure = amcNonReturnExposure.reduce(
		(s, r) => s + r.cost,
		0,
	);
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<KpiCard
					title="Transfer Need"
					value={`${transferNeedUnits.toLocaleString()} units`}
					sub="Required to rebalance network"
					icon={Truck}
					color="text-blue-600"
				/>
				<KpiCard
					title="Recovery Backlog"
					value={`${recoveryBacklog.total} units`}
					sub="Repairable items awaiting transfer"
					icon={RefreshCw}
					color="text-amber-600"
				/>
				<KpiCard
					title="AMC Non-Return Exposure"
					value={formatINR(totalNonReturnExposure)}
					sub="Unreturned component value"
					icon={AlertTriangle}
					color="text-red-600"
				/>
				<KpiCard
					title="High-Value Concentration"
					value={`${highValueConcentration.reduce((s, c) => s + c.pct, 0).toFixed(0)}%`}
					sub="Of inventory in top components"
					icon={Layers}
					color="text-purple-600"
				/>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm flex items-center gap-2">
							<Warehouse className="w-4 h-4" />
							Warehouse Stock Balance Scores
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{regionalBalance.map((w) => (
								<div key={w.warehouseId}>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="font-medium">
											{w.name}
										</span>
										<span
											className={`font-semibold ${w.score >= 80 ? "text-green-600" : w.score >= 60 ? "text-amber-600" : "text-red-600"}`}
										>
											{w.score}
										</span>
									</div>
									<ProgressBar
										value={w.score}
										color={
											w.score >= 80
												? "bg-green-500"
												: w.score >= 60
													? "bg-amber-400"
													: "bg-red-500"
										}
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							Warehouse Inventory Breakdown
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="text-left py-1.5 font-medium text-muted-foreground">
											Warehouse
										</th>
										<th className="text-right py-1.5 font-medium text-muted-foreground">
											Qty
										</th>
										<th className="text-right py-1.5 font-medium text-muted-foreground">
											Value
										</th>
									</tr>
								</thead>
								<tbody>
									{warehouseBreakdown.map((w) => (
										<tr
											key={w.id}
											className="border-b last:border-0"
										>
											<td className="py-1.5 truncate max-w-[140px]">
												{w.name}
											</td>
											<td className="py-1.5 text-right text-muted-foreground">
												{w.qty.toLocaleString()}
											</td>
											<td className="py-1.5 text-right font-medium">
												{formatINR(w.value)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm flex items-center gap-2">
						<TrendingDown className="w-4 h-4 text-red-500" />
						Regional Reverse Value Gap
					</CardTitle>
				</CardHeader>
				<CardContent>
					{reverseValueGap.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No reverse logistics data
						</p>
					) : (
						<div className="space-y-3">
							{reverseValueGap.map((r) => (
								<div key={r.warehouseId}>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="font-medium">
											{r.name}
										</span>
										<span className="text-xs text-muted-foreground">
											{formatINR(r.pendingValue)} pending
											/ {formatINR(r.recoveredValue)}{" "}
											recovered
										</span>
									</div>
									<div className="flex h-2 rounded-full overflow-hidden">
										<div
											className="bg-red-400"
											style={{
												width: `${(r.pendingValue / Math.max(r.pendingValue + r.recoveredValue, 1)) * 100}%`,
											}}
										/>
										<div
											className="bg-green-400"
											style={{
												width: `${(r.recoveredValue / Math.max(r.pendingValue + r.recoveredValue, 1)) * 100}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							Recovery Transfer Backlog
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold mb-3">
							{recoveryBacklog.total}
							<span className="text-sm font-normal text-muted-foreground ml-2">
								repairable units
							</span>
						</div>
						<div className="space-y-2">
							{recoveryBacklog.byComponent
								.slice(0, 5)
								.map((c) => (
									<div
										key={c.name}
										className="flex items-center justify-between text-sm"
									>
										<span className="text-muted-foreground truncate max-w-[180px]">
											{c.name}
										</span>
										<span className="font-medium">
											{c.count}
										</span>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">
							High-Value Part Concentration Risk
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{highValueConcentration.map((c) => (
								<div key={c.name}>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="truncate max-w-40">
											{c.name}
										</span>
										<span className="font-medium text-purple-700 ml-2">
											{formatINR(c.cost)}
										</span>
									</div>
									<ProgressBar
										value={c.pct}
										color="bg-purple-400"
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// ─── Persona 5: Executive ─────────────────────────────────────────────────────

function ExecutivePanel({ data }: { data: AnalyticsData["persona5"] }) {
	const {
		inventoryCapitalAtRisk,
		otifForecast,
		reverseLeakage,
		recoveryYield,
		componentCostDrain,
		recoveryOpportunity,
	} = data;
	const maxDrain = Math.max(...componentCostDrain.map((c) => c.cost), 1);
	const otifTrend = otifForecast.projectedRate - otifForecast.currentRate;
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<Card className="border-red-200 bg-red-50/30">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Inventory Capital at Risk
						</CardTitle>
						<AlertCircle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-red-700">
							{formatINR(inventoryCapitalAtRisk.total)}
						</div>
						<div className="mt-3 space-y-1.5">
							{[
								{
									label: "Dead Stock",
									val: inventoryCapitalAtRisk.deadStock,
									c: "bg-red-400",
								},
								{
									label: "Slow-Moving",
									val: inventoryCapitalAtRisk.slowMoving,
									c: "bg-amber-400",
								},
								{
									label: "Excess Stock",
									val: inventoryCapitalAtRisk.excessStock,
									c: "bg-orange-400",
								},
							].map((b) => (
								<div
									key={b.label}
									className="flex items-center justify-between text-xs"
								>
									<span className="flex items-center gap-1.5 text-muted-foreground">
										<span
											className={`w-2 h-2 rounded-full ${b.c} inline-block`}
										/>
										{b.label}
									</span>
									<span className="font-medium">
										{formatINR(b.val)}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							OTIF Forecast
						</CardTitle>
						{otifTrend >= 0 ? (
							<TrendingUp className="h-4 w-4 text-green-600" />
						) : (
							<TrendingDown className="h-4 w-4 text-red-600" />
						)}
					</CardHeader>
					<CardContent>
						<div
							className={`text-2xl font-bold ${otifForecast.projectedRate >= 95 ? "text-green-600" : otifForecast.projectedRate >= 88 ? "text-amber-600" : "text-red-600"}`}
						>
							{otifForecast.projectedRate.toFixed(1)}%
							<span className="text-sm font-normal text-muted-foreground ml-1">
								projected
							</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Current: {otifForecast.currentRate}%
						</p>
						<div className="mt-2">
							<TrendArrow value={otifTrend} />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Recovery Yield
						</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{recoveryYield.rate}%
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{formatINR(recoveryYield.recoveredValue)} recovered
							of {formatINR(recoveryYield.totalReturnValue)} (YTD)
						</p>
						<div className="mt-2">
							<ProgressBar
								value={recoveryYield.rate}
								color={
									recoveryYield.rate >= 80
										? "bg-green-500"
										: recoveryYield.rate >= 60
											? "bg-amber-400"
											: "bg-red-500"
								}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card className="border-red-200">
					<CardHeader>
						<CardTitle className="text-sm flex items-center gap-2">
							<TrendingDown className="w-4 h-4 text-red-500" />
							Reverse Logistics Leakage — YTD
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-red-700 mb-4">
							{formatINR(reverseLeakage.total)}
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Total Return Value
								</span>
								<span className="font-medium">
									{formatINR(
										reverseLeakage.pendingReturnValue,
									)}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Recovered
								</span>
								<span className="font-medium text-green-600">
									{formatINR(reverseLeakage.recoveredValue)}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm border-t pt-2">
								<span className="font-medium text-red-600">
									Unrecovered (Leakage)
								</span>
								<span className="font-bold text-red-700">
									{formatINR(reverseLeakage.total)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="border-green-200">
					<CardHeader>
						<CardTitle className="text-sm flex items-center gap-2">
							<DollarSign className="w-4 h-4 text-green-500" />
							Recovery Opportunity Value
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold text-green-700 mb-4">
							{formatINR(recoveryOpportunity.total)}
						</div>
						<p className="text-sm text-muted-foreground">
							Immediately recoverable through repair and AMC
							return programs
						</p>
						<div className="mt-3 p-2 bg-green-50 rounded-lg text-sm text-green-800">
							<span className="font-medium">
								{recoveryOpportunity.repairableItems}
							</span>{" "}
							repairable units awaiting repair hub movement
						</div>
					</CardContent>
				</Card>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm flex items-center gap-2">
						<Cpu className="w-4 h-4 text-red-500" />
						Component Cost Drain (YTD Replacements)
					</CardTitle>
				</CardHeader>
				<CardContent>
					{componentCostDrain.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No shipment data this year
						</p>
					) : (
						<div className="space-y-3">
							{componentCostDrain.map((item, idx) => (
								<div key={item.name}>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="flex items-center gap-2">
											<span className="text-xs font-bold text-muted-foreground w-4">
												#{idx + 1}
											</span>
											<span className="font-medium truncate max-w-[180px]">
												{item.name}
											</span>
										</span>
										<span className="font-bold text-red-700 ml-4 whitespace-nowrap">
											{formatINR(item.cost)}
											<span className="text-xs font-normal text-muted-foreground ml-1">
												({item.qty.toLocaleString()}{" "}
												replaced)
											</span>
										</span>
									</div>
									<ProgressBar
										value={item.cost}
										max={maxDrain}
										color="bg-red-500"
									/>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<SkeletonCard key={i} />
				))}
			</div>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PERSONAS = [
	{
		id: "associate",
		label: "Warehouse Associate",
		short: "Associate",
		icon: Timer,
	},
	{
		id: "lead",
		label: "Control Lead",
		short: "Control Lead",
		icon: BarChart3,
	},
	{
		id: "quality",
		label: "Inventory & Quality",
		short: "Inv & Quality",
		icon: ShieldCheck,
	},
	{
		id: "regional",
		label: "Regional Supply Chain",
		short: "Regional",
		icon: Warehouse,
	},
	{
		id: "executive",
		label: "Executive",
		short: "Executive",
		icon: TrendingUp,
	},
] as const;

export default function HomeClient({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data, isPending, error } = useQuery({
		...orpc.analytics.dashboard.queryOptions({ input: { organizationId } }),
		enabled: Boolean(organizationId),
		staleTime: 60_000,
	});

	return (
		<div className="space-y-6">
			{error && (
				<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
					<AlertCircle className="w-4 h-4 shrink-0" />
					Failed to load analytics data. Check API connection.
				</div>
			)}

			{!organizationId && (
				<div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
					<AlertTriangle className="w-4 h-4 shrink-0" />
					No active organization selected. Please select or create an
					organization.
				</div>
			)}

			<Tabs defaultValue="regional" className="flex flex-col">
				<TabsList className="flex flex-wrap h-auto gap-1 p-1 mb-2">
					{PERSONAS.map((p) => {
						const Icon = p.icon;
						return (
							<TabsTrigger
								key={p.id}
								value={p.id}
								className="flex items-center gap-1.5 text-xs sm:text-sm"
							>
								<Icon className="w-3.5 h-3.5" />
								<span className="hidden sm:inline">
									{p.label}
								</span>
								<span className="sm:hidden">{p.short}</span>
							</TabsTrigger>
						);
					})}
				</TabsList>

				{isPending ? (
					<DashboardSkeleton />
				) : data ? (
					<>
						<TabsContent value="associate">
							<WarehouseAssociatePanel data={data.persona1} />
						</TabsContent>
						<TabsContent value="lead">
							<WarehouseControlLeadPanel data={data.persona2} />
						</TabsContent>
						<TabsContent value="quality">
							<InventoryQualityPanel data={data.persona3} />
						</TabsContent>
						<TabsContent value="regional">
							<RegionalSupplyPanel data={data.persona4} />
						</TabsContent>
						<TabsContent value="executive">
							<ExecutivePanel data={data.persona5} />
						</TabsContent>
					</>
				) : null}
			</Tabs>
		</div>
	);
}
