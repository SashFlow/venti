import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { updateCustomerLocation } from "@repo/database";

const updateCustomerLocationInput = z.object({
	organizationId: z.string(),
	customerId: z.string(),
	id: z.string(),
	name: z.string().trim().min(1).max(255).optional(),
	isDefault: z.boolean().optional(),
	notes: z.string().trim().optional(),
	address: z
		.object({
			addressLine1: z.string().trim().min(1).max(255).optional(),
			addressLine2: z.string().trim().max(255).optional(),
			city: z.string().trim().min(1).max(100).optional(),
			state: z.string().trim().min(1).max(100).optional(),
			zip: z.string().trim().min(1).max(20).optional(),
			country: z.string().trim().min(1).max(100).optional(),
		})
		.optional(),
});

export const updateCustomerLocationProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/customers/{customerId}/locations/{id}",
		tags: ["Customers"],
		summary: "Update customer location",
		description: "Update a customer delivery location.",
	})
	.input(updateCustomerLocationInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const result = await updateCustomerLocation({
			organizationId: input.organizationId,
			customerId: input.customerId,
			id: input.id,
			name: input.name,
			isDefault: input.isDefault,
			notes: input.notes,
			address: input.address,
		});

		if (!result) {
			throw new ORPCError("NOT_FOUND", {
				message: "Customer location not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "customer.location.update",
			resource: "customer_location",
			resourceId: input.id,
			metadata: { customerId: input.customerId },
		});

		return result;
	});
