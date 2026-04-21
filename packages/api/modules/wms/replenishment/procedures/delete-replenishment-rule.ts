import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const deleteReplenishmentRule = wmsProcedure
	.route({
		method: "DELETE",
		path: "/wms/replenishment/rules/{id}",
		tags: ["WMS", "Replenishment"],
		summary: "Delete a replenishment rule",
	})
	.input(
		z.object({
			organizationId: z.string(),
			ruleId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.REPLENISHMENT,
				WMS_ACTIONS.DELETE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const existing = await db.replenishmentRule.findFirst({
			where: {
				id: input.ruleId,
				organizationId: input.organizationId,
			},
			select: { id: true },
		});

		if (!existing)
			throw new ORPCError("NOT_FOUND", { message: "Replenishment rule not found" });

		await db.replenishmentRule.delete({ where: { id: input.ruleId } });

		return { success: true };
	});
