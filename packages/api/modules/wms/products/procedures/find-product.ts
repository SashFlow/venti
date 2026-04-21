import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findProduct = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/products/{productId}",
		tags: ["WMS", "Products"],
		summary: "Find a product by ID with full detail",
	})
	.input(
		z.object({
			organizationId: z.string(),
			productId: z.string(),
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
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const product = await db.product.findFirst({
			where: {
				id: input.productId,
				organizationId: input.organizationId,
			},
			include: {
				variants: {
					include: { attributes: true },
					orderBy: { sku: "asc" },
				},
				attributes: { orderBy: { key: "asc" } },
				uomConversions: {
					include: {
						fromUom: true,
						toUom: true,
					},
				},
				model: {
					include: { family: true },
				},
				defaultUom: true,
			},
		});

		if (!product)
			throw new ORPCError("NOT_FOUND", { message: "Product not found." });

		return { product };
	});
