import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";
import { optimizePickRoute } from "../services/route-optimizer";

export const computeWaveRouteProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/waves/{waveId}/compute-route",
		tags: ["Scanner"],
		summary:
			"Run TSP route optimization and assign pickSequence to wave lines",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		// Load wave lines with their SKU and current bin position
		const wave = await db.wave.findFirst({
			where: { id: input.waveId },
			select: {
				id: true,
				warehouseId: true,
				lines: {
					where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
					select: {
						id: true,
						salesOrderLine: {
							select: { sku: { select: { id: true } } },
						},
					},
				},
			},
		});

		if (!wave) {
			throw new Error("Wave not found");
		}

		// Find the INBOUND zone origin as TSP start point
		const inboundZone = await db.zone.findFirst({
			where: { warehouseId: wave.warehouseId, type: "INBOUND" },
			select: {
				storageUnits: {
					select: { startX: true, startY: true },
					take: 1,
				},
			},
		});

		const startNode = {
			x: Number(inboundZone?.storageUnits[0]?.startX ?? 0),
			y: Number(inboundZone?.storageUnits[0]?.startY ?? 0),
		};

		// Resolve bin position for each wave line via InventoryBalance
		const nodes = (
			await Promise.all(
				wave.lines.map(async (line) => {
					const balance = await db.inventoryBalance.findFirst({
						where: {
							skuId: line.salesOrderLine.sku.id,
							warehouseId: wave.warehouseId,
							qtyOnHand: { gt: 0 },
						},
						select: {
							storageUnit: {
								select: { startX: true, startY: true },
							},
						},
					});

					if (!balance?.storageUnit) return null;

					return {
						id: line.id,
						x: Number(balance.storageUnit.startX ?? 0),
						y: Number(balance.storageUnit.startY ?? 0),
					};
				}),
			)
		).filter((n): n is NonNullable<typeof n> => n !== null);

		const { orderedIds, estimatedDistanceMm } = optimizePickRoute(
			nodes,
			startNode,
		);

		// Batch update pickSequence
		await db.$transaction(
			orderedIds.map((id, idx) =>
				db.waveLine.update({
					where: { id },
					data: { pickSequence: idx + 1 },
				}),
			),
		);

		await db.wave.update({
			where: { id: input.waveId },
			data: {
				status: "RELEASED",
				releasedAt: new Date(),
				releasedById: user.id,
			},
		});

		return {
			linesSequenced: orderedIds.length,
			estimatedDistanceMm,
		};
	});
