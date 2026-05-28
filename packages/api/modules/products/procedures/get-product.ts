import { getProductById } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const getProductProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/products/{id}",
		tags: ["Products"],
		summary: "Get Product",
		description: "Get product details by ID.",
	})
	.input(
		z.object({
			organizationId: z.string(),
			id: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const product = await getProductById({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!product) {
			throw new Error("Product not found");
		}

		return product;
	});
