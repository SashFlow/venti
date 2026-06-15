import { dismissInsight } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const dismissInsightProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/analytics/insights/dismiss",
		tags: ["Analytics", "AI"],
		summary: "Dismiss an AI insight",
	})
	.input(
		z.object({
			organizationId: z.string(),
			insightKey: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);

		return dismissInsight({
			organizationId: input.organizationId,
			insightKey: input.insightKey,
			dismissedByUserId: context.user.id,
		});
	});
