import { getSkuInvestmentInsights } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getSkuInvestmentInput = z.object({
	organizationId: z.string(),
});

export const getSkuInvestmentInsightsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/sku-investment",
		tags: ["Analytics"],
		summary: "SKU investment vs traction quadrant insights",
	})
	.input(getSkuInvestmentInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return getSkuInvestmentInsights(input.organizationId);
	});
