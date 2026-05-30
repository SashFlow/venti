import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { transferOutbound } from "@repo/database";

const dispatchTransferInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locationId: z.string(),
	skuId: z.string(),
	quantity: z.number().positive(),
});

export const dispatchTransferProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/inventory/dispatch-transfer",
		tags: ["Inventory", "Transfers"],
		summary: "Dispatch a transfer out of a warehouse",
	})
	.input(dispatchTransferInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return transferOutbound({ ...input, userId: user.id });
	});
