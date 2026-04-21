import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const updateWarehouse = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/warehouses/:warehouseId",
		tags: ["WMS", "Warehouses"],
		summary: "Update a warehouse",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			name: z.string().min(1).max(200).optional(),
			address: z.string().optional(),
			tierType: z
				.enum(["NATIONAL_DC", "REGIONAL_DC", "LOCAL_DC"])
				.optional(),
			parentWarehouseId: z.string().nullable().optional(),
			active: z.boolean().optional(),
			metadata: z.record(z.unknown()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { organizationId, warehouseId, ...data } = input;

		const membership = await verifyOrganizationMembership(
			organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		if (
			!(await context.can(
				organizationId,
				WMS_RESOURCES.WAREHOUSE,
				WMS_ACTIONS.UPDATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const existing = await db.warehouse.findFirst({
			where: { id: warehouseId, organizationId },
		});
		if (!existing) throw new ORPCError("NOT_FOUND");

		// Validate parentWarehouseId belongs to same org (if being updated)
		if (data.parentWarehouseId) {
			const parent = await db.warehouse.findFirst({
				where: {
					id: data.parentWarehouseId,
					organizationId,
				},
			});
			if (!parent) {
				throw new ORPCError("NOT_FOUND", {
					message: "Parent warehouse not found in this organization.",
				});
			}
		}

		const warehouse = await db.warehouse.update({
			where: { id: warehouseId },
			data,
		});

		return { warehouse };
	});
