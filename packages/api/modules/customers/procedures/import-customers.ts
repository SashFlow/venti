import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const customerImportRowSchema = z.object({
	code: z.string().trim().min(1).max(255),
	name: z.string().trim().min(1).max(255),
	email: z.string().trim().email().max(255).optional(),
	phone: z.string().trim().max(50).optional(),
	notes: z.string().trim().optional(),
	isWholesaler: z.boolean().optional(),
	address1: z.string().trim().optional(),
	address2: z.string().trim().optional(),
	city: z.string().trim().optional(),
	state: z.string().trim().optional(),
	zip: z.string().trim().optional(),
	country: z.string().trim().optional(),
});

const importCustomersInput = z.object({
	organizationId: z.string(),
	rows: z.array(customerImportRowSchema).min(1).max(1000),
});

export const importCustomersProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/customers/import",
		tags: ["Customers"],
		summary: "Import customers",
		description: "Bulk import customers by creating or updating rows.",
	})
	.input(importCustomersInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		let created = 0;
		let updated = 0;
		const errors: Array<{ index: number; message: string }> = [];

		for (const [index, row] of input.rows.entries()) {
			try {
				const metadata: Prisma.InputJsonValue = {
					address1: row.address1,
					address2: row.address2,
					city: row.city,
					state: row.state,
					zip: row.zip,
					country: row.country,
				};

				const existing = await db.customer.findFirst({
					where: {
						organizationId: input.organizationId,
						code: row.code,
					},
					select: { id: true },
				});

				if (existing) {
					await db.customer.update({
						where: { id: existing.id },
						data: {
							name: row.name,
							email: row.email,
							phone: row.phone,
							notes: row.notes,
							isWholesaler: row.isWholesaler ?? false,
							metadata,
						},
					});
					updated += 1;
				} else {
					await db.customer.create({
						data: {
							organizationId: input.organizationId,
							code: row.code,
							name: row.name,
							email: row.email,
							phone: row.phone,
							notes: row.notes,
							isWholesaler: row.isWholesaler ?? false,
							metadata,
						},
					});
					created += 1;
				}
			} catch (error) {
				errors.push({
					index,
					message:
						error instanceof Error
							? error.message
							: "Failed to import row.",
				});
			}
		}

		if (created === 0 && updated === 0 && errors.length > 0) {
			throw new ORPCError("BAD_REQUEST", {
				message: "No customers were imported.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "customer.import",
			resource: "customer",
			metadata: {
				created,
				updated,
				errors: errors.length,
			},
		});

		return {
			created,
			updated,
			processed: input.rows.length,
			errors,
		};
	});
