import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { deleteCustomer } from "../services/customers-service";

const deleteCustomerInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const deleteCustomerProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/customers/{id}",
		tags: ["Customers"],
		summary: "Delete customer",
		description: "Delete a customer for an organization.",
	})
	.input(deleteCustomerInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const deleted = await deleteCustomer({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!deleted) {
			throw new ORPCError("NOT_FOUND", {
				message: "Customer not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "customer.delete",
			resource: "customer",
			resourceId: input.id,
		});

		return {
			deleted: true,
		};
	});
