import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { receiveTransfer } from "@repo/database";

const receiveTransferInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locationId: z.string(),
	skuId: z.string(),
	quantity: z.number().positive(),
	sourceUnitCost: z.number().nonnegative(),
	apportionedFreightCost: z.number().nonnegative(),
});

export const receiveTransferProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/inventory/receive-transfer",
		tags: ["Inventory", "Transfers"],
		summary: "Receive a transfer and calculate new MAC",
	})
	.input(receiveTransferInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return receiveTransfer({ ...input, userId: user.id });
	});
