import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const createReturnOrderInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	customerId: z.string(),
	salesOrderId: z.string().optional(),
	returnNumber: z.string(),
	reason: z.string().optional(),
	items: z.array(
		z.object({
			skuId: z.string(),
			quantity: z.number().min(0.01),
		}),
	),
});

export const createReturnOrderProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/returns",
		tags: ["Returns"],
		summary: "Create Return Order",
		description: "Create a new return order for a customer",
	})
	.input(createReturnOrderInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		const order = await db.returnOrder.create({
			data: {
				warehouseId: input.warehouseId,
				customerId: input.customerId,
				salesOrderId: input.salesOrderId,
				returnNumber: input.returnNumber,
				reason: input.reason,
				status: "CREATED",
				items: {
					create: input.items.map((item) => ({
						skuId: item.skuId,
						quantity: item.quantity,
					})),
				},
			},
			include: {
				items: true,
			},
		});

		return order;
	});
