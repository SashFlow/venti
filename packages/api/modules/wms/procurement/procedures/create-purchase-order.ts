import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const createPurchaseOrder = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/purchase-orders",
		tags: ["WMS", "Procurement"],
		summary: "Create a purchase order",
	})
	.input(
		z.object({
			organizationId: z.string(),
			supplierId: z.string(),
			warehouseId: z.string(),
			poType: z.enum(["STANDARD", "MTO", "REPLENISHMENT"]).optional(),
			expectedDate: z.string().datetime().optional(),
			notes: z.string().optional(),
			metadata: z.record(z.unknown()).optional(),
			lines: z
				.array(
					z.object({
						variantId: z.string(),
						uomId: z.string(),
						qty: z.number().positive(),
						unitCost: z.number().nonnegative(),
						metadata: z.record(z.unknown()).optional(),
					}),
				)
				.min(1),
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
				WMS_RESOURCES.PROCUREMENT,
				WMS_ACTIONS.CREATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify supplier belongs to org
		const supplier = await db.supplier.findFirst({
			where: { id: input.supplierId, organizationId: input.organizationId },
		});
		if (!supplier) throw new ORPCError("NOT_FOUND", "Supplier not found");

		// Verify warehouse belongs to org
		const warehouse = await db.warehouse.findFirst({
			where: { id: input.warehouseId, organizationId: input.organizationId },
		});
		if (!warehouse) throw new ORPCError("NOT_FOUND", "Warehouse not found");

		const purchaseOrder = await db.$transaction(async (tx) => {
			const poNumber = await generateDocNumber(tx, {
				organizationId: input.organizationId,
				prefix: "PO",
				countFn: () =>
					tx.purchaseOrder.count({
						where: { organizationId: input.organizationId },
					}),
			});

			const po = await tx.purchaseOrder.create({
				data: {
					organizationId: input.organizationId,
					poNumber,
					supplierId: input.supplierId,
					warehouseId: input.warehouseId,
					poType: input.poType ?? "STANDARD",
					status: "DRAFT",
					expectedDate: input.expectedDate
						? new Date(input.expectedDate)
						: undefined,
					notes: input.notes,
					metadata: input.metadata,
					lines: {
						create: input.lines.map((line) => ({
							variantId: line.variantId,
							uomId: line.uomId,
							qty: line.qty,
							unitCost: line.unitCost,
							metadata: line.metadata,
						})),
					},
				},
				include: {
					lines: true,
				},
			});

			return po;
		});

		return { purchaseOrder };
	});
