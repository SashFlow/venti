import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { depleteStock, updateProductCost } from "../../lib/cost-layer";
import { adjustStockLevel, recordMovement } from "../../lib/stock-ledger";

export const completePickJob = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/picking/jobs/{pickJobId}/complete",
		tags: ["WMS", "Picking"],
		summary: "Complete a pick job — depletes stock and creates packing slip",
	})
	.input(
		z.object({
			organizationId: z.string(),
			pickJobId: z.string(),
			lines: z.array(
				z.object({
					lineId: z.string(),
					qtyPicked: z.number().min(0),
					batchLotId: z.string().optional(),
					serialNumberId: z.string().optional(),
					exceptionReason: z.string().optional(),
				}),
			),
		}),
	)
	.handler(async ({ input, context }) => {
		// Auth guard before any DB writes
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
				WMS_RESOURCES.PICKING,
				WMS_ACTIONS.PICK,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const { pickJob, packingSlip } = await db.$transaction(async (tx) => {
			// 1. Fetch and verify pick job
			const job = await tx.pickJob.findUnique({
				where: { id: input.pickJobId },
				include: { lines: true },
			});

			if (!job || job.organizationId !== input.organizationId) {
				throw new ORPCError("NOT_FOUND", "Pick job not found");
			}

			if (job.status !== "IN_PROGRESS") {
				throw new ORPCError(
					"CONFLICT",
					`Pick job cannot be completed (current status: ${job.status})`,
				);
			}

			const warehouseId = job.warehouseId;

			// Build a map of existing lines for fast lookup
			const lineMap = new Map(job.lines.map((l) => [l.id, l]));

			// Collect data for shipment lines
			const shipmentLinesData: {
				variantId: string;
				qty: number;
				batchLotId?: string;
				serialNumberId?: string;
			}[] = [];

			// 3. Process each input line
			for (const inputLine of input.lines) {
				const line = lineMap.get(inputLine.lineId);
				if (!line || line.pickJobId !== input.pickJobId) {
					throw new ORPCError(
						"NOT_FOUND",
						`Pick job line ${inputLine.lineId} not found on this job`,
					);
				}

				const qtyToPick = Number(line.qtyToPick);
				if (inputLine.qtyPicked > qtyToPick) {
					throw new ORPCError(
						"CONFLICT",
						`qtyPicked (${inputLine.qtyPicked}) exceeds qtyToPick (${qtyToPick}) for line ${inputLine.lineId}`,
					);
				}

				if (inputLine.qtyPicked === 0) {
					// Exception line — record reason but skip stock operations
					await tx.pickJobLine.update({
						where: { id: inputLine.lineId },
						data: {
							qtyPicked: 0,
							exceptionReason: inputLine.exceptionReason,
						},
					});
					continue;
				}

				const qtyPicked = inputLine.qtyPicked;

				// 3c. Deplete FIFO cost layers
				const { avgCostPerUnit } = await depleteStock(tx, {
					organizationId: input.organizationId,
					variantId: line.variantId,
					warehouseId,
					qty: qtyPicked,
				});

				// 3d. Record stock movement (negative qty = outbound)
				await recordMovement(tx, {
					organizationId: input.organizationId,
					movementType: "PICK",
					qty: -qtyPicked,
					warehouseId,
					binId: line.binId,
					variantId: line.variantId,
					costPerUnit: avgCostPerUnit,
					referenceType: "PICK_JOB",
					referenceId: input.pickJobId,
					batchLotId: inputLine.batchLotId,
					serialNumberId: inputLine.serialNumberId,
					performedById: context.user.id,
				});

				// 3e. Adjust stock level — reduce onHand and release reservation simultaneously
				await adjustStockLevel(tx, {
					organizationId: input.organizationId,
					warehouseId,
					binId: line.binId,
					variantId: line.variantId,
					qtyDelta: -qtyPicked,
					qtyReservedDelta: -qtyPicked,
				});

				// 3f. Recompute running average product cost
				await updateProductCost(tx, {
					organizationId: input.organizationId,
					variantId: line.variantId,
					warehouseId,
				});

				// 3g. Update pick job line with actuals
				await tx.pickJobLine.update({
					where: { id: inputLine.lineId },
					data: {
						qtyPicked,
						batchLotId: inputLine.batchLotId,
						serialNumberId: inputLine.serialNumberId,
						exceptionReason: inputLine.exceptionReason,
					},
				});

				// 3h. Mark serial number as DISPATCHED if provided
				if (inputLine.serialNumberId) {
					await tx.serialNumber.update({
						where: { id: inputLine.serialNumberId },
						data: { status: "DISPATCHED" },
					});
				}

				shipmentLinesData.push({
					variantId: line.variantId,
					qty: qtyPicked,
					batchLotId: inputLine.batchLotId,
					serialNumberId: inputLine.serialNumberId,
				});
			}

			// 4. Mark pick job as COMPLETED
			const completedJob = await tx.pickJob.update({
				where: { id: input.pickJobId },
				data: {
					status: "COMPLETED",
					completedAt: new Date(),
				},
				include: {
					lines: true,
					picker: { select: { name: true } },
				},
			});

			// 5/6. Generate packing slip — number derived from pick job number
			const slipNumber = `PS-${completedJob.pickJobNumber}`;

			// 7. Create PackingSlip + ShipmentLines in one nested write
			const slip = await tx.packingSlip.create({
				data: {
					pickJobId: input.pickJobId,
					slipNumber,
					packedAt: new Date(),
					packedById: context.user.id,
					shipmentLines: {
						create: shipmentLinesData.map((sl) => ({
							variantId: sl.variantId,
							qty: sl.qty,
							batchLotId: sl.batchLotId,
							serialNumberId: sl.serialNumberId,
						})),
					},
				},
				include: { shipmentLines: true },
			});

			// 8. Auto-complete wave if all pick jobs are done
			if (completedJob.waveId) {
				const wave = await tx.pickingWave.findUnique({
					where: { id: completedJob.waveId },
					include: { pickJobs: { select: { status: true } } },
				});

				if (wave && wave.status === "ACTIVE") {
					const allComplete = wave.pickJobs.every(
						(pj) => pj.status === "COMPLETED",
					);
					if (allComplete) {
						await tx.pickingWave.update({
							where: { id: completedJob.waveId },
							data: {
								status: "COMPLETED",
								completedAt: new Date(),
							},
						});
					}
				}
			}

			return { pickJob: completedJob, packingSlip: slip };
		});

		return { pickJob, packingSlip };
	});
