import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { receiveInventory } from "@repo/database";

const receiveInventoryInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locationId: z.string(),
	skuId: z.string(),
	quantity: z.number().positive(),
	purchaseUnitPrice: z.number().nonnegative(),
	apportionedFreightCost: z.number().nonnegative(),
	purchaseOrderItemId: z.string().optional(),
});

export const receiveInventoryProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/inbound/receive-inventory",
		tags: ["Inbound"],
		summary: "Receive inventory and calculate Landed Cost",
	})
	.input(receiveInventoryInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return receiveInventory({ ...input, userId: user.id });
	});
