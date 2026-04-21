import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listAisles = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/zones/:zoneId/aisles",
		tags: ["WMS", "Warehouses"],
		summary: "List aisles within a zone",
	})
	.input(
		z.object({
			organizationId: z.string(),
			zoneId: z.string(),
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

		// Verify zone belongs to an org-owned warehouse
		const zone = await db.warehouseZone.findFirst({
			where: {
				id: input.zoneId,
				level: {
					warehouse: { organizationId: input.organizationId },
				},
			},
		});
		if (!zone) throw new ORPCError("NOT_FOUND");

		const aisles = await db.warehouseAisle.findMany({
			where: { zoneId: input.zoneId },
			include: {
				_count: {
					select: { bins: true },
				},
			},
			orderBy: { code: "asc" },
		});

		return { aisles };
	});
