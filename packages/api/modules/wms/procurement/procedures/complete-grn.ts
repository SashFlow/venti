import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import {
	addCostLayer,
	updateProductCost,
	updateLandedCostForGrn,
} from "../../lib/cost-layer";
import { recordMovement, adjustStockLevel } from "../../lib/stock-ledger";
import { suggestPutawayBin } from "../../lib/putaway";

export const completeGrn = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/grns/{grnId}/complete",
		tags: ["WMS", "Procurement"],
		summary: "Complete a GRN — putaway and stock movement (Step 2/3)",
	})
	.input(
		z.object({
			organizationId: z.string(),
			grnId: z.string(),
			lines: z.array(
				z.object({
					grnLineId: z.string(),
					acceptedQty: z.number().nonnegative(),
					binId: z.string().optional(),
					batchLotId: z.string().optional(),
					serialNumberIds: z.array(z.string()).optional(),
				}),
			),
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
				WMS_RESOURCES.PROCUREMENT,
				WMS_ACTIONS.RECEIVE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify GRN belongs to org and is IN_PROGRESS
		const grn = await db.gRN.findFirst({
			where: {
				id: input.grnId,
				organizationId: input.organizationId,
			},
			include: {
				lines: true,
				qcInspection: true,
				po: {
					include: {
						lines: true,
						landedCosts: true,
					},
				},
			},
		});

		if (!grn) throw new ORPCError("NOT_FOUND", "GRN not found");

		if (grn.status !== "IN_PROGRESS") {
			throw new ORPCError(
				"CONFLICT",
				`GRN must be in IN_PROGRESS status, current status: ${grn.status}`,
			);
		}

		// THREE_STEP: QC inspection must be completed
		if (grn.workflowType === "THREE_STEP") {
			if (!grn.qcInspection) {
				throw new ORPCError(
					"CONFLICT",
					"THREE_STEP workflow requires a completed QC inspection before GRN completion",
				);
			}
			if (!grn.qcInspection.decision) {
				throw new ORPCError(
					"CONFLICT",
					"QC inspection must have a decision before completing the GRN",
				);
			}
		}

		// Calculate total accepted qty across all input lines (for landed cost division)
		const totalAcceptedQtyInBatch = input.lines.reduce(
			(sum, l) => sum + l.acceptedQty,
			0,
		);

		// Get existing landed cost if any
		const landedCost = grn.po.landedCosts[0] ?? null;
		const landedCostTotal = landedCost
			? parseFloat(landedCost.totalCost.toString())
			: 0;

		// We'll compute per-unit landed cost after we know the total accepted across ALL GRN lines
		// For a fresh completion, we use the lines from this batch
		// Note: totalAcceptedQtyInBatch is the total for THIS completion call
		const landedCostPerUnit =
			landedCostTotal > 0 && totalAcceptedQtyInBatch > 0
				? landedCostTotal / totalAcceptedQtyInBatch
				: 0;

		const completedGrn = await db.$transaction(async (tx) => {
			// Track per-variant landed costs for updateLandedCostForGrn call
			const perUnitLandedCosts = new Map<string, number>();

			for (const inputLine of input.lines) {
				if (inputLine.acceptedQty <= 0) continue;

				// Get GRN line
				const grnLine = grn.lines.find((l) => l.id === inputLine.grnLineId);
				if (!grnLine) {
					throw new ORPCError(
						"NOT_FOUND",
						`GRN line ${inputLine.grnLineId} not found`,
					);
				}

				// Get corresponding PO line for unit cost
				const poLine = grnLine.poLineId
					? grn.po.lines.find((pl) => pl.id === grnLine.poLineId)
					: null;
				const unitCost = poLine
					? parseFloat(poLine.unitCost.toString())
					: 0;

				// Determine bin
				let binId = inputLine.binId;
				if (!binId) {
					const variant = await tx.productVariant.findUnique({
						where: { id: grnLine.variantId },
						select: { weightClass: true, isSerialized: true },
					});
					const weightClass = variant?.weightClass ?? "LIGHT";
					binId =
						(await suggestPutawayBin(
							grn.warehouseId,
							weightClass as "LIGHT" | "HEAVY",
						)) ?? undefined;
				}

				if (!binId) {
					throw new ORPCError(
						"CONFLICT",
						`No suitable bin found for GRN line ${inputLine.grnLineId} — assign manually`,
					);
				}

				// Update GRN line accepted qty
				await tx.gRNLine.update({
					where: { id: inputLine.grnLineId },
					data: {
						acceptedQty: inputLine.acceptedQty,
						...(inputLine.batchLotId
							? { batchLotId: inputLine.batchLotId }
							: {}),
					},
				});

				// Record stock movement
				await recordMovement(tx, {
					organizationId: input.organizationId,
					movementType: "RECEIPT",
					qty: inputLine.acceptedQty,
					warehouseId: grn.warehouseId,
					binId,
					variantId: grnLine.variantId,
					costPerUnit: unitCost,
					referenceType: "GRN",
					referenceId: input.grnId,
					batchLotId: inputLine.batchLotId,
					performedById: context.user.id,
				});

				// Adjust stock level
				await adjustStockLevel(tx, {
					organizationId: input.organizationId,
					warehouseId: grn.warehouseId,
					binId,
					variantId: grnLine.variantId,
					qtyDelta: inputLine.acceptedQty,
				});

				// Update batch lot remaining qty if provided
				if (inputLine.batchLotId) {
					await tx.batchLot.update({
						where: { id: inputLine.batchLotId },
						data: {
							qtyRemaining: {
								increment: inputLine.acceptedQty,
							},
						},
					});
				}

				// Handle serial numbers if provided
				if (
					inputLine.serialNumberIds &&
					inputLine.serialNumberIds.length > 0
				) {
					// Check variant.isSerialized
					const variant = await tx.productVariant.findUnique({
						where: { id: grnLine.variantId },
						select: { isSerialized: true },
					});

					if (variant?.isSerialized) {
						// Validate count matches accepted qty (integer check)
						if (
							inputLine.serialNumberIds.length !==
							Math.round(inputLine.acceptedQty)
						) {
							throw new ORPCError(
								"CONFLICT",
								`Serial number count (${inputLine.serialNumberIds.length}) must match accepted qty (${inputLine.acceptedQty})`,
							);
						}

						// Update each serial number to IN_STOCK
						for (const snId of inputLine.serialNumberIds) {
							await tx.serialNumber.update({
								where: { id: snId },
								data: {
									status: "IN_STOCK",
									warehouseId: grn.warehouseId,
									binId,
								},
							});
						}
					}
				}

				// Add cost layer
				await addCostLayer(tx, {
					organizationId: input.organizationId,
					variantId: grnLine.variantId,
					warehouseId: grn.warehouseId,
					qty: inputLine.acceptedQty,
					costPerUnit: unitCost,
					landedCost: landedCostPerUnit,
					grnId: input.grnId,
				});

				// Update product cost (recompute WAC from layers)
				await updateProductCost(tx, {
					organizationId: input.organizationId,
					variantId: grnLine.variantId,
					warehouseId: grn.warehouseId,
				});

				// Track per-variant landed cost for propagation
				if (landedCostPerUnit > 0) {
					perUnitLandedCosts.set(grnLine.variantId, landedCostPerUnit);
				}
			}

			// If landed cost exists, propagate updated per-unit amounts to cost layers
			if (landedCost && perUnitLandedCosts.size > 0) {
				await updateLandedCostForGrn(tx, {
					organizationId: input.organizationId,
					grnId: input.grnId,
					perUnitLandedCosts,
				});
			}

			// Mark GRN as COMPLETED
			const updated = await tx.gRN.update({
				where: { id: input.grnId },
				data: {
					status: "COMPLETED",
					receivedAt: new Date(),
				},
				include: { lines: true },
			});

			// Determine PO status: RECEIVED or PARTIAL
			// Query all GRN lines across ALL completed GRNs for this PO
			const allCompletedGrnLines = await tx.gRNLine.findMany({
				where: {
					grn: {
						poId: grn.poId,
						status: "COMPLETED",
					},
					poLineId: { not: null },
				},
				select: { poLineId: true, acceptedQty: true },
			});

			// Group by poLineId and sum acceptedQty
			const acceptedByPoLine = new Map<string, number>();
			for (const line of allCompletedGrnLines) {
				if (!line.poLineId) continue;
				const current = acceptedByPoLine.get(line.poLineId) ?? 0;
				acceptedByPoLine.set(
					line.poLineId,
					current + parseFloat(line.acceptedQty.toString()),
				);
			}

			// Check if every PO line is fully received
			const allPoLines = grn.po.lines;
			const allFullyReceived = allPoLines.every((poLine) => {
				const totalAccepted = acceptedByPoLine.get(poLine.id) ?? 0;
				const expectedQty = parseFloat(poLine.qty.toString());
				return totalAccepted >= expectedQty;
			});

			await tx.purchaseOrder.update({
				where: { id: grn.poId },
				data: {
					status: allFullyReceived ? "RECEIVED" : "PARTIAL",
				},
			});

			return updated;
		});

		return { grn: completedGrn };
	});
