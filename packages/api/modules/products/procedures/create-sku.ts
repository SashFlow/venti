import { ORPCError } from "@orpc/server";
import type { Prisma } from "@repo/database/prisma/generated/client";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createSKU } from "../services/products-service";

const createSKUInput = z.object({
	organizationId: z.string(),
	skuCode: z.string().trim().min(1).max(100),
	name: z.string().trim().min(1).max(255),
	description: z.string().trim().optional(),
	lifecycle: z.enum(["ACTIVE", "DISCONTINUED", "OBSOLETE"]).default("ACTIVE"),
	gtin: z.string().trim().max(50).optional(),
	uomId: z.string().optional(),
	categoryId: z.string().optional(),
	widthMm: z.number().positive().optional(),
	lengthMm: z.number().positive().optional(),
	heightMm: z.number().positive().optional(),
	weightKg: z.number().positive().optional(),
	reorderPoint: z.number().min(0).optional(),
	minStock: z.number().min(0).optional(),
	maxStock: z.number().min(0).optional(),
	serialTracking: z.boolean().default(false),
	batchTracking: z.boolean().default(false),
	expiryTracking: z.boolean().default(false),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createSKUProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/products",
		tags: ["Products"],
		summary: "Create SKU",
		description: "Create a SKU under an organization.",
	})
	.input(createSKUInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const sku = await createSKU({
				organizationId: input.organizationId,
				data: {
					skuCode: input.skuCode,
					name: input.name,
					description: input.description,
					lifecycle: input.lifecycle,
					gtin: input.gtin,
					uomId: input.uomId,
					categoryId: input.categoryId,
					widthMm: input.widthMm,
					lengthMm: input.lengthMm,
					heightMm: input.heightMm,
					weightKg: input.weightKg,
					reorderPoint: input.reorderPoint,
					minStock: input.minStock,
					maxStock: input.maxStock,
					serialTracking: input.serialTracking,
					batchTracking: input.batchTracking,
					expiryTracking: input.expiryTracking,
					metadata: input.metadata as
						| Prisma.InputJsonValue
						| undefined,
				},
			});

			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "sku.create",
				resource: "sku",
				resourceId: sku.id,
				metadata: {
					skuCode: sku.skuCode,
					name: sku.name,
				},
			});

			return { sku };
		} catch {
			throw new ORPCError("BAD_REQUEST", {
				message: "Could not create SKU.",
			});
		}
	});
