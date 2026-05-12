import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createCustomerLocation } from "../services/customers-service";

const addressSchema = z.object({
	addressLine1: z.string().trim().min(1).max(255),
	addressLine2: z.string().trim().max(255).optional(),
	city: z.string().trim().min(1).max(100),
	state: z.string().trim().min(1).max(100),
	zip: z.string().trim().min(1).max(20),
	country: z.string().trim().min(1).max(100),
});

const createCustomerLocationInput = z.object({
	organizationId: z.string(),
	customerId: z.string(),
	name: z.string().trim().min(1).max(255),
	isDefault: z.boolean().default(false),
	notes: z.string().trim().optional(),
	address: addressSchema,
});

export const createCustomerLocationProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/customers/{customerId}/locations",
		tags: ["Customers"],
		summary: "Create customer location",
		description: "Add a delivery location to a customer.",
	})
	.input(createCustomerLocationInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const result = await createCustomerLocation({
			organizationId: input.organizationId,
			customerId: input.customerId,
			name: input.name,
			isDefault: input.isDefault,
			notes: input.notes,
			address: input.address,
		});

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "customer.location.create",
			resource: "customer_location",
			resourceId: result.location.id,
			metadata: { customerId: input.customerId, name: input.name },
		});

		return result;
	});
