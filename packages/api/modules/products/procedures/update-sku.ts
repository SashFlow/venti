import { ORPCError } from "@orpc/server";
import { updateSKU } from "@repo/database";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const updateSKUInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	code: z.string().trim().min(1).max(100).optional(),
	name: z.string().trim().min(1).max(255).optional(),
	description: z.string().trim().optional(),
	lifecycle: z.enum(["ACTIVE", "DISCONTINUED", "OBSOLETE"]).optional(),
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
	serialTracking: z.boolean().optional(),
	batchTracking: z.boolean().optional(),
	expiryTracking: z.boolean().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateSKUProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/products/{id}",
		tags: ["Products"],
		summary: "Update SKU",
		description: "Update SKU fields for an organization.",
	})
	.input(updateSKUInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const sku = await updateSKU({
			organizationId: input.organizationId,
			id: input.id,
			data: {
				productId: "default",
				code: input.code,
				name: input.name,
				barcode: input.gtin,
				baseUomId: input.uomId,
				width: input.widthMm,
				length: input.lengthMm,
				height: input.heightMm,
				weight: input.weightKg,
			},
		});
		if (!sku) {
			throw new ORPCError("NOT_FOUND", {
				message: "SKU not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "sku.update",
			resource: "sku",
			resourceId: sku.id,
			metadata: {
				code: sku.code,
				name: sku.name,
			},
		});

		return { sku };
	});
