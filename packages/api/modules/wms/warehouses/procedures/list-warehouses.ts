import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listWarehouses = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/warehouses",
		tags: ["WMS", "Warehouses"],
		summary: "List warehouses",
	})
	.input(
		z.object({
			organizationId: z.string(),
			includeInactive: z.boolean().optional(),
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
				WMS_RESOURCES.WAREHOUSE,
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const warehouses = await db.warehouse.findMany({
			where: {
				organizationId: input.organizationId,
				...(input.includeInactive ? {} : { active: true }),
			},
			include: {
				_count: {
					select: { levels: true },
				},
			},
			orderBy: { createdAt: "asc" },
		});

		return { warehouses };
	});
