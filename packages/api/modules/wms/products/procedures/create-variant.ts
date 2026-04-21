import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const createVariant = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/products/{productId}/variants",
		tags: ["WMS", "Products"],
		summary: "Create a product variant",
	})
	.input(
		z.object({
			organizationId: z.string(),
			productId: z.string(),
			sku: z.string().min(1),
			name: z.string().min(1),
			status: z
				.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"] as [
					string,
					...string[],
				])
				.optional(),
			capacityKw: z.number().optional(),
			capacityBtu: z.number().optional(),
			starRating: z.number().int().min(1).max(5).optional(),
			region: z.string().optional(),
			refrigerantType: z.string().optional(),
			componentType: z.string().optional(),
			weightClass: z
				.enum(["LIGHT", "HEAVY"] as [string, ...string[]])
				.optional(),
			weightKg: z.number().optional(),
			storageConditions: z.string().optional(),
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
				WMS_ACTIONS.CREATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const product = await db.product.findFirst({
			where: {
				id: input.productId,
				organizationId: input.organizationId,
			},
		});
		if (!product) {
			throw new ORPCError("NOT_FOUND", {
				message:
					"Product not found or does not belong to this organization.",
			});
		}

		const existingSku = await db.productVariant.findFirst({
			where: { organizationId: input.organizationId, sku: input.sku },
		});
		if (existingSku) {
			throw new ORPCError("CONFLICT", {
				message: `Variant with SKU "${input.sku}" already exists in this organization.`,
			});
		}

		const variant = await db.productVariant.create({
			data: {
				organizationId: input.organizationId,
				productId: input.productId,
				sku: input.sku,
				name: input.name,
				status: input.status as any,
				capacityKw: input.capacityKw,
				capacityBtu: input.capacityBtu,
				starRating: input.starRating,
				region: input.region,
				refrigerantType: input.refrigerantType,
				componentType: input.componentType,
				weightClass: input.weightClass as any,
				weightKg: input.weightKg,
				storageConditions: input.storageConditions,
				metadata: input.metadata,
			},
		});

		return { variant };
	});
