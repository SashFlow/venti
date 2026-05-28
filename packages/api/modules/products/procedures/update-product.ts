import { updateProduct } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const updateProductProcedure = protectedProcedure
	.route({
		method: "PUT",
		path: "/products/{id}",
		tags: ["Products"],
		summary: "Update Product",
		description: "Update a product and its SKUs.",
	})
	.input(
		z.object({
			organizationId: z.string(),
			id: z.string(),
			name: z.string().min(1),
			description: z.string().optional(),
			isPerishable: z.boolean().optional(),
			isBatchTracked: z.boolean().optional(),
			isSerialTracked: z.boolean().optional(),
			life: z.number().optional(),
			skus: z
				.array(
					z.object({
						id: z.string().optional(),
						code: z.string().min(1),
						unitPrice: z.number().optional(),
						length: z.number().optional(),
						width: z.number().optional(),
						height: z.number().optional(),
						weight: z.number().optional(),
						metadata: z.record(z.string(), z.string()).optional(),
					}),
				)
				.min(1),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const updatedProduct = await updateProduct({
			organizationId: input.organizationId,
			id: input.id,
			data: {
				name: input.name,
				description: input.description,
				isPerishable: input.isPerishable,
				isBatchTracked: input.isBatchTracked,
				isSerialTracked: input.isSerialTracked,
			},
			skus: input.skus.map((s) => ({
				id: s.id,
				code: s.code,
				price: s.unitPrice,
				length: s.length,
				width: s.width,
				height: s.height,
				weight: s.weight,
				metadata: s.metadata,
			})),
		});

		return updatedProduct;
	});
