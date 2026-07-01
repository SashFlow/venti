"use client";

import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	OrgCurrencyProvider,
	useOrgCurrency,
} from "@saas/organizations/hooks/use-org-currency";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowDownLeft,
	ArrowUpRight,
	Flame,
	Package,
	Scale,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ReferenceArea,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const INBOUND_COLOR = "#16a34a";
const OUTBOUND_COLOR = "#2563eb";

function formatMonthLabel(isoDate: string, forecast = false) {
	const d = new Date(isoDate);
	const label = d.toLocaleDateString(undefined, {
		month: "short",
		year: "2-digit",
	});
	return forecast ? `${label} (fc)` : label;
}

function formatUnits(n: number) {
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
		n,
	);
}

type ChartRow = {
	label: string;
	inbound: number | null;
	outbound: number | null;
	forecastInbound: number | null;
	forecastOutbound: number | null;
	forecastInboundHigh: number | null;
	forecastOutboundHigh: number | null;
	flowBalancePct: number | null;
	isForecast?: boolean;
};

function buildChartRows(
	timeline: Array<{
		month: string;
		inboundUnits: number;
		outboundUnits: number;
		inboundValue: number;
		outboundValue: number;
	}>,
	forecast: Array<{
		month: string;
		inboundUnits: number;
		outboundUnits: number;
		inboundValue: number;
		outboundValue: number;
		inboundHigh: number;
		outboundHigh: number;
		flowBalancePct: number;
	}>,
	metric: "units" | "value",
): ChartRow[] {
	const pickInbound = (row: {
		inboundUnits: number;
		inboundValue: number;
	}) => (metric === "units" ? row.inboundUnits : row.inboundValue);
	const pickOutbound = (row: {
		outboundUnits: number;
		outboundValue: number;
	}) => (metric === "units" ? row.outboundUnits : row.outboundValue);

	const rows: ChartRow[] = timeline.map((row, index) => {
		const isLast = index === timeline.length - 1;
		const inbound = pickInbound(row);
		const outbound = pickOutbound(row);
		const balance =
			inbound > 0 ? Math.round((outbound / inbound) * 1000) / 10 : null;
		return {
			label: formatMonthLabel(row.month),
			inbound,
			outbound,
			forecastInbound: isLast ? inbound : null,
			forecastOutbound: isLast ? outbound : null,
			forecastInboundHigh: null,
			forecastOutboundHigh: null,
			flowBalancePct: balance,
		};
	});

	const lastMonth = timeline.at(-1)?.month;
	if (lastMonth && forecast.length > 0) {
		for (const fc of forecast) {
			const inbound = pickInbound(fc);
			const outbound = pickOutbound(fc);
			const inboundHigh =
				metric === "units"
					? fc.inboundHigh
					: fc.inboundUnits > 0
						? (fc.inboundHigh / fc.inboundUnits) * fc.inboundValue
						: fc.inboundHigh;
			const outboundHigh =
				metric === "units"
					? fc.outboundHigh
					: fc.outboundUnits > 0
						? (fc.outboundHigh / fc.outboundUnits) * fc.outboundValue
						: fc.outboundHigh;

			rows.push({
				label: formatMonthLabel(fc.month, true),
				inbound: null,
				outbound: null,
				forecastInbound: inbound,
				forecastOutbound: outbound,
				forecastInboundHigh: inboundHigh,
				forecastOutboundHigh: outboundHigh,
				flowBalancePct: fc.flowBalancePct,
				isForecast: true,
			});
		}
	}

	return rows;
}

function FlowTooltip({
	active,
	payload,
	label,
	formatMetric,
}: {
	active?: boolean;
	payload?: Array<{
		name?: string;
		value?: number;
		color?: string;
		payload?: ChartRow;
	}>;
	label?: string;
	formatMetric: (n: number) => string;
}) {
	if (!active || !payload?.length) {
		return null;
	}
	const balance = payload[0]?.payload?.flowBalancePct ?? null;
	return (
		<div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
			<p className="mb-1.5 font-medium">{label}</p>
			<div className="grid gap-1">
				{payload
					.filter((item) => item.value != null && item.value > 0)
					.map((item) => (
						<div
							key={item.name}
							className="flex items-center justify-between gap-4"
						>
							<span className="flex items-center gap-1.5 text-muted-foreground">
								<span
									className="size-2 rounded-full"
									style={{ backgroundColor: item.color }}
								/>
								{item.name}
							</span>
							<span className="font-medium tabular-nums">
								{formatMetric(Number(item.value))}
							</span>
						</div>
					))}
				{balance != null && (
					<p className="mt-1 border-t border-border/50 pt-1 text-muted-foreground">
						Flow balance: {balance}% outbound / inbound
					</p>
				)}
			</div>
		</div>
	);
}

function InboundOutboundTimelineContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const [metric, setMetric] = useState<"units" | "value">("units");
	const { formatCurrency } = useOrgCurrency();

	const { data, isLoading } = useQuery({
		...orpc.analytics.flowTimeline.queryOptions({
			input: { organizationId, months: 12 },
		}),
		enabled: Boolean(organizationId),
		staleTime: 60_000,
	});

	const chartData = useMemo(() => {
		if (!data?.timeline) {
			return [];
		}
		return buildChartRows(
			data.timeline,
			data.forecast ?? [],
			metric,
		);
	}, [data?.timeline, data?.forecast, metric]);

	const forecastStartLabel = useMemo(() => {
		const first = chartData.find((r) => r.isForecast);
		return first?.label ?? null;
	}, [chartData]);

	const forecastTotals = useMemo(() => {
		if (!data?.forecast) {
			return { inbound: 0, outbound: 0 };
		}
		return data.forecast.reduce(
			(acc, row) => ({
				inbound:
					acc.inbound +
					(metric === "units" ? row.inboundUnits : row.inboundValue),
				outbound:
					acc.outbound +
					(metric === "units" ? row.outboundUnits : row.outboundValue),
			}),
			{ inbound: 0, outbound: 0 },
		);
	}, [data?.forecast, metric]);

	const totals = useMemo(() => {
		if (!data?.timeline) {
			return { inbound: 0, outbound: 0, net: 0, balancePct: 0 };
		}
		const inbound = data.timeline.reduce(
			(sum, row) =>
				sum + (metric === "units" ? row.inboundUnits : row.inboundValue),
			0,
		);
		const outbound = data.timeline.reduce(
			(sum, row) =>
				sum + (metric === "units" ? row.outboundUnits : row.outboundValue),
			0,
		);
		return {
			inbound,
			outbound,
			net: inbound - outbound,
			balancePct:
				inbound > 0 ? Math.round((outbound / inbound) * 1000) / 10 : 0,
		};
	}, [data?.timeline, metric]);

	const formatMetric = (n: number) =>
		metric === "units" ? formatUnits(n) : formatCurrency(n);

	if (isLoading) {
		return (
			<Card className="animate-pulse">
				<CardContent className="h-80 p-6" />
			</Card>
		);
	}

	const hasData =
		data?.timeline?.some(
			(r) =>
				r.inboundUnits > 0 ||
				r.outboundUnits > 0 ||
				r.inboundValue > 0 ||
				r.outboundValue > 0,
		) ?? false;

	return (
		<Card>
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
						<Package className="size-4 shrink-0 text-muted-foreground" />
						Inbound vs Outbound Flow
					</CardTitle>
					<p className="text-xs text-muted-foreground sm:text-sm">
						HVAC parts movement — dual-scale view with seasonal
						cooling-season forecast
					</p>
					{data?.seasonOutlook && (
						<Badge
							variant="secondary"
							className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
						>
							<Flame className="size-3" />
							{data.seasonOutlook}
						</Badge>
					)}
				</div>
				<Tabs
					value={metric}
					onValueChange={(v) => setMetric(v as "units" | "value")}
				>
					<TabsList>
						<TabsTrigger value="units">Units</TabsTrigger>
						<TabsTrigger value="value">Value</TabsTrigger>
					</TabsList>
				</Tabs>
			</CardHeader>
			<CardContent className="space-y-4">
				{!hasData ? (
					<div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
						No inbound or outbound transactions in this period.
					</div>
				) : (
					<div className="h-[340px] w-full min-h-[340px]">
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart
								data={chartData}
								margin={{ top: 12, right: 56, left: 4, bottom: 0 }}
							>
								<defs>
									<linearGradient
										id="inboundForecastGrad"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor={INBOUND_COLOR}
											stopOpacity={0.4}
										/>
										<stop
											offset="100%"
											stopColor={INBOUND_COLOR}
											stopOpacity={0.02}
										/>
									</linearGradient>
									<linearGradient
										id="outboundForecastGrad"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor={OUTBOUND_COLOR}
											stopOpacity={0.45}
										/>
										<stop
											offset="100%"
											stopColor={OUTBOUND_COLOR}
											stopOpacity={0.02}
										/>
									</linearGradient>
								</defs>
								{forecastStartLabel && (
									<ReferenceArea
										x1={forecastStartLabel}
										x2={chartData.at(-1)?.label}
										fill="hsl(var(--primary))"
										fillOpacity={0.04}
										strokeOpacity={0}
									/>
								)}
								<CartesianGrid
									vertical={false}
									strokeDasharray="3 3"
									className="stroke-border/50"
								/>
								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									interval="preserveStartEnd"
									minTickGap={20}
									tick={{ fontSize: 10 }}
								/>
								<YAxis
									yAxisId="inbound"
									orientation="left"
									tickLine={false}
									axisLine={false}
									width={64}
									tick={{ fontSize: 10, fill: INBOUND_COLOR }}
									tickFormatter={(v) =>
										metric === "units"
											? formatUnits(v)
											: formatCurrency(v)
									}
								/>
								<YAxis
									yAxisId="outbound"
									orientation="right"
									tickLine={false}
									axisLine={false}
									width={64}
									tick={{ fontSize: 10, fill: OUTBOUND_COLOR }}
									tickFormatter={(v) =>
										metric === "units"
											? formatUnits(v)
											: formatCurrency(v)
									}
								/>
								<Tooltip
									content={
										<FlowTooltip formatMetric={formatMetric} />
									}
								/>
								<Legend
									verticalAlign="top"
									height={40}
									iconType="circle"
									wrapperStyle={{ fontSize: 11 }}
								/>
								<Bar
									yAxisId="inbound"
									dataKey="inbound"
									name="Inbound (receipts)"
									fill={INBOUND_COLOR}
									radius={[4, 4, 0, 0]}
									maxBarSize={22}
								/>
								<Bar
									yAxisId="outbound"
									dataKey="outbound"
									name="Outbound (shipments)"
									fill={OUTBOUND_COLOR}
									radius={[4, 4, 0, 0]}
									maxBarSize={22}
								/>
								<Area
									yAxisId="inbound"
									type="monotone"
									dataKey="forecastInboundHigh"
									stroke="none"
									fill="url(#inboundForecastGrad)"
									connectNulls
									legendType="none"
								/>
								<Area
									yAxisId="outbound"
									type="monotone"
									dataKey="forecastOutboundHigh"
									stroke="none"
									fill="url(#outboundForecastGrad)"
									connectNulls
									legendType="none"
								/>
								<Line
									yAxisId="inbound"
									type="monotone"
									dataKey="forecastInbound"
									name="Inbound forecast"
									stroke={INBOUND_COLOR}
									strokeWidth={3}
									strokeDasharray="8 4"
									dot={{ r: 4, fill: INBOUND_COLOR, strokeWidth: 2 }}
									connectNulls
								/>
								<Line
									yAxisId="outbound"
									type="monotone"
									dataKey="forecastOutbound"
									name="Outbound forecast"
									stroke={OUTBOUND_COLOR}
									strokeWidth={3}
									strokeDasharray="8 4"
									dot={{ r: 4, fill: OUTBOUND_COLOR, strokeWidth: 2 }}
									connectNulls
								/>
							</ComposedChart>
						</ResponsiveContainer>
					</div>
				)}

				{hasData && (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
						<div className="rounded-lg border bg-muted/30 p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<ArrowDownLeft className="size-3.5 text-green-600" />
								Total Inbound
							</div>
							<p className="mt-1 text-lg font-semibold text-green-700 dark:text-green-400">
								{formatMetric(totals.inbound)}
							</p>
						</div>
						<div className="rounded-lg border bg-muted/30 p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<ArrowUpRight className="size-3.5 text-blue-600" />
								Total Outbound
							</div>
							<p className="mt-1 text-lg font-semibold text-blue-700 dark:text-blue-400">
								{formatMetric(totals.outbound)}
							</p>
						</div>
						<div className="rounded-lg border bg-muted/30 p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Scale className="size-3.5" />
								Flow Balance
							</div>
							<p className="mt-1 text-lg font-semibold">
								{totals.balancePct}%
							</p>
							<p className="mt-0.5 text-[10px] text-muted-foreground">
								Outbound ÷ inbound (target ~85%)
							</p>
						</div>
						<div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3 lg:col-span-2">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<TrendingUp className="size-3.5 text-amber-600" />
								HVAC Forecast (4mo)
								{(data?.forecastOutboundGrowthPct ?? 0) > 0 && (
									<Badge
										variant="outline"
										className="ml-auto text-[10px] text-amber-700 dark:text-amber-300"
									>
										+{data?.forecastOutboundGrowthPct}% outbound
									</Badge>
								)}
							</div>
							<p className="mt-1 text-sm font-semibold">
								<span className="text-green-700 dark:text-green-400">
									{formatMetric(forecastTotals.inbound)}
								</span>
								<span className="mx-1 text-muted-foreground">in</span>
								<span className="text-muted-foreground">/</span>
								<span className="mx-1 text-blue-700 dark:text-blue-400">
									{formatMetric(forecastTotals.outbound)}
								</span>
								<span className="text-muted-foreground">out</span>
							</p>
							<p className="mt-0.5 text-[10px] text-muted-foreground">
								{data?.forecast?.[0]?.seasonLabel ?? "Seasonal"} →{" "}
								{data?.forecast?.at(-1)?.seasonLabel ?? "outlook"}
								{" · "}Pre-stocked for compressor & refrigerant demand
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function InboundOutboundTimeline({
	organizationId,
}: {
	organizationId: string;
}) {
	return (
		<OrgCurrencyProvider organizationId={organizationId}>
			<InboundOutboundTimelineContent organizationId={organizationId} />
		</OrgCurrencyProvider>
	);
}
