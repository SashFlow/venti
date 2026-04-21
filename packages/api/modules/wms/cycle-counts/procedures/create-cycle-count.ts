import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const createCycleCount = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/cycle-counts",
		tags: ["WMS", "CycleCounts"],
		summary: "Create a cycle count and pre-populate lines from stock levels",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			zoneId: z.string().optional(),
			binId: z.string().optional(),
			scheduledDate: z.string().datetime().optional(),
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

		// Verify warehouse belongs to org
		const warehouse = await db.warehouse.findUnique({
			where: { id: input.warehouseId },
		});
		if (!warehouse || warehouse.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Warehouse not found");
		}

		const cycleCount = await db.$transaction(async (tx) => {
			const countNumber = await generateDocNumber(tx, {
				organizationId: input.organizationId,
				prefix: "CC",
				countFn: () =>
					tx.cycleCount.count({
						where: { organizationId: input.organizationId },
					}),
			});

			// Build StockLevel filter
			const stockLevelWhere: Record<string, unknown> = {
				organizationId: input.organizationId,
				warehouseId: input.warehouseId,
			};

			if (input.binId) {
				stockLevelWhere.binId = input.binId;
			} else if (input.zoneId) {
				// Filter by zone via bin → aisle → zone
				stockLevelWhere.bin = {
					aisle: { zoneId: input.zoneId },
				};
			}

			const stockLevels = await tx.stockLevel.findMany({
				where: stockLevelWhere as Parameters<typeof tx.stockLevel.findMany>[0]["where"],
			});

			const count = await tx.cycleCount.create({
				data: {
					organizationId: input.organizationId,
					warehouseId: input.warehouseId,
					zoneId: input.zoneId,
					binId: input.binId,
					countNumber,
					status: "SCHEDULED",
					scheduledDate: input.scheduledDate
						? new Date(input.scheduledDate)
						: undefined,
					lines: {
						create: stockLevels.map((sl) => ({
							variantId: sl.variantId,
							binId: sl.binId,
							expectedQty: sl.qtyOnHand,
						})),
					},
				},
				include: {
					lines: true,
				},
			});

			return count;
		});

		return { cycleCount };
	});
