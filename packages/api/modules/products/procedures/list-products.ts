import { listProducts } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const listProductsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/products",
		tags: ["Products"],
		summary: "List Products",
		description: "List and search products in an organization.",
	})
	.input(
		z.object({
			organizationId: z.string(),
			query: z.string().optional(),
			limit: z.number().min(1).max(100).default(50),
			offset: z.number().min(0).default(0),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const { products, total } = await listProducts({
			organizationId: input.organizationId,
			query: input.query,
			limit: input.limit,
			offset: input.offset,
		});

		return {
			products,
			total,
		};
	});
