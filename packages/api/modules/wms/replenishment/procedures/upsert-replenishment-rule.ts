import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const upsertReplenishmentRule = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/replenishment/rules",
		tags: ["WMS", "Replenishment"],
		summary: "Upsert a replenishment rule",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string(),
			warehouseId: z.string(),
			supplierId: z.string().optional(),
			ruleType: z
				.enum(["MIN_MAX", "MTO", "SEASONAL", "MULTI_TIER"])
				.optional(),
			minQty: z.number().optional(),
			maxQty: z.number().optional(),
			reorderPoint: z.number().optional(),
			reorderQty: z.number().optional(),
			leadTimeDays: z.number().int().optional(),
			active: z.boolean().optional(),
			metadata: z.record(z.unknown()).optional(),
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
				WMS_ACTIONS.UPDATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Verify variant belongs to org
		const variant = await db.productVariant.findFirst({
			where: { id: input.variantId, organizationId: input.organizationId },
			select: { id: true },
		});
		if (!variant)
			throw new ORPCError("NOT_FOUND", { message: "Variant not found" });

		// Verify warehouse belongs to org
		const warehouse = await db.warehouse.findFirst({
			where: { id: input.warehouseId, organizationId: input.organizationId },
			select: { id: true },
		});
		if (!warehouse)
			throw new ORPCError("NOT_FOUND", { message: "Warehouse not found" });

		const rule = await db.replenishmentRule.upsert({
			where: {
				organizationId_variantId_warehouseId: {
					organizationId: input.organizationId,
					variantId: input.variantId,
					warehouseId: input.warehouseId,
				},
			},
			create: {
				organizationId: input.organizationId,
				variantId: input.variantId,
				warehouseId: input.warehouseId,
				supplierId: input.supplierId,
				ruleType: input.ruleType ?? "MIN_MAX",
				minQty: input.minQty,
				maxQty: input.maxQty,
				reorderPoint: input.reorderPoint,
				reorderQty: input.reorderQty,
				leadTimeDays: input.leadTimeDays,
				active: input.active ?? true,
				metadata: input.metadata,
			},
			update: {
				...(input.supplierId !== undefined && {
					supplierId: input.supplierId,
				}),
				...(input.ruleType !== undefined && { ruleType: input.ruleType }),
				...(input.minQty !== undefined && { minQty: input.minQty }),
				...(input.maxQty !== undefined && { maxQty: input.maxQty }),
				...(input.reorderPoint !== undefined && {
					reorderPoint: input.reorderPoint,
				}),
				...(input.reorderQty !== undefined && {
					reorderQty: input.reorderQty,
				}),
				...(input.leadTimeDays !== undefined && {
					leadTimeDays: input.leadTimeDays,
				}),
				...(input.active !== undefined && { active: input.active }),
				...(input.metadata !== undefined && { metadata: input.metadata }),
			},
		});

		return { rule };
	});
