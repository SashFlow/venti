import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listConsignment = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/consignment",
		tags: ["WMS", "Inventory"],
		summary: "List consignment stock records",
	})
	.input(
		z.object({
			organizationId: z.string(),
			supplierId: z.string().optional(),
			variantId: z.string().optional(),
			warehouseId: z.string().optional(),
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
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const where: Record<string, unknown> = {
			organizationId: input.organizationId,
		};

		if (input.supplierId) where.supplierId = input.supplierId;
		if (input.variantId) where.variantId = input.variantId;
		if (input.warehouseId) where.warehouseId = input.warehouseId;

		const consignments = await db.consignmentStock.findMany({
			where,
			orderBy: { createdAt: "desc" },
		});

		return { consignments };
	});
