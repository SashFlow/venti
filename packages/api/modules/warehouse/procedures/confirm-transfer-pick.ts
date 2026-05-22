import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const confirmTransferPickProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/warehouses/{warehouseId}/scanner/confirm-transfer-pick",
		tags: ["Scanner"],
		summary:
			"Confirm pick of a line against an inter-warehouse transfer order",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			transferId: z.string(),
			skuId: z.string(),
			quantity: z.number().positive(),
			fromBinBarcode: z.string().min(1),
			inventoryItemId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const transfer = await db.transfer.findUnique({
			where: { id: input.transferId },
			select: {
				id: true,
				transferNumber: true,
				fromWarehouseId: true,
				status: true,
			},
		});

		if (!transfer) throw new Error("Transfer not found");
		if (transfer.fromWarehouseId !== input.warehouseId)
			throw new Error("Transfer does not originate from this warehouse");
		if (!["PENDING", "IN_PROGRESS"].includes(transfer.status))
			throw new Error("Transfer is not in a pickable state");

		const fromBin = await db.storageUnit.findFirst({
			where: {
				warehouseId: input.warehouseId,
				OR: [
					{ barcode: input.fromBinBarcode },
					{ qrCode: input.fromBinBarcode },
					{ code: input.fromBinBarcode },
				],
			},
			select: { id: true, code: true },
		});

		if (!fromBin) throw new Error("Source bin not found");

		await db.$transaction(async (tx) => {
			await tx.inventoryMovement.create({
				data: {
					warehouseId: input.warehouseId,
					inventoryItemId: input.inventoryItemId,
					transactionType: "INTERNAL_TRANSFER",
					status: "COMPLETED",
					fromStorageUnitId: fromBin.id,
					quantity: input.quantity,
					referenceNumber: transfer.transferNumber,
					transferGroupId: transfer.id,
					performedByUserId: user.id,
					startedAt: new Date(),
					completedAt: new Date(),
				},
			});

			// Update source balance
			await tx.inventoryBalance.updateMany({
				where: {
					storageUnitId: fromBin.id,
					skuId: input.skuId,
					warehouseId: input.warehouseId,
				},
				data: { qtyOnHand: { decrement: input.quantity } },
			});

			// Move item to staging (mark current location as null — in-transit)
			await tx.inventoryItem.update({
				where: { id: input.inventoryItemId },
				data: { currentStorageUnitId: null },
			});

			// Advance transfer to IN_PROGRESS if still PENDING
			if (transfer.status === "PENDING") {
				await tx.transfer.update({
					where: { id: input.transferId },
					data: { status: "IN_PROGRESS" },
				});
			}
		});

		return { success: true, quantity: input.quantity };
	});
