import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const confirmPutawayProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/warehouses/{warehouseId}/scanner/confirm-putaway",
		tags: ["Scanner"],
		summary: "Confirm putaway of an item into a destination bin",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			inventoryItemId: z.string(),
			destinationBinBarcode: z.string().min(1),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const [item, destBin] = await Promise.all([
			db.inventoryItem.findUnique({
				where: { id: input.inventoryItemId },
				select: {
					id: true,
					quantity: true,
					skuId: true,
					currentStorageUnitId: true,
					warehouseId: true,
				},
			}),
			db.storageUnit.findFirst({
				where: {
					warehouseId: input.warehouseId,
					OR: [
						{ barcode: input.destinationBinBarcode },
						{ qrCode: input.destinationBinBarcode },
						{ code: input.destinationBinBarcode },
					],
				},
				select: {
					id: true,
					code: true,
					isBlocked: true,
					isInboundAllowed: true,
					isStorable: true,
				},
			}),
		]);

		if (!item) throw new Error("Inventory item not found");
		if (!destBin) throw new Error("Destination bin not found");
		if (destBin.isBlocked) throw new Error("Destination bin is blocked");
		if (!destBin.isInboundAllowed)
			throw new Error("Destination bin does not allow inbound");
		if (!destBin.isStorable)
			throw new Error("Destination bin is not storable");

		const fromStorageUnitId = item.currentStorageUnitId;

		await db.$transaction(async (tx) => {
			// Post PUTAWAY movement
			await tx.inventoryMovement.create({
				data: {
					warehouseId: input.warehouseId,
					inventoryItemId: item.id,
					transactionType: "PUTAWAY",
					status: "COMPLETED",
					fromStorageUnitId,
					toStorageUnitId: destBin.id,
					quantity: Number(item.quantity),
					performedByUserId: user.id,
					startedAt: new Date(),
					completedAt: new Date(),
				},
			});

			// Update item current location
			await tx.inventoryItem.update({
				where: { id: item.id },
				data: { currentStorageUnitId: destBin.id },
			});

			// Decrement source balance
			if (fromStorageUnitId) {
				await tx.inventoryBalance.updateMany({
					where: {
						storageUnitId: fromStorageUnitId,
						skuId: item.skuId,
						warehouseId: input.warehouseId,
					},
					data: { qtyOnHand: { decrement: Number(item.quantity) } },
				});
			}

			// Upsert destination balance
			const existing = await tx.inventoryBalance.findFirst({
				where: {
					storageUnitId: destBin.id,
					skuId: item.skuId,
					warehouseId: input.warehouseId,
				},
				select: { id: true },
			});

			if (existing) {
				await tx.inventoryBalance.update({
					where: { id: existing.id },
					data: { qtyOnHand: { increment: Number(item.quantity) } },
				});
			} else {
				await tx.inventoryBalance.create({
					data: {
						warehouseId: input.warehouseId,
						skuId: item.skuId,
						storageUnitId: destBin.id,
						qtyOnHand: Number(item.quantity),
					},
				});
			}
		});

		return { success: true, destinationBinCode: destBin.code };
	});
