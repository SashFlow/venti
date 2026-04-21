import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listReplenishmentRules = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/replenishment/rules",
		tags: ["WMS", "Replenishment"],
		summary: "List replenishment rules",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			variantId: z.string().optional(),
			ruleType: z.string().optional(),
			activeOnly: z.boolean().default(true),
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

		if (input.warehouseId) where.warehouseId = input.warehouseId;
		if (input.variantId) where.variantId = input.variantId;
		if (input.ruleType) where.ruleType = input.ruleType;
		if (input.activeOnly) where.active = true;

		const rules = await db.replenishmentRule.findMany({
			where,
			include: {
				warehouse: { select: { id: true, name: true } },
			},
			orderBy: { variantId: "asc" },
		});

		// Hydrate variant info (no Prisma relation on ReplenishmentRule)
		const variantIds = [...new Set(rules.map((r) => r.variantId))];
		const variants =
			variantIds.length > 0
				? await db.productVariant.findMany({
						where: { id: { in: variantIds } },
						select: { id: true, sku: true, name: true },
					})
				: [];
		const variantMap = new Map(variants.map((v) => [v.id, v]));

		const enriched = rules.map((r) => ({
			...r,
			variant: variantMap.get(r.variantId) ?? null,
		}));

		return { rules: enriched };
	});
