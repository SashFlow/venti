import { ORPCError } from "@orpc/server";
import { createCustomer } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const createCustomerInput = z.object({
	organizationId: z.string(),
	name: z.string().trim().min(1).max(255),
	email: z.string().trim().email().max(255).optional(),
	phone: z.string().trim().max(50).optional(),
	isWholesaler: z.boolean().default(false),
	notes: z.string().trim().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createCustomerProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/customers",
		tags: ["Customers"],
		summary: "Create customer",
		description: "Create a customer under an organization.",
	})
	.input(createCustomerInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const customer = await createCustomer({
				organizationId: input.organizationId,
				data: {
					name: input.name,
					email: input.email,
					phone: input.phone,
					isWholesaler: input.isWholesaler,
					notes: input.notes,
					metadata: input.metadata as
						| Prisma.InputJsonValue
						| undefined,
				},
			});

			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "customer.create",
				resource: "customer",
				resourceId: customer.id,
				metadata: {
					name: customer.name,
					email: customer.email,
				},
			});

			return { customer };
		} catch {
			throw new ORPCError("BAD_REQUEST", {
				message: "Could not create customer.",
			});
		}
	});
