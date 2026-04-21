import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listZones = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/levels/:levelId/zones",
		tags: ["WMS", "Warehouses"],
		summary: "List zones within a warehouse level",
	})
	.input(
		z.object({
			organizationId: z.string(),
			levelId: z.string(),
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

		// Verify levelId belongs to an org-owned warehouse
		const level = await db.warehouseLevel.findFirst({
			where: {
				id: input.levelId,
				warehouse: { organizationId: input.organizationId },
			},
		});
		if (!level) throw new ORPCError("NOT_FOUND");

		const zones = await db.warehouseZone.findMany({
			where: { levelId: input.levelId },
			include: {
				_count: {
					select: { aisles: true },
				},
			},
			orderBy: { code: "asc" },
		});

		return { zones };
	});
