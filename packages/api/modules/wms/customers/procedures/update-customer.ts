import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const updateCustomer = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/customers/{customerId}",
		tags: ["WMS", "Customers"],
		summary: "Update a customer",
	})
	.input(
		z.object({
			organizationId: z.string(),
			customerId: z.string(),
			name: z.string().min(1).optional(),
			contactName: z.string().optional(),
			email: z.string().email().optional(),
			phone: z.string().optional(),
			address: z.string().optional(),
			active: z.boolean().optional(),
			metadata: z.record(z.unknown()).optional(),
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
				WMS_ACTIONS.UPDATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.customer.findFirst({
			where: {
				id: input.customerId,
				organizationId: input.organizationId,
			},
		});
		if (!existing)
			throw new ORPCError("NOT_FOUND", {
				message: "Customer not found.",
			});

		const { organizationId, customerId, ...data } = input;

		const customer = await db.customer.update({
			where: { id: customerId },
			data,
		});

		return { customer };
	});
