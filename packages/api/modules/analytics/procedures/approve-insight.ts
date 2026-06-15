import { approveInsight } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const approveInsightProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/analytics/insights/approve",
		tags: ["Analytics", "AI"],
		summary: "Approve an AI insight and create a warehouse task",
	})
	.input(
		z.object({
			organizationId: z.string(),
			insightType: z.enum([
				"demand_replenishment",
				"dead_stock_transfer",
				"maintenance_replenishment",
			]),
			insightKey: z.string(),
			warehouseId: z.string().optional(),
			skuId: z.string().optional(),
			quantity: z.number().optional(),
			fromLocationId: z.string().optional(),
			toLocationId: z.string().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);

		return approveInsight(input);
	});
