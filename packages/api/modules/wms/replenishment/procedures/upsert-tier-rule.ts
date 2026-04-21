import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const upsertTierRule = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/replenishment/tier-rules",
		tags: ["WMS", "Replenishment"],
		summary: "Upsert a tier replenishment rule",
	})
	.input(
		z.object({
			organizationId: z.string(),
			upstreamWarehouseId: z.string(),
			downstreamWarehouseId: z.string(),
			variantId: z.string().optional(),
			triggerQty: z.number().positive().optional(),
			replenishQty: z.number().positive().optional(),
			autoApprove: z.boolean().optional(),
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
				WMS_RESOURCES.REPLENISHMENT,
				WMS_ACTIONS.UPDATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Verify both warehouses belong to org
		const [upstream, downstream] = await Promise.all([
			db.warehouse.findFirst({
				where: {
					id: input.upstreamWarehouseId,
					organizationId: input.organizationId,
				},
				select: { id: true },
			}),
			db.warehouse.findFirst({
				where: {
					id: input.downstreamWarehouseId,
					organizationId: input.organizationId,
				},
				select: { id: true },
			}),
		]);

		if (!upstream)
			throw new ORPCError("NOT_FOUND", {
				message: "Upstream warehouse not found",
			});
		if (!downstream)
			throw new ORPCError("NOT_FOUND", {
				message: "Downstream warehouse not found",
			});

		// No @unique constraint — findFirst + update/create pattern
		const existing = await db.tierReplenishmentRule.findFirst({
			where: {
				organizationId: input.organizationId,
				upstreamWarehouseId: input.upstreamWarehouseId,
				downstreamWarehouseId: input.downstreamWarehouseId,
				variantId: input.variantId ?? null,
			},
		});

		const sharedData = {
			triggerQty: input.triggerQty,
			replenishQty: input.replenishQty,
			autoApprove: input.autoApprove ?? false,
			active: input.active ?? true,
		};

		const rule = existing
			? await db.tierReplenishmentRule.update({
					where: { id: existing.id },
					data: {
						...(input.triggerQty !== undefined && {
							triggerQty: input.triggerQty,
						}),
						...(input.replenishQty !== undefined && {
							replenishQty: input.replenishQty,
						}),
						...(input.autoApprove !== undefined && {
							autoApprove: input.autoApprove,
						}),
						...(input.active !== undefined && { active: input.active }),
					},
					include: {
						upstreamWarehouse: { select: { id: true, name: true } },
						downstreamWarehouse: { select: { id: true, name: true } },
					},
				})
			: await db.tierReplenishmentRule.create({
					data: {
						organizationId: input.organizationId,
						upstreamWarehouseId: input.upstreamWarehouseId,
						downstreamWarehouseId: input.downstreamWarehouseId,
						variantId: input.variantId,
						...sharedData,
					},
					include: {
						upstreamWarehouse: { select: { id: true, name: true } },
						downstreamWarehouse: { select: { id: true, name: true } },
					},
				});

		return { rule };
	});
