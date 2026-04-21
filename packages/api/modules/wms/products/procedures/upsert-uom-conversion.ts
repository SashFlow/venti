import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const upsertUomConversion = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/uom-conversions",
		tags: ["WMS", "Products"],
		summary: "Upsert a UoM conversion factor for a product",
	})
	.input(
		z.object({
			organizationId: z.string(),
			productId: z.string(),
			fromUomId: z.string(),
			toUomId: z.string(),
			factor: z.number().positive(),
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

		const conversion = await db.uoMConversion.upsert({
			where: {
				productId_fromUomId_toUomId: {
					productId: input.productId,
					fromUomId: input.fromUomId,
					toUomId: input.toUomId,
				},
			},
			create: {
				productId: input.productId,
				fromUomId: input.fromUomId,
				toUomId: input.toUomId,
				factor: input.factor,
			},
			update: {
				factor: input.factor,
			},
			include: {
				fromUom: true,
				toUom: true,
			},
		});

		return { conversion };
	});
