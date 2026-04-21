import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listProducts = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/products",
		tags: ["WMS", "Products"],
		summary: "List products with faceted search",
	})
	.input(
		z.object({
			organizationId: z.string(),
			query: z.string().optional(),
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
			limit: z.number().int().min(1).max(100).default(25),
			offset: z.number().int().min(0).default(0),
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

		const where: Record<string, unknown> = {
			organizationId: input.organizationId,
		};

		if (input.status) where.status = input.status;
		if (input.reorderType) where.reorderType = input.reorderType;
		if (input.category) where.category = input.category;
		if (input.brand) where.brand = input.brand;

		if (input.query) {
			where.OR = [
				{ name: { contains: input.query, mode: "insensitive" } },
				{ sku: { contains: input.query, mode: "insensitive" } },
				{ brand: { contains: input.query, mode: "insensitive" } },
			];
		}

		const [products, total] = await Promise.all([
			db.product.findMany({
				where: where as any,
				orderBy: { name: "asc" },
				take: input.limit,
				skip: input.offset,
				include: {
					_count: { select: { variants: true } },
					defaultUom: true,
				},
			}),
			db.product.count({ where: where as any }),
		]);

		return { products, total };
	});
