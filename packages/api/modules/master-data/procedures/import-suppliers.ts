import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const supplierImportRowSchema = z.object({
	name: z.string().trim().min(1).max(255),
	prefix: z.string().trim().max(50).optional(),
	email: z.string().trim().email().max(255).optional(),
	phone: z.string().trim().max(50).optional(),
	accountNumber: z.string().trim().max(100).optional(),
	representativeName: z.string().trim().max(255).optional(),
	brands: z.string().trim().optional(),
	notes: z.string().trim().optional(),
	address1: z.string().trim().optional(),
	address2: z.string().trim().optional(),
	city: z.string().trim().optional(),
	state: z.string().trim().optional(),
	zip: z.string().trim().optional(),
	country: z.string().trim().optional(),
});

const importSuppliersInput = z.object({
	organizationId: z.string(),
	rows: z.array(supplierImportRowSchema).min(1).max(1000),
});

function normalizeCode(name: string, prefix?: string) {
	const explicitPrefix = prefix?.trim();
	if (explicitPrefix) {
		return explicitPrefix.toUpperCase().slice(0, 50);
	}

	const fromName = name
		.replace(/[^a-zA-Z0-9]/g, "")
		.toUpperCase()
		.slice(0, 8);
	if (fromName) {
		return fromName;
	}

	return `SUP${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const importSuppliersProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/master-data/suppliers/import",
		tags: ["Master Data"],
		summary: "Import suppliers",
		description: "Bulk import suppliers by creating or updating rows.",
	})
	.input(importSuppliersInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		let created = 0;
		let updated = 0;
		const errors: Array<{ index: number; message: string }> = [];

		for (const [index, row] of input.rows.entries()) {
			try {
				const code = normalizeCode(row.name, row.prefix);
				const metadata: Prisma.InputJsonValue = {
					accountNumber: row.accountNumber,
					representativeName: row.representativeName,
					brands: row.brands,
					notes: row.notes,
					address1: row.address1,
					address2: row.address2,
					city: row.city,
					state: row.state,
					zip: row.zip,
					country: row.country,
				};

				const existing = await db.supplier.findFirst({
					where: {
						organizationId: input.organizationId,
						code,
					},
					select: { id: true },
				});

				if (existing) {
					await db.supplier.update({
						where: { id: existing.id },
						data: {
							name: row.name,
							email: row.email,
							phone: row.phone,
							metadata,
						},
					});
					updated += 1;
				} else {
					await db.supplier.create({
						data: {
							organizationId: input.organizationId,
							code,
							name: row.name,
							email: row.email,
							phone: row.phone,
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
				message: "No suppliers were imported.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "supplier.import",
			resource: "supplier",
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
