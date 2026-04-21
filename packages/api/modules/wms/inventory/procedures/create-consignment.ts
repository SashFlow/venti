import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createConsignment = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/consignment",
		tags: ["WMS", "Inventory"],
		summary: "Create a consignment stock record",
	})
	.input(
		z.object({
			organizationId: z.string(),
			supplierId: z.string(),
			variantId: z.string(),
			warehouseId: z.string(),
			binId: z.string().optional(),
			qty: z.number().positive(),
			terms: z.string().optional(),
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
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.CREATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Verify supplier belongs to org
		const supplier = await db.supplier.findFirst({
			where: { id: input.supplierId, organizationId: input.organizationId },
			select: { id: true },
		});
		if (!supplier)
			throw new ORPCError("NOT_FOUND", { message: "Supplier not found" });

		// Verify variant belongs to org
		const variant = await db.productVariant.findFirst({
			where: { id: input.variantId, organizationId: input.organizationId },
			select: { id: true },
		});
		if (!variant)
			throw new ORPCError("NOT_FOUND", { message: "Variant not found" });

		const consignment = await db.consignmentStock.create({
			data: {
				organizationId: input.organizationId,
				supplierId: input.supplierId,
				variantId: input.variantId,
				warehouseId: input.warehouseId,
				binId: input.binId,
				qty: input.qty,
				terms: input.terms,
				metadata: input.metadata,
			},
		});

		return { consignment };
	});
