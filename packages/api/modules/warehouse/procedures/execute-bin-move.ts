import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const executeBinMoveProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/warehouses/{warehouseId}/scanner/bin-move",
		tags: ["Scanner"],
		summary: "Move stock between two bins (Quick Scan Move)",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			fromBinBarcode: z.string().min(1),
			toBinBarcode: z.string().min(1),
			skuId: z.string(),
			quantity: z.number().positive(),
			reasonCode: z.string().optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const [fromBin, toBin] = await Promise.all([
			db.storageUnit.findFirst({
				where: {
					warehouseId: input.warehouseId,
					OR: [
						{ barcode: input.fromBinBarcode },
						{ qrCode: input.fromBinBarcode },
						{ code: input.fromBinBarcode },
					],
				},
				select: {
					id: true,
					code: true,
					isBlocked: true,
					isOutboundAllowed: true,
				},
			}),
			db.storageUnit.findFirst({
				where: {
					warehouseId: input.warehouseId,
					OR: [
						{ barcode: input.toBinBarcode },
						{ qrCode: input.toBinBarcode },
						{ code: input.toBinBarcode },
					],
				},
				select: {
					id: true,
					code: true,
					isBlocked: true,
					isInboundAllowed: true,
					maxUnits: true,
				},
			}),
		]);

		if (!fromBin) throw new Error("Source bin not found");
		if (!toBin) throw new Error("Destination bin not found");
		if (fromBin.isBlocked) throw new Error("Source bin is blocked");
		if (toBin.isBlocked) throw new Error("Destination bin is blocked");
		if (!fromBin.isOutboundAllowed)
			throw new Error("Source bin does not allow outbound movement");
		if (!toBin.isInboundAllowed)
			throw new Error("Destination bin does not allow inbound movement");

		// Check available qty at source
		const sourceBalance = await db.inventoryBalance.findFirst({
			where: {
				storageUnitId: fromBin.id,
				skuId: input.skuId,
				warehouseId: input.warehouseId,
			},
			select: { id: true, qtyOnHand: true, qtyReserved: true },
		});

		const availableQty =
			Number(sourceBalance?.qtyOnHand ?? 0) -
			Number(sourceBalance?.qtyReserved ?? 0);

		if (availableQty < input.quantity) {
			throw new Error(
				`Insufficient available stock: ${availableQty} available, ${input.quantity} requested`,
			);
		}

		// Find inventory item to reference in movement
		const inventoryItem = await db.inventoryItem.findFirst({
			where: {
				warehouseId: input.warehouseId,
				skuId: input.skuId,
				currentStorageUnitId: fromBin.id,
				status: "AVAILABLE",
			},
			select: { id: true },
		});

		if (!inventoryItem) {
			throw new Error("No available inventory item found at source bin");
		}

		await db.$transaction(async (tx) => {
			// Post movement ledger entry
			await tx.inventoryMovement.create({
				data: {
					warehouseId: input.warehouseId,
					inventoryItemId: inventoryItem.id,
					transactionType: "INTERNAL_TRANSFER",
					status: "COMPLETED",
					fromStorageUnitId: fromBin.id,
					toStorageUnitId: toBin.id,
					quantity: input.quantity,
					notes: input.reasonCode,
					performedByUserId: user.id,
					startedAt: new Date(),
					completedAt: new Date(),
				},
			});

			// Update inventory item location (partial moves: only when full qty moved)
			await tx.inventoryItem.update({
				where: { id: inventoryItem.id },
				data: { currentStorageUnitId: toBin.id },
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

			// Upsert destination balance
			const destBalance = await tx.inventoryBalance.findFirst({
				where: {
					storageUnitId: toBin.id,
					skuId: input.skuId,
					warehouseId: input.warehouseId,
				},
				select: { id: true },
			});

			if (destBalance) {
				await tx.inventoryBalance.update({
					where: { id: destBalance.id },
					data: { qtyOnHand: { increment: input.quantity } },
				});
			} else {
				await tx.inventoryBalance.create({
					data: {
						warehouseId: input.warehouseId,
						skuId: input.skuId,
						storageUnitId: toBin.id,
						qtyOnHand: input.quantity,
					},
				});
			}
		});

		return {
			success: true,
			fromBinCode: fromBin.code,
			toBinCode: toBin.code,
			quantity: input.quantity,
		};
	});
