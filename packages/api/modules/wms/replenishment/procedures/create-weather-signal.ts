import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createWeatherSignal = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/replenishment/weather",
		tags: ["WMS", "Replenishment"],
		summary: "Create a weather demand signal",
	})
	.input(
		z.object({
			organizationId: z.string(),
			region: z.string().min(1),
			temperatureThreshold: z.number(),
			signalType: z.string().min(1),
			adjustmentFactor: z.number().positive(),
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
				WMS_ACTIONS.CREATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const signal = await db.weatherDemandSignal.create({
			data: {
				organizationId: input.organizationId,
				region: input.region,
				temperatureThreshold: input.temperatureThreshold,
				signalType: input.signalType,
				adjustmentFactor: input.adjustmentFactor,
				active: true,
				metadata: input.metadata,
			},
		});

		return { signal };
	});
