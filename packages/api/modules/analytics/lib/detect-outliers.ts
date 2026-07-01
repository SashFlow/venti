export type OutlierSeverity = "critical" | "warning" | "info";

export type DetectedOutlier = {
	id: string;
	metric: string;
	value: string;
	expectedRange: string;
	severity: OutlierSeverity;
	category: "operations" | "inventory" | "financial" | "quality";
	searchQuery: string;
	context: Record<string, string | number>;
};

type DashboardShape = {
	persona1: {
		openTaskAging: { avgMinutes: number; openCount: number };
		firstPassAccuracy: { rate: number };
		reverseProcessingAging: { avgDays: number; bucket7plus: number };
	};
	persona2: {
		otif: {
			rate: number;
			trend: { date: string; rate: number }[];
		};
		bottleneckZones: { name: string; avgDelayMinutes: number }[];
		fifoCompliance: { rate: number };
		highValueReverseAging: { avgDays: number; totalValue: number };
	};
	persona3: {
		inventoryAccuracy: { rate: number };
		deadStock: { totalValue: number; skuCount: number };
		repeatFailureRate: {
			name: string;
			rate: number;
			repeatReturns: number;
		}[];
		componentFailureCost: {
			name: string;
			cost: number;
			returnCount: number;
		}[];
	};
	persona4: {
		regionalBalance: { name: string; score: number }[];
		reverseValueGap: { name: string; gap: number; pendingValue: number }[];
	};
	persona5: {
		inventoryCapitalAtRisk: { total: number; deadStock: number };
		otifForecast: { currentRate: number; projectedRate: number };
		reverseLeakage: { total: number };
		recoveryYield: { rate: number };
	};
};

export function detectOutliers(data: DashboardShape): DetectedOutlier[] {
	const outliers: DetectedOutlier[] = [];

	const otifTrend =
		data.persona2.otif.trend.length >= 2
			? data.persona2.otif.trend.at(-1)!.rate -
				data.persona2.otif.trend.at(-2)!.rate
			: 0;

	if (data.persona2.otif.rate < 88) {
		outliers.push({
			id: "otif-low",
			metric: "OTIF Rate",
			value: `${data.persona2.otif.rate}%`,
			expectedRange: "≥ 95%",
			severity: data.persona2.otif.rate < 80 ? "critical" : "warning",
			category: "operations",
			searchQuery: `warehouse on-time in-full OTIF ${data.persona2.otif.rate}% below target causes supply chain`,
			context: {
				currentRate: data.persona2.otif.rate,
				trendDelta: Number(otifTrend.toFixed(1)),
			},
		});
	}

	if (otifTrend < -5) {
		outliers.push({
			id: "otif-trend-drop",
			metric: "OTIF Trend",
			value: `${otifTrend.toFixed(1)}% day-over-day`,
			expectedRange: "Stable or improving",
			severity: "warning",
			category: "operations",
			searchQuery:
				"supply chain OTIF sudden decline causes warehouse shipping delays",
			context: { trendDelta: Number(otifTrend.toFixed(1)) },
		});
	}

	const zones = data.persona2.bottleneckZones;
	if (zones.length > 0) {
		const delays = zones.map((z) => z.avgDelayMinutes);
		const median =
			delays.sort((a, b) => a - b)[Math.floor(delays.length / 2)] ?? 0;
		const top = zones[0]!;
		if (top.avgDelayMinutes > Math.max(30, median * 2)) {
			outliers.push({
				id: `bottleneck-${top.name}`,
				metric: "Bottleneck Zone",
				value: `${top.name} — ${top.avgDelayMinutes} min avg`,
				expectedRange: `< ${Math.round(median)} min (median)`,
				severity: top.avgDelayMinutes > 60 ? "critical" : "warning",
				category: "operations",
				searchQuery: `warehouse ${top.name} staging bottleneck outbound delays causes`,
				context: {
					zone: top.name,
					avgDelayMinutes: top.avgDelayMinutes,
					medianDelayMinutes: median,
				},
			});
		}
	}

	if (data.persona1.reverseProcessingAging.avgDays > 5) {
		outliers.push({
			id: "reverse-aging",
			metric: "Reverse Processing Aging",
			value: `${data.persona1.reverseProcessingAging.avgDays} days avg`,
			expectedRange: "≤ 3 days",
			severity:
				data.persona1.reverseProcessingAging.avgDays > 10
					? "critical"
					: "warning",
			category: "operations",
			searchQuery:
				"reverse logistics returns processing delay warehouse best practices",
			context: {
				avgDays: data.persona1.reverseProcessingAging.avgDays,
				over7Days: data.persona1.reverseProcessingAging.bucket7plus,
			},
		});
	}

	if (data.persona3.inventoryAccuracy.rate < 97) {
		outliers.push({
			id: "inventory-accuracy",
			metric: "Inventory Accuracy",
			value: `${data.persona3.inventoryAccuracy.rate}%`,
			expectedRange: "≥ 99%",
			severity:
				data.persona3.inventoryAccuracy.rate < 93 ? "critical" : "warning",
			category: "quality",
			searchQuery: `warehouse inventory accuracy ${data.persona3.inventoryAccuracy.rate}% cycle count variance causes`,
			context: { rate: data.persona3.inventoryAccuracy.rate },
		});
	}

	if (data.persona3.deadStock.skuCount > 0 && data.persona3.deadStock.totalValue > 10000) {
		outliers.push({
			id: "dead-stock",
			metric: "Dead Stock Value",
			value: `$${data.persona3.deadStock.totalValue.toLocaleString()} (${data.persona3.deadStock.skuCount} SKUs)`,
			expectedRange: "Minimal idle inventory",
			severity:
				data.persona3.deadStock.totalValue > 50000 ? "critical" : "warning",
			category: "inventory",
			searchQuery:
				"dead stock inventory 90 days no movement warehouse capital tie-up mitigation",
			context: {
				totalValue: data.persona3.deadStock.totalValue,
				skuCount: data.persona3.deadStock.skuCount,
			},
		});
	}

	const highRepeat = data.persona3.repeatFailureRate.find((r) => r.rate > 25);
	if (highRepeat) {
		outliers.push({
			id: `repeat-failure-${highRepeat.name}`,
			metric: "Repeat Failure Rate",
			value: `${highRepeat.name} — ${highRepeat.rate}%`,
			expectedRange: "< 10%",
			severity: highRepeat.rate > 40 ? "critical" : "warning",
			category: "quality",
			searchQuery: `${highRepeat.name} product repeat returns failure rate quality root cause`,
			context: {
				product: highRepeat.name,
				rate: highRepeat.rate,
				repeatReturns: highRepeat.repeatReturns,
			},
		});
	}

	const imbalanced = data.persona4.regionalBalance.find((w) => w.score < 45);
	if (imbalanced) {
		outliers.push({
			id: `warehouse-imbalance-${imbalanced.name}`,
			metric: "Regional Stock Imbalance",
			value: `${imbalanced.name} — score ${imbalanced.score}/100`,
			expectedRange: "≥ 60 balanced",
			severity: imbalanced.score < 30 ? "critical" : "warning",
			category: "inventory",
			searchQuery: `warehouse inventory imbalance ${imbalanced.name} stock transfer optimization`,
			context: { warehouse: imbalanced.name, score: imbalanced.score },
		});
	}

	const leakageGap = data.persona4.reverseValueGap.find(
		(w) => w.gap > 5000 && w.pendingValue > 0,
	);
	if (leakageGap) {
		outliers.push({
			id: `reverse-gap-${leakageGap.name}`,
			metric: "Reverse Value Gap",
			value: `${leakageGap.name} — $${leakageGap.gap.toLocaleString()} unrecovered`,
			expectedRange: "Minimal pending vs recovered gap",
			severity: leakageGap.gap > 25000 ? "critical" : "warning",
			category: "financial",
			searchQuery:
				"reverse logistics value recovery gap returns restocking yield improvement",
			context: {
				warehouse: leakageGap.name,
				gap: leakageGap.gap,
				pendingValue: leakageGap.pendingValue,
			},
		});
	}

	if (data.persona5.recoveryYield.rate < 70 && data.persona5.recoveryYield.rate > 0) {
		outliers.push({
			id: "recovery-yield",
			metric: "Recovery Yield",
			value: `${data.persona5.recoveryYield.rate}%`,
			expectedRange: "≥ 80%",
			severity: data.persona5.recoveryYield.rate < 50 ? "critical" : "warning",
			category: "financial",
			searchQuery:
				"reverse logistics recovery yield low returns restock refurbish optimization",
			context: { rate: data.persona5.recoveryYield.rate },
		});
	}

	const topFailure = data.persona3.componentFailureCost[0];
	const avgFailureCost =
		data.persona3.componentFailureCost.reduce((s, c) => s + c.cost, 0) /
		Math.max(1, data.persona3.componentFailureCost.length);
	if (topFailure && topFailure.cost > avgFailureCost * 3 && topFailure.cost > 5000) {
		outliers.push({
			id: `component-failure-${topFailure.name}`,
			metric: "Component Failure Cost",
			value: `${topFailure.name} — $${topFailure.cost.toLocaleString()}`,
			expectedRange: `Near avg $${Math.round(avgFailureCost).toLocaleString()}`,
			severity: "warning",
			category: "quality",
			searchQuery: `${topFailure.name} component failure returns cost supply chain quality`,
			context: {
				product: topFailure.name,
				cost: topFailure.cost,
				returnCount: topFailure.returnCount,
			},
		});
	}

	return outliers.sort((a, b) => {
		const rank = { critical: 0, warning: 1, info: 2 };
		return rank[a.severity] - rank[b.severity];
	});
}
