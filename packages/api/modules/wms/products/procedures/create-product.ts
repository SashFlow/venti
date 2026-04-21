import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const createProduct = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/products",
		tags: ["WMS", "Products"],
		summary: "Create a product",
	})
	.input(
		z.object({
			organizationId: z.string(),
			modelId: z.string().optional(),
			sku: z.string().min(1),
			name: z.string().min(1),
			description: z.string().optional(),
			category: z.string().optional(),
			brand: z.string().optional(),
			defaultUomId: z.string(),
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
				WMS_ACTIONS.CREATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existingSku = await db.product.findFirst({
			where: { organizationId: input.organizationId, sku: input.sku },
		});
		if (existingSku) {
			throw new ORPCError("CONFLICT", {
				message: `Product with SKU "${input.sku}" already exists in this organization.`,
			});
		}

		const uom = await db.unitOfMeasure.findFirst({
			where: {
				id: input.defaultUomId,
				organizationId: input.organizationId,
			},
		});
		if (!uom) {
			throw new ORPCError("NOT_FOUND", {
				message:
					"Default UoM not found or does not belong to this organization.",
			});
		}

		if (input.modelId) {
			const model = await db.productModel.findFirst({
				where: {
					id: input.modelId,
					family: { organizationId: input.organizationId },
				},
			});
			if (!model) {
				throw new ORPCError("NOT_FOUND", {
					message:
						"Product model not found or does not belong to this organization.",
				});
			}
		}

		const product = await db.product.create({
			data: {
				organizationId: input.organizationId,
				modelId: input.modelId,
				sku: input.sku,
				name: input.name,
				description: input.description,
				category: input.category,
				brand: input.brand,
				defaultUomId: input.defaultUomId,
				reorderType: input.reorderType as any,
				isRefrigerant: input.isRefrigerant,
				isSerialized: input.isSerialized,
				isBatchTracked: input.isBatchTracked,
				hasExpiry: input.hasExpiry,
				metadata: input.metadata,
			},
		});

		return { product };
	});
