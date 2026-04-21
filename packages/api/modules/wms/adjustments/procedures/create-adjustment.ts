import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const createAdjustment = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/adjustments",
		tags: ["WMS", "Adjustments"],
		summary: "Create a stock adjustment",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			variantId: z.string(),
			binId: z.string().optional(),
			qty: z.number().refine((v) => v !== 0, "qty must not be zero"),
			reasonCode: z.string().min(1),
			costImpact: z.number().optional(),
			notes: z.string().optional(),
			metadata: z.record(z.unknown()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.ADJUST,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify warehouse belongs to org
		const warehouse = await db.warehouse.findUnique({
			where: { id: input.warehouseId },
		});
		if (!warehouse || warehouse.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Warehouse not found");
		}

		// Verify variant belongs to org
		const variant = await db.productVariant.findUnique({
			where: { id: input.variantId },
			include: { product: { select: { organizationId: true } } },
		});
		if (!variant || variant.product.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Product variant not found");
		}

		const adjustment = await db.$transaction(async (tx) => {
			const adjNumber = await generateDocNumber(tx, {
				organizationId: input.organizationId,
				prefix: "ADJ",
				countFn: () =>
					tx.stockAdjustment.count({
						where: { organizationId: input.organizationId },
					}),
			});

			return tx.stockAdjustment.create({
				data: {
					organizationId: input.organizationId,
					warehouseId: input.warehouseId,
					variantId: input.variantId,
					binId: input.binId,
					adjNumber,
					qty: input.qty,
					reasonCode: input.reasonCode,
					costImpact: input.costImpact,
					status: "PENDING_APPROVAL",
					requestedById: context.user.id,
					notes: input.notes,
					metadata: input.metadata,
				},
				include: {
					requestedBy: { select: { name: true } },
					approvedBy: { select: { name: true } },
				},
			});
		});

		return { adjustment };
	});
