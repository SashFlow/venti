import OpenAI from "openai";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import {
	detectOutliers,
	type DetectedOutlier,
} from "../lib/detect-outliers";
import { searchWeb } from "../lib/web-search";
import { fetchDashboardAnalytics } from "./get-dashboard-analytics";

const getOutlierInsightsInput = z.object({
	organizationId: z.string(),
});

type EnrichedOutlier = DetectedOutlier & {
	analysis: string;
	likelyCauses: string[];
	recommendedActions: string[];
	webSources: { title: string; snippet: string; url?: string }[];
	aiPowered: boolean;
};

function buildFallbackAnalysis(
	outlier: DetectedOutlier,
	snippets: { title: string; snippet: string }[],
): Pick<EnrichedOutlier, "analysis" | "likelyCauses" | "recommendedActions"> {
	const contextSummary = Object.entries(outlier.context)
		.map(([k, v]) => `${k}: ${v}`)
		.join(", ");

	const webContext =
		snippets.length > 0
			? snippets.map((s) => s.snippet).join(" ")
			: "No external references found.";

	const causesByCategory: Record<string, string[]> = {
		operations: [
			"Labor capacity mismatch in peak zones",
			"Wave release timing causing staging congestion",
			"Carrier pickup windows misaligned with pack completion",
		],
		inventory: [
			"Uneven demand across regions",
			"Slow transfer order execution",
			"Safety stock policies not rebalanced after demand shift",
		],
		quality: [
			"Supplier batch quality variation",
			"Inadequate inbound inspection sampling",
			"Product design or packaging defects in specific SKUs",
		],
		financial: [
			"Low restock rate on refurbishable returns",
			"Disposition decisions favoring scrap over repair",
			"Delayed reverse logistics processing",
		],
	};

	const actionsByCategory: Record<string, string[]> = {
		operations: [
			"Reallocate pick/pack labor to the bottleneck zone",
			"Release waves in smaller batches during peak hours",
			"Review carrier cutoff times vs actual ship completion",
		],
		inventory: [
			"Create inter-warehouse transfer orders for surplus SKUs",
			"Run dead-stock markdown or vendor return program",
			"Adjust min/max replenishment by warehouse",
		],
		quality: [
			"Quarantine affected SKU lots and run root-cause inspection",
			"Increase sampling rate at inbound for flagged products",
			"Open supplier quality review with return data evidence",
		],
		financial: [
			"Prioritize refurbish disposition for high-value returns",
			"Accelerate inspection queue for pending reverse orders",
			"Track recovery yield weekly by warehouse",
		],
	};

	return {
		analysis: `${outlier.metric} is outside the expected range (${outlier.expectedRange}). Current reading: ${outlier.value}. Context: ${contextSummary}. Industry context: ${webContext.slice(0, 300)}`,
		likelyCauses: causesByCategory[outlier.category] ?? causesByCategory.operations,
		recommendedActions:
			actionsByCategory[outlier.category] ?? actionsByCategory.operations,
	};
}

async function enrichOutlierWithAi(
	outlier: DetectedOutlier,
	snippets: { title: string; snippet: string; url?: string }[],
): Promise<Pick<EnrichedOutlier, "analysis" | "likelyCauses" | "recommendedActions" | "aiPowered">> {
	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		return { ...buildFallbackAnalysis(outlier, snippets), aiPowered: false };
	}

	try {
		const client = new OpenAI({ apiKey });
		const webBlock =
			snippets.length > 0
				? snippets
						.map((s, i) => `[${i + 1}] ${s.title}: ${s.snippet}`)
						.join("\n")
				: "No web search results available.";

		const response = await client.chat.completions.create({
			model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
			temperature: 0.3,
			response_format: { type: "json_object" },
			messages: [
				{
					role: "system",
					content:
						"You are a supply chain operations analyst. Analyze warehouse KPI outliers. Respond with JSON: { \"analysis\": string (2-3 sentences), \"likelyCauses\": string[] (2-4 items), \"recommendedActions\": string[] (2-4 actionable items) }. Be specific to the metric and use web context when relevant.",
				},
				{
					role: "user",
					content: `Metric: ${outlier.metric}
Value: ${outlier.value}
Expected: ${outlier.expectedRange}
Severity: ${outlier.severity}
Category: ${outlier.category}
Context: ${JSON.stringify(outlier.context)}

Web research:
${webBlock}`,
				},
			],
		});

		const raw = response.choices[0]?.message?.content;
		if (!raw) {
			return { ...buildFallbackAnalysis(outlier, snippets), aiPowered: false };
		}

		const parsed = JSON.parse(raw) as {
			analysis?: string;
			likelyCauses?: string[];
			recommendedActions?: string[];
		};

		return {
			analysis: parsed.analysis ?? buildFallbackAnalysis(outlier, snippets).analysis,
			likelyCauses: parsed.likelyCauses?.slice(0, 4) ?? [],
			recommendedActions: parsed.recommendedActions?.slice(0, 4) ?? [],
			aiPowered: true,
		};
	} catch {
		return { ...buildFallbackAnalysis(outlier, snippets), aiPowered: false };
	}
}

export const getOutlierInsightsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/outlier-insights",
		tags: ["Analytics", "AI"],
		summary: "Detect KPI outliers and enrich with AI analysis and web research",
	})
	.input(getOutlierInsightsInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		const dashboard = await fetchDashboardAnalytics(input.organizationId);
		const outliers = detectOutliers(dashboard).slice(0, 6);

		const enriched: EnrichedOutlier[] = await Promise.all(
			outliers.map(async (outlier) => {
				const webSources = await searchWeb(outlier.searchQuery);
				const ai = await enrichOutlierWithAi(outlier, webSources);

				return {
					...outlier,
					...ai,
					webSources,
				};
			}),
		);

		return {
			outliers: enriched,
			summary: {
				total: enriched.length,
				critical: enriched.filter((o) => o.severity === "critical").length,
				warning: enriched.filter((o) => o.severity === "warning").length,
				aiEnabled: Boolean(process.env.OPENAI_API_KEY),
			},
			generatedAt: new Date().toISOString(),
		};
	});
