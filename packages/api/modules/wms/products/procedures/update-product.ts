import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const updateProduct = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/products/{productId}",
		tags: ["WMS", "Products"],
		summary: "Update a product",
	})
	.input(
		z.object({
			organizationId: z.string(),
			productId: z.string(),
			name: z.string().min(1).optional(),
			description: z.string().optional(),
			category: z.string().optional(),
			brand: z.string().optional(),
			status: z
				.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"] as [
					string,
					...string[],
				])
				.optional(),
			reorderType: z
				.enum(["MIN_MAX", "MTO", "SEASONAL", "MULTI_TIER"] as [
					string,
					...string[],
				])
				.optional(),
			isRefrigerant: z.boolean().optional(),
			isSerialized: z.boolean().optional(),
			isBatchTracked: z.boolean().optional(),
			hasExpiry: z.boolean().optional(),
			metadata: z.record(z.unknown()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.PRODUCT,
				WMS_ACTIONS.UPDATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.product.findFirst({
			where: {
				id: input.productId,
				organizationId: input.organizationId,
			},
		});
		if (!existing)
			throw new ORPCError("NOT_FOUND", { message: "Product not found." });

		const { organizationId, productId, ...data } = input;

		const product = await db.product.update({
			where: { id: productId },
			data: data as any,
		});

		return { product };
	});
