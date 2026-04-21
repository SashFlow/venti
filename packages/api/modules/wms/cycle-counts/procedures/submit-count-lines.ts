import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const submitCountLines = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/cycle-counts/{cycleCountId}/lines",
		tags: ["WMS", "CycleCounts"],
		summary: "Submit counted quantities for cycle count lines",
	})
	.input(
		z.object({
			organizationId: z.string(),
			cycleCountId: z.string(),
			lines: z.array(
				z.object({
					lineId: z.string(),
					countedQty: z.number().min(0),
				}),
			),
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

		const cycleCount = await db.cycleCount.findUnique({
			where: { id: input.cycleCountId },
		});

		if (!cycleCount || cycleCount.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Cycle count not found");
		}

		if (cycleCount.status !== "IN_PROGRESS") {
			throw new ORPCError(
				"CONFLICT",
				`Lines can only be submitted when cycle count is IN_PROGRESS (current: ${cycleCount.status})`,
			);
		}

		const updatedLines = await db.$transaction(async (tx) => {
			return Promise.all(
				input.lines.map(async ({ lineId, countedQty }) => {
					// Fetch the line to get expectedQty and verify ownership
					const line = await tx.cycleCountLine.findUnique({
						where: { id: lineId },
					});

					if (!line || line.cycleCountId !== input.cycleCountId) {
						throw new ORPCError(
							"NOT_FOUND",
							`Cycle count line ${lineId} not found on this cycle count`,
						);
					}

					const expectedQty = parseFloat(line.expectedQty.toString());
					const variance = countedQty - expectedQty;

					return tx.cycleCountLine.update({
						where: { id: lineId },
						data: {
							countedQty,
							variance,
						},
					});
				}),
			);
		});

		return { lines: updatedLines };
	});
