import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const updateProductFamily = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/product-families/{familyId}",
		tags: ["WMS", "Products"],
		summary: "Update a product family",
	})
	.input(
		z.object({
			organizationId: z.string(),
			familyId: z.string(),
			name: z.string().min(1).optional(),
			description: z.string().optional(),
			active: z.boolean().optional(),
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

		const existing = await db.productFamily.findFirst({
			where: { id: input.familyId, organizationId: input.organizationId },
		});
		if (!existing) {
			throw new ORPCError("NOT_FOUND", {
				message: "Product family not found.",
			});
		}

		const { organizationId, familyId, ...data } = input;

		const family = await db.productFamily.update({
			where: { id: familyId },
			data,
		});

		return { family };
	});
