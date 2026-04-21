import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createBatchLot = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/batches",
		tags: ["WMS", "Inventory"],
		summary: "Create a batch/lot record",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string(),
			lotNumber: z.string().min(1),
			mfgDate: z.string().datetime().optional(),
			expiryDate: z.string().datetime().optional(),
			supplierId: z.string().optional(),
			qtyReceived: z.number().positive(),
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

		// Verify variant belongs to org
		const variant = await db.productVariant.findFirst({
			where: { id: input.variantId, organizationId: input.organizationId },
			select: { id: true },
		});
		if (!variant)
			throw new ORPCError("NOT_FOUND", { message: "Variant not found" });

		// Enforce unique [organizationId, variantId, lotNumber]
		const duplicate = await db.batchLot.findUnique({
			where: {
				organizationId_variantId_lotNumber: {
					organizationId: input.organizationId,
					variantId: input.variantId,
					lotNumber: input.lotNumber,
				},
			},
			select: { id: true },
		});
		if (duplicate)
			throw new ORPCError("CONFLICT", {
				message: "A batch/lot with this lot number already exists for this variant",
			});

		const batchLot = await db.batchLot.create({
			data: {
				organizationId: input.organizationId,
				variantId: input.variantId,
				lotNumber: input.lotNumber,
				mfgDate: input.mfgDate ? new Date(input.mfgDate) : undefined,
				expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
				supplierId: input.supplierId,
				qtyReceived: input.qtyReceived,
				qtyRemaining: input.qtyReceived,
				status: "ACTIVE",
			},
			include: {
				variant: { select: { id: true, sku: true, name: true } },
			},
		});

		return { batchLot };
	});
