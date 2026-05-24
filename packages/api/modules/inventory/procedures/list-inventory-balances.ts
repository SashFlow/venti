import { listInventoryBalances } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const listInventoryBalancesInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string().optional(),
	locationId: z.string().optional(),
	skuId: z.string().optional(),
	lotId: z.string().optional(),
	state: z
		.enum(["AVAILABLE", "QC", "HOLD", "RESERVED", "DAMAGED", "QUARANTINE"])
		.optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
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
