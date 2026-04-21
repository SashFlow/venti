import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const upsertVariantAttributes = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/variants/{variantId}/attributes",
		tags: ["WMS", "Products"],
		summary: "Replace all attributes for a product variant",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string(),
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

		const variant = await db.productVariant.findFirst({
			where: {
				id: input.variantId,
				organizationId: input.organizationId,
			},
			select: { id: true },
		});
		if (!variant) {
			throw new ORPCError("NOT_FOUND", {
				message:
					"Variant not found or does not belong to this organization.",
			});
		}

		const attributes = await db.$transaction(async (tx) => {
			await tx.variantAttribute.deleteMany({
				where: { variantId: input.variantId },
			});
			await tx.variantAttribute.createMany({
				data: input.attributes.map((attr) => ({
					variantId: input.variantId,
					key: attr.key,
					value: attr.value,
					unit: attr.unit,
				})),
			});
			return tx.variantAttribute.findMany({
				where: { variantId: input.variantId },
				orderBy: { key: "asc" },
			});
		});

		return { attributes };
	});
