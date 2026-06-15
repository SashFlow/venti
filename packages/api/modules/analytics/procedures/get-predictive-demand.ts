import { getPredictiveDemandInsights } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getPredictiveDemandInput = z.object({
	organizationId: z.string(),
	zipCode: z.string().optional(),
	radiusKm: z.number().default(50),
});

export const getPredictiveDemandProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/predictive-demand",
		tags: ["Analytics", "AI"],
		summary: "Predict HVAC part demand based on inventory velocity and weather scenario.",
	})
	.input(getPredictiveDemandInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const result = await getPredictiveDemandInsights(input.organizationId);

		return {
			forecast: result.forecast,
			recommendations: result.recommendations.map((r) => ({
				skuId: r.skuId,
				skuCode: r.skuCode,
				description: r.description,
				warehouseId: r.warehouseId,
				warehouseName: r.warehouseName,
				onHand: r.onHand,
				dailyVelocity: r.dailyVelocity,
				daysOfCover: r.daysOfCover,
				riskFactor: r.riskFactor,
				suggestedQty: r.suggestedQty,
				locationId: r.locationId,
			})),
			action: result.action,
			dataSources: result.dataSources,
			insightKey: "demand:EXTREME_HEAT",
		};
	});
