import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createWarehouse = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/warehouses",
		tags: ["WMS", "Warehouses"],
		summary: "Create a warehouse",
	})
	.input(
		z.object({
			organizationId: z.string(),
			code: z.string().min(1).max(50),
			name: z.string().min(1).max(200),
			address: z.string().optional(),
			tierType: z
				.enum(["NATIONAL_DC", "REGIONAL_DC", "LOCAL_DC"])
				.optional(),
			parentWarehouseId: z.string().optional(),
			metadata: z.record(z.unknown()).optional(),
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

		// Validate unique code per org
		const existing = await db.warehouse.findUnique({
			where: {
				organizationId_code: {
					organizationId: input.organizationId,
					code: input.code,
				},
			},
		});
		if (existing) {
			throw new ORPCError("CONFLICT", {
				message: `A warehouse with code "${input.code}" already exists in this organization.`,
			});
		}

		// Validate parentWarehouseId belongs to same org
		if (input.parentWarehouseId) {
			const parent = await db.warehouse.findFirst({
				where: {
					id: input.parentWarehouseId,
					organizationId: input.organizationId,
				},
			});
			if (!parent) {
				throw new ORPCError("NOT_FOUND", {
					message: "Parent warehouse not found in this organization.",
				});
			}
		}

		const warehouse = await db.warehouse.create({
			data: {
				organizationId: input.organizationId,
				code: input.code,
				name: input.name,
				address: input.address,
				tierType: input.tierType,
				parentWarehouseId: input.parentWarehouseId,
				metadata: input.metadata,
			},
		});

		return { warehouse };
	});
