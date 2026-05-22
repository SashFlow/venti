import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const getPickListProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/waves/{waveId}/pick-list",
		tags: ["Scanner"],
		summary: "Get ordered pick list for a wave",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const wave = await db.wave.findFirst({
			where: { id: input.waveId },
			select: {
				id: true,
				waveNumber: true,
				type: true,
				status: true,
				releasedAt: true,
				lines: {
					orderBy: [{ pickSequence: "asc" }, { createdAt: "asc" }],
					select: {
						id: true,
						qtyToPick: true,
						qtyPicked: true,
						shortQty: true,
						status: true,
						pickSequence: true,
						salesOrderLine: {
							select: {
								id: true,
								lineNumber: true,
								orderedQty: true,
								sku: {
									select: {
										id: true,
										skuCode: true,
										name: true,
										gtin: true,
									},
								},
								salesOrder: {
									select: {
										id: true,
										salesOrderNumber: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!wave) {
			throw new Error("Wave not found");
		}

		// Fetch storage unit (bin) for each line via InventoryBalance
		const enrichedLines = await Promise.all(
			wave.lines.map(async (line) => {
				const balance = await db.inventoryBalance.findFirst({
					where: {
						skuId: line.salesOrderLine.sku.id,
						qtyOnHand: { gt: 0 },
					},
					select: {
						storageUnit: {
							select: {
								id: true,
								code: true,
								barcode: true,
								startX: true,
								startY: true,
							},
						},
					},
				});

				return {
					...line,
					qtyToPick: Number(line.qtyToPick),
					qtyPicked: Number(line.qtyPicked),
					shortQty: line.shortQty ? Number(line.shortQty) : null,
					storageUnit: balance?.storageUnit ?? null,
				};
			}),
		);

		const totalLines = enrichedLines.length;
		const pickedLines = enrichedLines.filter(
			(l) => l.status === "PICKED" || l.status === "SHORT_PICKED",
		).length;
		const isRouteOptimized = enrichedLines.some(
			(l) => l.pickSequence !== null,
		);

		return {
			wave: {
				...wave,
				totalLines,
				pickedLines,
				isRouteOptimized,
				lines: enrichedLines,
			},
		};
	});
