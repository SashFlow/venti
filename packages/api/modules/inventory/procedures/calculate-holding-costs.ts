import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { calculateHoldingCosts } from "@repo/database";

const calculateHoldingCostsInput = z.object({
	organizationId: z.string(),
});

export const calculateHoldingCostsProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/inventory/calculate-holding-costs",
		tags: ["Inventory", "Financials"],
		summary: "Calculate and apply holding costs for all active warehouses",
	})
	.input(calculateHoldingCostsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		// Note: in a real production env, this might be protected by an admin/cron middleware
		await calculateHoldingCosts(input.organizationId);
		return { success: true };
	});
