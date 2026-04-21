import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findCycleCount = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/cycle-counts/{cycleCountId}",
		tags: ["WMS", "CycleCounts"],
		summary: "Get a cycle count by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			cycleCountId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const cycleCount = await db.cycleCount.findUnique({
			where: { id: input.cycleCountId },
			include: {
				lines: {
					include: {
						cycleCount: false,
					},
				},
			},
		});

		if (!cycleCount || cycleCount.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Cycle count not found");
		}

		return { cycleCount };
	});
