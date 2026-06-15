import { getDeadStockRebalanceOpportunities } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getDeadStockRebalanceInput = z.object({
	organizationId: z.string(),
});

export const getDeadStockRebalanceProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/dead-stock-rebalance",
		tags: ["Analytics", "Financials", "AI"],
		summary: "Calculate dead stock transfer opportunities from live inventory.",
	})
	.input(getDeadStockRebalanceInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return getDeadStockRebalanceOpportunities(input.organizationId);
	});
