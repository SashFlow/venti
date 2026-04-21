import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listLevels = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/warehouses/:warehouseId/levels",
		tags: ["WMS", "Warehouses"],
		summary: "List levels of a warehouse",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
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

		// Verify warehouse belongs to this org
		const warehouse = await db.warehouse.findFirst({
			where: {
				id: input.warehouseId,
				organizationId: input.organizationId,
			},
		});
		if (!warehouse) throw new ORPCError("NOT_FOUND");

		const levels = await db.warehouseLevel.findMany({
			where: { warehouseId: input.warehouseId },
			include: { zones: true },
			orderBy: { sequence: "asc" },
		});

		return { levels };
	});
