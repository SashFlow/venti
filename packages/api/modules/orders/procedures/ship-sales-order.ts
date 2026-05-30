import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { shipSalesOrder } from "@repo/database";

const shipSalesOrderInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locationId: z.string(),
	skuId: z.string(),
	quantity: z.number().positive(),
});

export const shipSalesOrderProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/ship-sales-order",
		tags: ["Orders", "Fulfillment"],
		summary: "Ship sales order and calculate COGS",
	})
	.input(shipSalesOrderInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return shipSalesOrder({ ...input, userId: user.id });
	});
