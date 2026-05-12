import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listTransfers } from "../services/orders-service";

const listTransfersInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listTransfersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/transfers",
		tags: ["Orders"],
		summary: "List transfer movements",
		description: "List internal transfer movements for the organization.",
	})
	.input(listTransfersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listTransfers(input);
	});
