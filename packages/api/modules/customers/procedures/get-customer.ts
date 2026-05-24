import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getCustomerById } from "@repo/database";

const getCustomerInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const getCustomerProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/customers/{id}",
		tags: ["Customers"],
		summary: "Get customer",
		description: "Fetch a single customer by id within organization scope.",
	})
	.input(getCustomerInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const customer = await getCustomerById({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!customer) {
			throw new ORPCError("NOT_FOUND", {
				message: "Customer not found.",
			});
		}

		return { customer };
	});
