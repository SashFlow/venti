import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listInboundOrders } from "../services/orders-service";

const listInboundOrdersInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listInboundOrdersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/inbound",
		tags: ["Orders"],
		summary: "List inbound purchase orders",
		description: "List purchase orders for the organization.",
	})
	.input(listInboundOrdersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listInboundOrders(input);
	});
