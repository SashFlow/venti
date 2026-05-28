import { ORPCError } from "@orpc/server";
import { createProduct } from "@repo/database";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const createProductInput = z.object({
	organizationId: z.string(),
	name: z.string().trim().min(1).max(255),
	code: z.string().trim().min(1).max(100),
	description: z.string().trim().optional(),
	isPerishable: z.boolean().default(false),
	isBatchTracked: z.boolean().default(false),
	isSerialTracked: z.boolean().default(false),
	skus: z.array(z.object({
		code: z.string().trim().min(1, "SKU code is required").max(100),
		baseUomId: z.string(),
		price: z.number().positive().optional(),
		length: z.number().positive().optional(),
		width: z.number().positive().optional(),
		height: z.number().positive().optional(),
		weight: z.number().positive().optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
	})).min(1, "At least one variant is required"),
});

export const createProductProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/products",
		tags: ["Products"],
		summary: "Create Product",
		description: "Create a Product with variants.",
	})
	.input(createProductInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const product = await createProduct({
				organizationId: input.organizationId,
				data: {
					code: input.code,
					name: input.name,
					description: input.description,
					isPerishable: input.isPerishable,
					isBatchTracked: input.isBatchTracked,
					isSerialTracked: input.isSerialTracked,
				},
				skus: input.skus.map(sku => ({
					code: sku.code,
					baseUomId: sku.baseUomId,
					price: sku.price,
					length: sku.length,
					width: sku.width,
					height: sku.height,
					weight: sku.weight,
					metadata: sku.metadata as any,
				})),
			});
			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "product.create",
				resource: "product",
				resourceId: product.id,
				metadata: {
					code: product.code,
					name: product.name,
				},
			});

			return { product };
		} catch (error) {
			console.error(error);
			throw new ORPCError("BAD_REQUEST", {
				message: "Could not create Product.",
			});
		}
	});
