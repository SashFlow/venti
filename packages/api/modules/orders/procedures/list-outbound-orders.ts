import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listOutboundOrders } from "../services/orders-service";

const listOutboundOrdersInput = z.object({
	organizationId: z.string(),
	customerId: z.string().optional(),
	query: z.string().optional(),
	status: z.array(z.string()).optional(),
	warehouseId: z.string().optional(),
	priority: z.enum(["CRITICAL", "HIGH", "NORMAL", "LOW"]).optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
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