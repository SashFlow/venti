import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listVariants = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/products/{productId}/variants",
		tags: ["WMS", "Products"],
		summary: "List variants for a product",
	})
	.input(
		z.object({
			organizationId: z.string(),
			productId: z.string(),
			weightClass: z
				.enum(["LIGHT", "HEAVY"] as [string, ...string[]])
				.optional(),
			status: z
				.enum(["ACTIVE", "INACTIVE", "DISCONTINUED"] as [
					string,
					...string[],
				])
				.optional(),
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
			select: { id: true },
		});
		if (!product) {
			throw new ORPCError("NOT_FOUND", { message: "Product not found." });
		}

		const variants = await db.productVariant.findMany({
			where: {
				productId: input.productId,
				organizationId: input.organizationId,
				...(input.weightClass
					? { weightClass: input.weightClass as any }
					: {}),
				...(input.status ? { status: input.status as any } : {}),
			},
			orderBy: { sku: "asc" },
			include: { attributes: true },
		});

		return { variants };
	});
