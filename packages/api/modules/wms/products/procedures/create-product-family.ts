import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const createProductFamily = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/product-families",
		tags: ["WMS", "Products"],
		summary: "Create a product family",
	})
	.input(
		z.object({
			organizationId: z.string(),
			name: z.string().min(1),
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

		const existing = await db.productFamily.findFirst({
			where: { organizationId: input.organizationId, name: input.name },
		});
		if (existing) {
			throw new ORPCError("CONFLICT", {
				message: `Product family "${input.name}" already exists in this organization.`,
			});
		}

		const family = await db.productFamily.create({
			data: {
				organizationId: input.organizationId,
				name: input.name,
				description: input.description,
			},
		});

		return { family };
	});
