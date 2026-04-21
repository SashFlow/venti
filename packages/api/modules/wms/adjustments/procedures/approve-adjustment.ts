import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { addCostLayer, updateProductCost, depleteStock } from "../../lib/cost-layer";
import { recordMovement, adjustStockLevel } from "../../lib/stock-ledger";

export const approveAdjustment = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/adjustments/{adjustmentId}/approve",
		tags: ["WMS", "Adjustments"],
		summary: "Approve a pending stock adjustment",
	})
	.input(
		z.object({
			organizationId: z.string(),
			adjustmentId: z.string(),
			notes: z.string().optional(),
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
				WMS_ACTIONS.APPROVE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.stockAdjustment.findUnique({
			where: { id: input.adjustmentId },
		});

		if (!existing || existing.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Stock adjustment not found");
		}

		if (existing.status !== "PENDING_APPROVAL") {
			throw new ORPCError(
				"CONFLICT",
				`Adjustment is not pending approval (current: ${existing.status})`,
			);
		}

		const adjustment = await db.$transaction(async (tx) => {
			const qty = parseFloat(existing.qty.toString());
			const warehouseId = existing.warehouseId;
			const variantId = existing.variantId;
			const adjustmentId = existing.id;

			// Resolve binId — use stored binId or find default bin in warehouse
			let binId = existing.binId;
			if (!binId) {
				const defaultBin = await tx.warehouseBin.findFirst({
					where: {
						aisle: {
							zone: {
								level: { warehouseId },
							},
						},
					},
				});
				if (!defaultBin) {
					throw new ORPCError(
						"CONFLICT",
						"No bin found in warehouse — cannot apply adjustment without a bin",
					);
				}
				binId = defaultBin.id;
			}

			if (qty > 0) {
				// Increase stock

				// Get current cost for adding a cost layer
				const productCost = await tx.productCost.findUnique({
					where: {
						organizationId_variantId_warehouseId: {
							organizationId: input.organizationId,
							variantId,
							warehouseId,
						},
					},
				});
				const costPerUnit = productCost
					? parseFloat(productCost.costPerUnit.toString())
					: 0;

				await recordMovement(tx, {
					organizationId: input.organizationId,
					movementType: "ADJUSTMENT",
					qty,
					warehouseId,
					binId,
					variantId,
					costPerUnit,
					referenceType: "ADJUSTMENT",
					referenceId: adjustmentId,
					performedById: context.user.id,
				});

				await adjustStockLevel(tx, {
					organizationId: input.organizationId,
					warehouseId,
					binId,
					variantId,
					qtyDelta: qty,
				});

				await addCostLayer(tx, {
					organizationId: input.organizationId,
					variantId,
					warehouseId,
					qty,
					costPerUnit,
				});
			} else {
				// Decrease stock
				const absQty = Math.abs(qty);

				const { avgCostPerUnit } = await depleteStock(tx, {
					organizationId: input.organizationId,
					variantId,
					warehouseId,
					qty: absQty,
				});

				await recordMovement(tx, {
					organizationId: input.organizationId,
					movementType: "ADJUSTMENT",
					qty, // negative
					warehouseId,
					binId,
					variantId,
					costPerUnit: avgCostPerUnit,
					referenceType: "ADJUSTMENT",
					referenceId: adjustmentId,
					performedById: context.user.id,
				});

				await adjustStockLevel(tx, {
					organizationId: input.organizationId,
					warehouseId,
					binId,
					variantId,
					qtyDelta: qty, // negative
				});
			}

			await updateProductCost(tx, {
				organizationId: input.organizationId,
				variantId,
				warehouseId,
			});

			return tx.stockAdjustment.update({
				where: { id: adjustmentId },
				data: {
					status: "APPROVED",
					approvedById: context.user.id,
					approvedAt: new Date(),
					...(input.notes ? { notes: input.notes } : {}),
					// Store the resolved binId if it was defaulted
					...(existing.binId ? {} : { binId }),
				},
				include: {
					requestedBy: { select: { name: true } },
					approvedBy: { select: { name: true } },
				},
			});
		});

		return { adjustment };
	});
