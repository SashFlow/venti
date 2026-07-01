import { getInboundOutboundFlowAnalytics } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getFlowTimelineInput = z.object({
	organizationId: z.string(),
	months: z.number().min(1).max(24).default(12),
});

export const getFlowTimelineProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/flow-timeline",
		tags: ["Analytics"],
		summary: "Monthly inbound vs outbound flow comparison",
	})
	.input(getFlowTimelineInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const analytics = await getInboundOutboundFlowAnalytics(
			input.organizationId,
			input.months,
		);

		return analytics;
	});
