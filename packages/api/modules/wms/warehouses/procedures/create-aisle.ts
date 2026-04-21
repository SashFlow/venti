import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createAisle = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/zones/:zoneId/aisles",
		tags: ["WMS", "Warehouses"],
		summary: "Create an aisle within a zone",
	})
	.input(
		z.object({
			organizationId: z.string(),
			zoneId: z.string(),
			code: z.string().min(1).max(50),
			name: z.string().min(1).max(200),
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
				WMS_ACTIONS.CREATE,
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

		const aisle = await db.warehouseAisle.create({
			data: {
				zoneId: input.zoneId,
				code: input.code,
				name: input.name,
			},
		});

		return { aisle };
	});
