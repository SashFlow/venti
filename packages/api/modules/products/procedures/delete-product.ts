import { deleteProduct } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const deleteProductProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/products/{id}",
		tags: ["Products"],
		summary: "Delete Product",
		description: "Delete a product.",
	})
	.input(
		z.object({
			organizationId: z.string(),
			id: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const success = await deleteProduct({
			organizationId: input.organizationId,
			id: input.id,
		});

		return { success };
	});
