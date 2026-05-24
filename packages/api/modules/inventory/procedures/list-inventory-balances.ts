import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listInventoryBalances } from "../services/inventory-service";

const listInventoryBalancesInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string().optional(),
	locationId: z.string().optional(),
	skuId: z.string().optional(),
	lotId: z.string().optional(),
	state: z
		.enum(["AVAILABLE", "QC", "HOLD", "RESERVED", "DAMAGED", "QUARANTINE"])
		.optional(),
});

export const listInventoryBalancesProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/inventory/balances",
		tags: ["Inventory"],
		summary: "List inventory balances",
	})
	.input(listInventoryBalancesInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listInventoryBalances(input);
	});
