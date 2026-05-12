import { ORPCError } from "@orpc/server";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { updateCustomer } from "../services/customers-service";

const updateCustomerInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	name: z.string().trim().min(1).max(255).optional(),
	email: z.string().trim().email().max(255).optional(),
	phone: z.string().trim().max(50).optional(),
	isWholesaler: z.boolean().optional(),
	notes: z.string().trim().optional(),
	lastOrderAt: z.date().optional(),
	totalOrders: z.number().int().min(0).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateCustomerProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/customers/{id}",
		tags: ["Customers"],
		summary: "Update customer",
		description: "Update customer fields for an organization.",
	})
	.input(updateCustomerInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const customer = await updateCustomer({
			organizationId: input.organizationId,
			id: input.id,
			data: {
				name: input.name,
				email: input.email,
				phone: input.phone,
				isWholesaler: input.isWholesaler,
				notes: input.notes,
				lastOrderAt: input.lastOrderAt,
				totalOrders: input.totalOrders,
				metadata: input.metadata as Prisma.InputJsonValue | undefined,
			},
		});

		if (!customer) {
			throw new ORPCError("NOT_FOUND", {
				message: "Customer not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "customer.update",
			resource: "customer",
			resourceId: customer.id,
			metadata: {
				name: customer.name,
				email: customer.email,
			},
		});

		return { customer };
	});
