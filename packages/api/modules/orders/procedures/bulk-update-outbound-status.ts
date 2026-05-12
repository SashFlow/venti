import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { bulkUpdateOutboundOrderStatus } from "../services/orders-service";

const bulkUpdateOutboundStatusInput = z.object({
	organizationId: z.string(),
	orderIds: z.array(z.string()).min(1).max(200),
	status: z.enum([
		"DRAFT",
		"CONFIRMED",
		"FULLY_SHIPPED",
		"CANCELLED",
		"CLOSED",
	]),
});

export const bulkUpdateOutboundStatusProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/orders/outbound/status/bulk",
		tags: ["Orders"],
		summary: "Bulk update outbound order status",
		description:
			"Update status for multiple outbound sales orders in a single request.",
	})
	.input(bulkUpdateOutboundStatusInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const result = await bulkUpdateOutboundOrderStatus(input);

		return result;
	});
