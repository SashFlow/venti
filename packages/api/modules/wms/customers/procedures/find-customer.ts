import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findCustomer = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/customers/{customerId}",
		tags: ["WMS", "Customers"],
		summary: "Find a customer by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			customerId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.RETURNS,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const customer = await db.customer.findFirst({
			where: {
				id: input.customerId,
				organizationId: input.organizationId,
			},
		});

		if (!customer)
			throw new ORPCError("NOT_FOUND", {
				message: "Customer not found.",
			});

		return { customer };
	});
