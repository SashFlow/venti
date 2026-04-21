import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const upsertProductAttributes = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/products/{productId}/attributes",
		tags: ["WMS", "Products"],
		summary: "Replace all attributes for a product",
	})
	.input(
		z.object({
			organizationId: z.string(),
			productId: z.string(),
			attributes: z.array(
				z.object({
					key: z.string().min(1),
					value: z.string(),
					unit: z.string().optional(),
				}),
			),
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

		const product = await db.product.findFirst({
			where: {
				id: input.productId,
				organizationId: input.organizationId,
			},
			select: { id: true },
		});
		if (!product) {
			throw new ORPCError("NOT_FOUND", {
				message:
					"Product not found or does not belong to this organization.",
			});
		}

		const attributes = await db.$transaction(async (tx) => {
			await tx.productAttribute.deleteMany({
				where: { productId: input.productId },
			});
			await tx.productAttribute.createMany({
				data: input.attributes.map((attr) => ({
					productId: input.productId,
					key: attr.key,
					value: attr.value,
					unit: attr.unit,
				})),
			});
			return tx.productAttribute.findMany({
				where: { productId: input.productId },
				orderBy: { key: "asc" },
			});
		});

		return { attributes };
	});
