import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { completeTransfer } from "../services/orders-service";

const completeTransferInput = z.object({
	organizationId: z.string(),
	transferId: z.string(),
});

export const completeTransferProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/transfers/{transferId}/complete",
		tags: ["Orders"],
		summary: "Complete transfer",
		description: "Mark an internal transfer movement as completed.",
	})
	.input(completeTransferInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const transfer = await completeTransfer(input);

		if (!transfer) {
			throw new ORPCError("NOT_FOUND", {
				message: "Transfer not found.",
			});
		}

		return { transfer };
	});
