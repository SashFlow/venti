import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getSalesOrderById } from "../services/orders-service";

export const getSalesOrderProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/outbound/{orderId}",
		tags: ["Orders"],
		summary: "Get sales order by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			orderId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const order = await getSalesOrderById(input);

		if (!order) {
			throw new ORPCError("NOT_FOUND", {
				message: "Sales order not found.",
			});
		}

		return { order };
	});
