import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const upsertSeasonalPlan = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/replenishment/seasonal",
		tags: ["WMS", "Replenishment"],
		summary: "Upsert a seasonal demand plan",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string(),
			warehouseId: z.string().optional(),
			year: z.number().int().min(2000).max(2100),
			phase: z.enum(["PRE_SEASON", "PEAK", "POST_SEASON"]),
			targetQty: z.number().positive(),
			startDate: z.string().datetime(),
			endDate: z.string().datetime(),
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

		// No @unique constraint on [organizationId, variantId, year, phase]
		// so we use findFirst + update/create pattern
		const existing = await db.seasonalDemandPlan.findFirst({
			where: {
				organizationId: input.organizationId,
				variantId: input.variantId,
				year: input.year,
				phase: input.phase,
			},
		});

		const data = {
			organizationId: input.organizationId,
			variantId: input.variantId,
			warehouseId: input.warehouseId,
			year: input.year,
			phase: input.phase,
			targetQty: input.targetQty,
			startDate: new Date(input.startDate),
			endDate: new Date(input.endDate),
		};

		const plan = existing
			? await db.seasonalDemandPlan.update({
					where: { id: existing.id },
					data: {
						warehouseId: data.warehouseId,
						targetQty: data.targetQty,
						startDate: data.startDate,
						endDate: data.endDate,
					},
				})
			: await db.seasonalDemandPlan.create({ data });

		return { plan };
	});
