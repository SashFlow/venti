import { ORPCError } from "@orpc/server";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getSupplierCode, updateSupplier } from "@repo/database";

const updateSupplierInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	code: z.string().trim().min(1).max(50).optional(),
	name: z.string().trim().min(1).max(255).optional(),
	email: z.string().trim().email().max(255).optional(),
	phone: z.string().trim().max(50).optional(),
	defaultLeadTimeDays: z.number().int().min(0).max(3650).optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateSupplierProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/master-data/suppliers/{id}",
		tags: ["Master Data"],
		summary: "Update supplier",
		description: "Update supplier fields for an organization.",
	})
	.input(updateSupplierInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const supplier = await updateSupplier({
				organizationId: input.organizationId,
				id: input.id,
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

			if (!supplier) {
				throw new ORPCError("NOT_FOUND", {
					message: "Supplier not found.",
				});
			}

			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "supplier.update",
				resource: "supplier",
				resourceId: supplier.id,
				metadata: {
					code: getSupplierCode(supplier),
					name: supplier.name,
				},
			});

			return { supplier };
		} catch (error) {
			if (error instanceof ORPCError) {
				throw error;
			}

			throw new ORPCError("BAD_REQUEST", {
				message:
					"Could not update supplier. Check for duplicate supplier code in this organization.",
			});
		}
	});
