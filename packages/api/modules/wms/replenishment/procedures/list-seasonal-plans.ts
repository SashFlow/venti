import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listSeasonalPlans = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/replenishment/seasonal",
		tags: ["WMS", "Replenishment"],
		summary: "List seasonal demand plans",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string().optional(),
			year: z.number().int().optional(),
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
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const where: Record<string, unknown> = {
			organizationId: input.organizationId,
		};

		if (input.variantId) where.variantId = input.variantId;
		if (input.year !== undefined) where.year = input.year;

		const plans = await db.seasonalDemandPlan.findMany({
			where,
			orderBy: [{ year: "desc" }, { phase: "asc" }],
		});

		return { plans };
	});
