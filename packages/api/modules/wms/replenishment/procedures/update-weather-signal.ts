import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const updateWeatherSignal = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/replenishment/weather/{id}",
		tags: ["WMS", "Replenishment"],
		summary: "Update a weather demand signal",
	})
	.input(
		z.object({
			organizationId: z.string(),
			signalId: z.string(),
			region: z.string().min(1).optional(),
			temperatureThreshold: z.number().optional(),
			signalType: z.string().min(1).optional(),
			adjustmentFactor: z.number().positive().optional(),
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

		const existing = await db.weatherDemandSignal.findFirst({
			where: {
				id: input.signalId,
				organizationId: input.organizationId,
			},
			select: { id: true },
		});

		if (!existing)
			throw new ORPCError("NOT_FOUND", { message: "Weather demand signal not found" });

		const signal = await db.weatherDemandSignal.update({
			where: { id: input.signalId },
			data: {
				...(input.region !== undefined && { region: input.region }),
				...(input.temperatureThreshold !== undefined && {
					temperatureThreshold: input.temperatureThreshold,
				}),
				...(input.signalType !== undefined && {
					signalType: input.signalType,
				}),
				...(input.adjustmentFactor !== undefined && {
					adjustmentFactor: input.adjustmentFactor,
				}),
				...(input.active !== undefined && { active: input.active }),
				...(input.metadata !== undefined && { metadata: input.metadata }),
			},
		});

		return { signal };
	});
