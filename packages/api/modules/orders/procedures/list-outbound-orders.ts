import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listOutboundOrders } from "../services/orders-service";

const listOutboundOrdersInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listOutboundOrdersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/outbound",
		tags: ["Orders"],
		summary: "List outbound sales orders",
		description: "List outbound sales orders for the organization.",
	})
	.input(listOutboundOrdersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listOutboundOrders(input);
	});
