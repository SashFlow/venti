import { ORPCError } from "@orpc/server";
import { updateOutboundOrderStatus } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const updateOutboundOrderStatusInput = z.object({
	organizationId: z.string(),
	orderId: z.string(),
	status: z.enum([
		"DRAFT",
		"ALLOCATED",
		"PICKING",
		"PACKING",
		"SHIPPED",
		"CANCELLED",
	]),
});

export const updateOutboundOrderStatusProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/orders/outbound/{orderId}/status",
		tags: ["Orders"],
		summary: "Update outbound order status",
		description:
			"Update status for an outbound sales order in an organization.",
	})
	.input(updateOutboundOrderStatusInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const order = await updateOutboundOrderStatus(input);

		if (!order) {
			throw new ORPCError("NOT_FOUND", {
				message: "Outbound order not found.",
			});
		}

		return { order };
	});
