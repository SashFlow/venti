import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { adjustStockLevel } from "../../lib/stock-ledger";

export const activateWave = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/picking/waves/{waveId}/activate",
		tags: ["WMS", "Picking"],
		summary: "Activate a picking wave and reserve stock for all pick job lines",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
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
				WMS_RESOURCES.PICKING,
				WMS_ACTIONS.PICK,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const wave = await db.pickingWave.findUnique({
			where: { id: input.waveId },
			include: {
				pickJobs: {
					include: { lines: true },
				},
			},
		});

		if (!wave || wave.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Picking wave not found");
		}

		if (wave.status !== "DRAFT") {
			throw new ORPCError(
				"CONFLICT",
				`Wave cannot be activated (current status: ${wave.status})`,
			);
		}

		if (wave.pickJobs.length === 0) {
			throw new ORPCError(
				"CONFLICT",
				"Wave has no pick jobs — add pick jobs before activating",
			);
		}

		const updatedWave = await db.$transaction(async (tx) => {
			// Check availability for all lines before making any reservations
			for (const job of wave.pickJobs) {
				for (const line of job.lines) {
					const sl = await tx.stockLevel.findUnique({
						where: {
							organizationId_warehouseId_binId_variantId: {
								organizationId: input.organizationId,
								warehouseId: wave.warehouseId,
								binId: line.binId,
								variantId: line.variantId,
							},
						},
					});

					const available = sl ? Number(sl.qtyAvailable) : 0;
					const required = Number(line.qtyToPick);

					if (available < required) {
						throw new ORPCError(
							"CONFLICT",
							`Insufficient stock for variant ${line.variantId} in bin ${line.binId}: need ${required}, available ${available}`,
						);
					}
				}
			}

			// All checks passed — reserve stock for each line
			for (const job of wave.pickJobs) {
				for (const line of job.lines) {
					await adjustStockLevel(tx, {
						organizationId: input.organizationId,
						warehouseId: wave.warehouseId,
						binId: line.binId,
						variantId: line.variantId,
						qtyDelta: 0,
						qtyReservedDelta: Number(line.qtyToPick),
					});
				}
			}

			return tx.pickingWave.update({
				where: { id: input.waveId },
				data: {
					status: "ACTIVE",
					assignedAt: new Date(),
				},
				include: {
					_count: { select: { pickJobs: true } },
				},
			});
		});

		return { wave: updatedWave };
	});
