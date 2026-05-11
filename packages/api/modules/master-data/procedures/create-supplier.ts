import { ORPCError } from "@orpc/server";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createSupplier } from "../services/suppliers-service";

const createSupplierInput = z.object({
	organizationId: z.string(),
	code: z.string().trim().min(1).max(50),
	name: z.string().trim().min(1).max(255),
	email: z.string().trim().email().max(255).optional(),
	phone: z.string().trim().max(50).optional(),
	defaultLeadTimeDays: z.number().int().min(0).max(3650).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createSupplierProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/master-data/suppliers",
		tags: ["Master Data"],
		summary: "Create supplier",
		description: "Create a supplier under an organization.",
	})
	.input(createSupplierInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const supplier = await createSupplier({
				organizationId: input.organizationId,
				data: {
					code: input.code,
					name: input.name,
					email: input.email,
					phone: input.phone,
					defaultLeadTimeDays: input.defaultLeadTimeDays,
					metadata: input.metadata as
						| Prisma.InputJsonValue
						| undefined,
				},
			});

			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "supplier.create",
				resource: "supplier",
				resourceId: supplier.id,
				metadata: {
					code: supplier.code,
					name: supplier.name,
				},
			});

			return { supplier };
		} catch {
			throw new ORPCError("BAD_REQUEST", {
				message:
					"Could not create supplier. Check for duplicate supplier code in this organization.",
			});
		}
	});
