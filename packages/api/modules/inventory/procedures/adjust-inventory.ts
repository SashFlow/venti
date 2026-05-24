import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { adjustInventory } from "../services/inventory-service";

const adjustInventoryInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locationId: z.string(),
	skuId: z.string(),
	quantityChange: z.number(),
	reason: z.string(),
});

export const adjustInventoryProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/inventory/adjust",
		tags: ["Inventory"],
		summary: "Adjust inventory manually",
	})
	.input(adjustInventoryInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return adjustInventory({ ...input, userId: user.id });
	});
