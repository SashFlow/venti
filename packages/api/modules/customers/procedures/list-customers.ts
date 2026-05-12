import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listCustomers } from "../services/customers-service";

const listCustomersInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listCustomersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/customers",
		tags: ["Customers"],
		summary: "List customers",
		description:
			"List customers with organization scope and offset pagination.",
	})
	.input(listCustomersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listCustomers(input);
	});
