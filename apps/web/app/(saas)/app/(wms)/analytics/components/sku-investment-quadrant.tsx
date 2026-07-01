"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	OrgCurrencyProvider,
	useOrgCurrency,
} from "@saas/organizations/hooks/use-org-currency";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import {
	AlertTriangle,
	Sparkles,
	Target,
	TrendingDown,
} from "lucide-react";
import {
	CartesianGrid,
	Cell,
	ReferenceLine,
	ResponsiveContainer,
	Scatter,
	ScatterChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type Quadrant = "invest_more" | "star" | "over_invested" | "low_priority";

const QUADRANT_META: Record<
	Quadrant,
	{
		title: string;
		description: string;
		icon: typeof Target;
		color: string;
		highlight?: boolean;
	}
> = {
	invest_more: {
		title: "Invest More",
		description: "High traction, low cover — restock priority",
		icon: Target,
		color: "hsl(142 76% 36%)",
		highlight: true,
	},
	star: {
		title: "Star Performers",
		description: "Strong traction with adequate inventory",
		icon: Sparkles,
		color: "hsl(221 83% 53%)",
	},
	over_invested: {
		title: "Over-Invested",
		description: "Low traction, high tied-up capital",
		icon: AlertTriangle,
		color: "hsl(38 92% 50%)",
	},
	low_priority: {
		title: "Low Priority",
		description: "Low traction and low inventory value",
		icon: TrendingDown,
		color: "hsl(215 16% 47%)",
	},
};

const QUADRANT_ORDER: Quadrant[] = [
	"invest_more",
	"star",
	"over_invested",
	"low_priority",
];

type ScatterPoint = {
	skuId: string;
	skuCode: string;
	productName: string;
	quadrant: Quadrant;
	shipQty30d: number;
	velocityGrowthPct: number;
	inventoryValue: number;
	daysOfCover: number;
	x: number;
	y: number;
};

function ScatterTooltip({
	active,
	payload,
	formatCurrency,
}: {
	active?: boolean;
	payload?: Array<{ payload: ScatterPoint }>;
	formatCurrency: (n: number) => string;
}) {
	if (!active || !payload?.length) {
		return null;
	}
	const p = payload[0]?.payload;
	if (!p) {
		return null;
	}
	return (
		<div className="grid min-w-40 gap-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
			<span className="font-medium">
				{p.skuCode} — {p.productName}
			</span>
			<span>Shipped (30d): {p.shipQty30d} units</span>
			<span>Growth: {p.velocityGrowthPct}%</span>
			<span>
				Days of cover:{" "}
				{p.daysOfCover >= 999 ? "N/A" : p.daysOfCover}
			</span>
			<span>Inventory: {formatCurrency(p.inventoryValue)}</span>
		</div>
	);
}

function SkuInvestmentQuadrantContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const { formatCurrency } = useOrgCurrency();

	const { data, isLoading } = useQuery({
		...orpc.analytics.skuInvestment.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
		staleTime: 60_000,
	});

	if (isLoading) {
		return (
			<Card className="animate-pulse">
				<CardContent className="h-96 p-6" />
			</Card>
		);
	}

	if (!data || data.allPoints.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base sm:text-lg">
						SKU Investment vs Traction
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
						Not enough SKU activity to generate investment insights.
					</div>
				</CardContent>
			</Card>
		);
	}

	const scatterData = data.allPoints.map((p) => ({
		...p,
		x: p.investmentScore,
		y: p.tractionScore,
		label: p.skuCode,
	}));

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-base sm:text-lg">
						SKU Investment vs Traction
					</CardTitle>
					<p className="text-xs text-muted-foreground sm:text-sm">
						Capital allocation matrix — traction from ship velocity
						and growth; investment from on-hand inventory value
					</p>
				</CardHeader>
				<CardContent>
					<div className="h-[320px] w-full min-h-[320px]">
						<ResponsiveContainer width="100%" height="100%">
							<ScatterChart margin={{ left: 8, right: 16, top: 8, bottom: 24 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								type="number"
								dataKey="x"
								name="Investment"
								domain={[0, 1]}
								tickLine={false}
								axisLine={false}
								label={{
									value: "Investment (inventory value)",
									position: "insideBottom",
									offset: -4,
									className: "fill-muted-foreground text-xs",
								}}
							/>
							<YAxis
								type="number"
								dataKey="y"
								name="Traction"
								domain={[0, 1]}
								tickLine={false}
								axisLine={false}
								label={{
									value: "Traction (velocity + growth)",
									angle: -90,
									position: "insideLeft",
									className: "fill-muted-foreground text-xs",
								}}
							/>
							<ReferenceLine
								x={data.thresholds.investmentMedian}
								stroke="hsl(var(--border))"
								strokeDasharray="4 4"
							/>
							<ReferenceLine
								y={data.thresholds.tractionMedian}
								stroke="hsl(var(--border))"
								strokeDasharray="4 4"
							/>
							<Tooltip
								cursor={{ strokeDasharray: "3 3" }}
								content={
									<ScatterTooltip formatCurrency={formatCurrency} />
								}
							/>
							<Scatter data={scatterData} fill="hsl(221 83% 53%)">
								{scatterData.map((entry) => (
									<Cell
										key={entry.skuId}
										fill={
											QUADRANT_META[entry.quadrant as Quadrant]
												.color
										}
									/>
								))}
							</Scatter>
						</ScatterChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{QUADRANT_ORDER.map((quadrant) => {
					const meta = QUADRANT_META[quadrant];
					const items = data.quadrants[quadrant];
					const Icon = meta.icon;

					return (
						<Card
							key={quadrant}
							className={
								meta.highlight
									? "border-primary/50 ring-1 ring-primary/20"
									: undefined
							}
						>
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-sm font-medium">
									<Icon
										className="size-4 shrink-0"
										style={{ color: meta.color }}
									/>
									{meta.title}
									<span className="ml-auto text-xs font-normal text-muted-foreground">
										{items.length} SKUs
									</span>
								</CardTitle>
								<p className="text-xs text-muted-foreground">
									{meta.description}
								</p>
							</CardHeader>
							<CardContent>
								{items.length === 0 ? (
									<p className="text-xs text-muted-foreground">
										No SKUs in this quadrant
									</p>
								) : (
									<div className="overflow-x-auto">
										<table className="w-full text-xs">
											<thead>
												<tr className="border-b text-left text-muted-foreground">
													<th className="pb-2 pr-2 font-medium">
														SKU
													</th>
													<th className="pb-2 pr-2 font-medium">
														Ship 30d
													</th>
													<th className="pb-2 pr-2 font-medium">
														Cover
													</th>
													<th className="pb-2 font-medium text-right">
														Value
													</th>
												</tr>
											</thead>
											<tbody>
												{items.map((sku) => (
													<tr
														key={sku.skuId}
														className="border-b border-border/50 last:border-0"
													>
														<td className="py-1.5 pr-2 font-mono">
															{sku.skuCode}
														</td>
														<td className="py-1.5 pr-2">
															{sku.shipQty30d}
														</td>
														<td className="py-1.5 pr-2">
															{sku.daysOfCover >= 999
																? "—"
																: `${sku.daysOfCover}d`}
														</td>
														<td className="py-1.5 text-right">
															{formatCurrency(
																sku.inventoryValue,
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

export function SkuInvestmentQuadrant({
	organizationId,
}: {
	organizationId: string;
}) {
	return (
		<OrgCurrencyProvider organizationId={organizationId}>
			<SkuInvestmentQuadrantContent organizationId={organizationId} />
		</OrgCurrencyProvider>
	);
}
