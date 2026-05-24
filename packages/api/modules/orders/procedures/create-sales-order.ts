import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createSalesOrder } from "@repo/database";

const lineSchema = z.object({
	skuId: z.string(),
	uomId: z.string().optional(),
	orderedQty: z.number().positive(),
	unitPrice: z.number().nonnegative().optional(),
});

export const createSalesOrderProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/outbound",
		tags: ["Orders"],
		summary: "Create sales order",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			customerId: z.string(),
			orderNumber: z.string().min(1).max(100),
			customerName: z.string().optional(),
			customerEmail: z.string().email().optional(),
			customerRef: z.string().optional(),
			priority: z
				.enum(["CRITICAL", "HIGH", "NORMAL", "LOW"])
				.default("NORMAL"),
			requestedShipDate: z.coerce.date().optional(),
			requiredByDate: z.coerce.date().optional(),
			notes: z.string().optional(),
			lines: z.array(lineSchema).min(1),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return createSalesOrder({
			...input,
			createdById: user.id,
		});
	});
