import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listProductFamilies = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/product-families",
		tags: ["WMS", "Products"],
		summary: "List product families",
	})
	.input(
		z.object({
			organizationId: z.string(),
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

		const families = await db.productFamily.findMany({
			where: { organizationId: input.organizationId },
			orderBy: { name: "asc" },
			include: {
				_count: { select: { models: true } },
			},
		});

		return { families };
	});
