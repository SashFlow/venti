import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listWeatherSignals = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/replenishment/weather",
		tags: ["WMS", "Replenishment"],
		summary: "List weather demand signals",
	})
	.input(
		z.object({
			organizationId: z.string(),
			region: z.string().optional(),
			activeOnly: z.boolean().optional(),
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

		if (input.region) where.region = input.region;
		if (input.activeOnly) where.active = true;

		const signals = await db.weatherDemandSignal.findMany({
			where,
			orderBy: { region: "asc" },
		});

		return { signals };
	});
