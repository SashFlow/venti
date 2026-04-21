import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createLevel = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/warehouses/:warehouseId/levels",
		tags: ["WMS", "Warehouses"],
		summary: "Create a warehouse level",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			type: z.enum(["GROUND_FLOOR", "MEZZANINE", "BASEMENT", "ROOF", "ROOFTOP"]),
			name: z.string().min(1).max(200),
			sequence: z.number().int().min(0),
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

		// Verify warehouse belongs to this org
		const warehouse = await db.warehouse.findFirst({
			where: {
				id: input.warehouseId,
				organizationId: input.organizationId,
			},
		});
		if (!warehouse) throw new ORPCError("NOT_FOUND");

		const level = await db.warehouseLevel.create({
			data: {
				warehouseId: input.warehouseId,
				type: input.type,
				name: input.name,
				sequence: input.sequence,
			},
		});

		return { level };
	});
