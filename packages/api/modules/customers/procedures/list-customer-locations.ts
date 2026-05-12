import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listCustomerLocations } from "../services/customers-service";

const listCustomerLocationsInput = z.object({
	organizationId: z.string(),
	customerId: z.string(),
});

export const listCustomerLocationsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/customers/{customerId}/locations",
		tags: ["Customers"],
		summary: "List customer locations",
		description: "List all delivery locations for a customer.",
	})
	.input(listCustomerLocationsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listCustomerLocations(input);
	});
