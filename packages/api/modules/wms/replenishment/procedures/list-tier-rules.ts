import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listTierRules = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/replenishment/tier-rules",
		tags: ["WMS", "Replenishment"],
		summary: "List tier replenishment rules",
	})
	.input(
		z.object({
			organizationId: z.string(),
			upstreamWarehouseId: z.string().optional(),
			downstreamWarehouseId: z.string().optional(),
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
				WMS_RESOURCES.REPLENISHMENT,
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const where: Record<string, unknown> = {
			organizationId: input.organizationId,
		};

		if (input.upstreamWarehouseId)
			where.upstreamWarehouseId = input.upstreamWarehouseId;
		if (input.downstreamWarehouseId)
			where.downstreamWarehouseId = input.downstreamWarehouseId;

		const rules = await db.tierReplenishmentRule.findMany({
			where,
			include: {
				upstreamWarehouse: { select: { id: true, name: true } },
				downstreamWarehouse: { select: { id: true, name: true } },
			},
			orderBy: { upstreamWarehouseId: "asc" },
		});

		return { rules };
	});
