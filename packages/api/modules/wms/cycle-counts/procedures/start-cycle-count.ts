import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const startCycleCount = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/cycle-counts/{cycleCountId}/start",
		tags: ["WMS", "CycleCounts"],
		summary: "Start a scheduled cycle count",
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
				WMS_ACTIONS.COUNT,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.cycleCount.findUnique({
			where: { id: input.cycleCountId },
		});

		if (!existing || existing.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Cycle count not found");
		}

		if (existing.status !== "SCHEDULED") {
			throw new ORPCError(
				"CONFLICT",
				`Cycle count cannot be started (current status: ${existing.status})`,
			);
		}

		const cycleCount = await db.cycleCount.update({
			where: { id: input.cycleCountId },
			data: {
				status: "IN_PROGRESS",
				startedAt: new Date(),
				countedById: context.user.id,
			},
			include: {
				lines: true,
			},
		});

		return { cycleCount };
	});
