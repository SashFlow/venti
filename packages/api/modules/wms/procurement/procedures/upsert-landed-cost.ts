import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { updateLandedCostForGrn } from "../../lib/cost-layer";

export const upsertLandedCost = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/purchase-orders/{purchaseOrderId}/landed-cost",
		tags: ["WMS", "Procurement"],
		summary: "Upsert landed cost for a purchase order",
	})
	.input(
		z.object({
			organizationId: z.string(),
			purchaseOrderId: z.string(),
			freight: z.number().nonnegative().default(0),
			insurance: z.number().nonnegative().default(0),
			customs: z.number().nonnegative().default(0),
			other: z.number().nonnegative().default(0),
			allocation: z
				.enum(["BY_QTY", "BY_WEIGHT", "BY_VALUE"])
				.default("BY_QTY"),
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
				WMS_ACTIONS.UPDATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify PO belongs to org
		const po = await db.purchaseOrder.findFirst({
			where: {
				id: input.purchaseOrderId,
				organizationId: input.organizationId,
			},
			include: {
				lines: true,
				grns: {
					where: { status: "COMPLETED" },
					include: { lines: true },
				},
			},
		});
		if (!po) throw new ORPCError("NOT_FOUND", "Purchase order not found");

		const totalCost =
			input.freight + input.insurance + input.customs + input.other;

		const landedCost = await db.$transaction(async (tx) => {
			// LandedCost has no @unique on poId, so we use findFirst + create/update
			const existing = await tx.landedCost.findFirst({
				where: { poId: input.purchaseOrderId },
				orderBy: { createdAt: "asc" },
			});

			const lc = existing
				? await tx.landedCost.update({
						where: { id: existing.id },
						data: {
							freight: input.freight,
							insurance: input.insurance,
							customs: input.customs,
							other: input.other,
							totalCost,
							allocation: input.allocation,
						},
					})
				: await tx.landedCost.create({
						data: {
							poId: input.purchaseOrderId,
							freight: input.freight,
							insurance: input.insurance,
							customs: input.customs,
							other: input.other,
							totalCost,
							allocation: input.allocation,
						},
					});

			// Propagate to completed GRNs
			if (po.grns.length > 0 && totalCost > 0) {
				// Collect all GRN lines across completed GRNs
				const allGrnLines = po.grns.flatMap((grn) => grn.lines);

				// Calculate per-variant allocations
				const perUnitLandedCostsByGrn = new Map<
					string,
					Map<string, number>
				>();

				for (const grn of po.grns) {
					const perUnitMap = new Map<string, number>();

					if (input.allocation === "BY_VALUE") {
						// Total value across all completed GRN lines
						let totalValue = 0;
						for (const line of allGrnLines) {
							const acceptedQty = parseFloat(line.acceptedQty.toString());
							if (acceptedQty <= 0) continue;
							// Find the PO line for unit cost
							const poLine = po.lines.find(
								(pl) => pl.id === line.poLineId,
							);
							const unitCost = poLine
								? parseFloat(poLine.unitCost.toString())
								: 0;
							totalValue += acceptedQty * unitCost;
						}

						for (const line of grn.lines) {
							const acceptedQty = parseFloat(line.acceptedQty.toString());
							if (acceptedQty <= 0) continue;
							const poLine = po.lines.find(
								(pl) => pl.id === line.poLineId,
							);
							const unitCost = poLine
								? parseFloat(poLine.unitCost.toString())
								: 0;
							const lineValue = acceptedQty * unitCost;
							const lineShare =
								totalValue > 0 ? lineValue / totalValue : 0;
							const perUnit =
								acceptedQty > 0
									? (lineShare * totalCost) / acceptedQty
									: 0;
							if (perUnit > 0) {
								perUnitMap.set(line.variantId, perUnit);
							}
						}
					} else {
						// BY_QTY (default) and BY_WEIGHT fallback
						let totalAcceptedQty = 0;
						for (const line of allGrnLines) {
							totalAcceptedQty += parseFloat(line.acceptedQty.toString());
						}
						const perUnit =
							totalAcceptedQty > 0 ? totalCost / totalAcceptedQty : 0;

						for (const line of grn.lines) {
							const acceptedQty = parseFloat(line.acceptedQty.toString());
							if (acceptedQty > 0) {
								perUnitMap.set(line.variantId, perUnit);
							}
						}
					}

					perUnitLandedCostsByGrn.set(grn.id, perUnitMap);
				}

				// Apply updates for each completed GRN
				for (const grn of po.grns) {
					const perUnitLandedCosts = perUnitLandedCostsByGrn.get(grn.id);
					if (!perUnitLandedCosts || perUnitLandedCosts.size === 0) continue;

					await updateLandedCostForGrn(tx, {
						organizationId: input.organizationId,
						grnId: grn.id,
						perUnitLandedCosts,
					});
				}
			}

			return lc;
		});

		return { landedCost };
	});
