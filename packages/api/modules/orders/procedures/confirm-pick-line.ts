import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const confirmPickLineProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/waves/{waveId}/pick-lines/{waveLineId}/confirm",
		tags: ["Scanner"],
		summary: "Confirm a picked wave line",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
			waveLineId: z.string(),
			/** Actual quantity the operator picked. May be less than qtyToPick (short pick). */
			pickedQty: z.number().positive(),
			/** The StorageUnit id the item was taken from (for movement ledger). */
			fromStorageUnitId: z.string(),
			/** InventoryItem id that was picked. */
			inventoryItemId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const line = await db.waveLine.findFirst({
			where: { id: input.waveLineId, waveId: input.waveId },
			select: {
				id: true,
				qtyToPick: true,
				qtyPicked: true,
				status: true,
				waveId: true,
				wave: { select: { warehouseId: true } },
			},
		});

		if (!line) {
			throw new Error("Wave line not found");
		}

		if (line.status === "PICKED" || line.status === "SHORT_PICKED") {
			throw new Error("Wave line already completed");
		}

		const isShortPick = input.pickedQty < Number(line.qtyToPick);
		const newStatus = isShortPick ? "SHORT_PICKED" : "PICKED";

		await db.$transaction(async (tx) => {
			// Update wave line
			await tx.waveLine.update({
				where: { id: input.waveLineId },
				data: {
					qtyPicked: input.pickedQty,
					shortQty: isShortPick
						? Number(line.qtyToPick) - input.pickedQty
						: null,
					status: newStatus,
				},
			});

			// Post inventory movement for the PICK
			await tx.inventoryMovement.create({
				data: {
					warehouseId: line.wave.warehouseId,
					inventoryItemId: input.inventoryItemId,
					transactionType: "PICK",
					status: "COMPLETED",
					fromStorageUnitId: input.fromStorageUnitId,
					quantity: input.pickedQty,
					referenceNumber: input.waveId,
					performedByUserId: user.id,
					startedAt: new Date(),
					completedAt: new Date(),
				},
			});

			// Update inventory balance
			await tx.inventoryBalance.updateMany({
				where: {
					storageUnitId: input.fromStorageUnitId,
					skuId: (
						await tx.inventoryItem.findUnique({
							where: { id: input.inventoryItemId },
							select: { skuId: true },
						})
					)?.skuId,
				},
				data: {
					qtyOnHand: { decrement: input.pickedQty },
					qtyReserved: { decrement: input.pickedQty },
				},
			});
		});

		// Check if all wave lines are done → advance wave status
		const pendingLines = await db.waveLine.count({
			where: {
				waveId: input.waveId,
				status: { in: ["PENDING", "IN_PROGRESS"] },
			},
		});

		if (pendingLines === 0) {
			await db.wave.update({
				where: { id: input.waveId },
				data: { status: "COMPLETED", completedAt: new Date() },
			});
		}

		return {
			success: true,
			status: newStatus,
			waveComplete: pendingLines === 0,
		};
	});
