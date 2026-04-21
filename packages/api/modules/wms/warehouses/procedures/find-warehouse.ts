import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const findWarehouse = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/warehouses/:warehouseId",
		tags: ["WMS", "Warehouses"],
		summary: "Get a warehouse by ID",
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

		const warehouse = await db.warehouse.findFirst({
			where: {
				id: input.warehouseId,
				organizationId: input.organizationId,
			},
			include: {
				levels: {
					include: {
						zones: {
							include: {
								aisles: {
									include: {
										bins: true,
									},
								},
							},
						},
					},
					orderBy: { sequence: "asc" },
				},
			},
		});

		if (!warehouse) throw new ORPCError("NOT_FOUND");

		return { warehouse };
	});
