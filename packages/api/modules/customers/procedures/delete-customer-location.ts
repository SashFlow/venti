import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { deleteCustomerLocation } from "@repo/database";

const deleteCustomerLocationInput = z.object({
	organizationId: z.string(),
	customerId: z.string(),
	id: z.string(),
});

export const deleteCustomerLocationProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/customers/{customerId}/locations/{id}",
		tags: ["Customers"],
		summary: "Delete customer location",
		description: "Delete a customer delivery location and its address.",
	})
	.input(deleteCustomerLocationInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const deleted = await deleteCustomerLocation({
			organizationId: input.organizationId,
			customerId: input.customerId,
			id: input.id,
		});

		if (!deleted) {
			throw new ORPCError("NOT_FOUND", {
				message: "Customer location not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "customer.location.delete",
			resource: "customer_location",
			resourceId: input.id,
			metadata: { customerId: input.customerId },
		});

		return { success: true };
	});
