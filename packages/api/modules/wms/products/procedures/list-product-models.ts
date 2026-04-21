import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listProductModels = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/product-models",
		tags: ["WMS", "Products"],
		summary: "List product models",
	})
	.input(
		z.object({
			organizationId: z.string(),
			familyId: z.string().optional(),
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

		const models = await db.productModel.findMany({
			where: {
				family: { organizationId: input.organizationId },
				...(input.familyId ? { familyId: input.familyId } : {}),
			},
			orderBy: { name: "asc" },
			include: {
				family: { select: { id: true, name: true } },
				_count: { select: { products: true } },
			},
		});

		return { models };
	});
