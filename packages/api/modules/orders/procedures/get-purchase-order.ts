import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getPurchaseOrderById } from "../services/orders-service";

export const getPurchaseOrderProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/inbound/{orderId}",
		tags: ["Orders"],
		summary: "Get purchase order by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			orderId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const order = await getPurchaseOrderById(input);

		if (!order) {
			throw new ORPCError("NOT_FOUND", {
				message: "Purchase order not found.",
			});
		}

		return { order };
	});
