import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createPurchaseOrder } from "@repo/database";

const lineSchema = z.object({
	skuId: z.string(),
	uomId: z.string().optional(),
	orderedQty: z.number().positive(),
	unitCost: z.number().nonnegative().optional(),
	expectedDate: z.coerce.date().optional(),
});

export const createPurchaseOrderProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/inbound",
		tags: ["Orders"],
		summary: "Create purchase order",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			supplierId: z.string(),
			poNumber: z.string().min(1).max(100),
			expectedDate: z.coerce.date().optional(),
			notes: z.string().optional(),
			lines: z.array(lineSchema).min(1),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return createPurchaseOrder({
			...input,
			createdById: user.id,
		});
	});
