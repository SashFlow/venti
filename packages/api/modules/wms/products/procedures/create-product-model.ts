import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const createProductModel = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/product-models",
		tags: ["WMS", "Products"],
		summary: "Create a product model",
	})
	.input(
		z.object({
			organizationId: z.string(),
			familyId: z.string(),
			name: z.string().min(1),
			manufacturer: z.string().optional(),
			description: z.string().optional(),
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

		const family = await db.productFamily.findFirst({
			where: { id: input.familyId, organizationId: input.organizationId },
		});
		if (!family) {
			throw new ORPCError("NOT_FOUND", {
				message:
					"Product family not found or does not belong to this organization.",
			});
		}

		const model = await db.productModel.create({
			data: {
				familyId: input.familyId,
				name: input.name,
				manufacturer: input.manufacturer,
				description: input.description,
			},
		});

		return { model };
	});
