import { resetDemoState } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const resetDemoProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/organizations/reset-demo",
		tags: ["Organizations"],
		summary: "Reset demo flags (insight dismissals)",
	})
	.input(z.object({ organizationId: z.string() }))
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return resetDemoState(input);
	});
