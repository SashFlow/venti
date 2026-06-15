import { listReturnOrders } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const listReturnOrdersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/returns",
		tags: ["Returns"],
		summary: "List return orders",
	})
	.input(
		z.object({
			organizationId: z.string(),
			limit: z.number().min(1).max(50).default(20),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		const orders = await listReturnOrders(input);
		return { orders };
	});
