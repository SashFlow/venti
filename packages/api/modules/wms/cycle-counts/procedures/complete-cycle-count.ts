import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const completeCycleCount = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/cycle-counts/{cycleCountId}/complete",
		tags: ["WMS", "CycleCounts"],
		summary: "Complete a cycle count and create adjustments for variances",
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

		const cycleCount = await db.cycleCount.findUnique({
			where: { id: input.cycleCountId },
			include: { lines: true },
		});

		if (!cycleCount || cycleCount.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Cycle count not found");
		}

		if (cycleCount.status !== "IN_PROGRESS") {
			throw new ORPCError(
				"CONFLICT",
				`Cycle count cannot be completed (current status: ${cycleCount.status})`,
			);
		}

		// Verify all lines have countedQty set
		const uncountedLines = cycleCount.lines.filter(
			(l) => l.countedQty === null || l.countedQty === undefined,
		);
		if (uncountedLines.length > 0) {
			throw new ORPCError(
				"CONFLICT",
				`${uncountedLines.length} line(s) have not been counted yet`,
			);
		}

		const { updatedCycleCount, adjustmentsCreated } = await db.$transaction(
			async (tx) => {
				let adjCount = 0;

				for (const line of cycleCount.lines) {
					const variance =
						line.variance !== null
							? parseFloat(line.variance.toString())
							: 0;

					if (variance === 0) continue;

					const adjNumber = await generateDocNumber(tx, {
						organizationId: input.organizationId,
						prefix: "ADJ",
						countFn: () =>
							tx.stockAdjustment.count({
								where: { organizationId: input.organizationId },
							}),
					});

					await tx.stockAdjustment.create({
						data: {
							organizationId: input.organizationId,
							warehouseId: cycleCount.warehouseId,
							variantId: line.variantId,
							binId: line.binId,
							adjNumber,
							qty: variance,
							reasonCode: "CYCLE_COUNT_VARIANCE",
							status: "PENDING_APPROVAL",
							requestedById: context.user.id,
							notes: `Auto-created from cycle count ${cycleCount.countNumber}`,
						},
					});

					await tx.cycleCountLine.update({
						where: { id: line.id },
						data: { disposition: "ADJUSTMENT_CREATED" },
					});

					adjCount++;
				}

				const updated = await tx.cycleCount.update({
					where: { id: input.cycleCountId },
					data: {
						status: "COMPLETED",
						completedAt: new Date(),
					},
					include: { lines: true },
				});

				return { updatedCycleCount: updated, adjustmentsCreated: adjCount };
			},
		);

		return { cycleCount: updatedCycleCount, adjustmentsCreated };
	});
