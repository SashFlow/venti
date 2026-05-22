import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";
import { suggestPutawayLocations } from "../services/putaway-service";

export const confirmInboundReceiptProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/warehouses/{warehouseId}/scanner/confirm-receipt",
		tags: ["Scanner"],
		summary:
			"Confirm inbound receipt of a scanned item and get putaway suggestions",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			poLineId: z.string(),
			skuId: z.string(),
			quantity: z.number().positive(),
			batchNumber: z.string().optional(),
			expiryDate: z.string().optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const poLine = await db.purchaseOrderLine.findUnique({
			where: { id: input.poLineId },
			select: {
				id: true,
				orderedQty: true,
				receivedQty: true,
				purchaseOrder: {
					select: { id: true, poNumber: true, warehouseId: true },
				},
			},
		});

		if (!poLine) throw new Error("PO line not found");
		if (poLine.purchaseOrder.warehouseId !== input.warehouseId)
			throw new Error("PO does not belong to this warehouse");

		const remaining =
			Number(poLine.orderedQty) - Number(poLine.receivedQty);
		if (input.quantity > remaining) {
			throw new Error(
				`Receiving ${input.quantity} exceeds remaining PO qty of ${remaining}`,
			);
		}

		// Find the INBOUND staging zone as the temporary location
		const inboundUnit = await db.storageUnit.findFirst({
			where: {
				warehouseId: input.warehouseId,
				zone: { type: "INBOUND" },
			},
			select: { id: true, code: true },
		});

		await db.$transaction(async (tx) => {
			// Create inventory item
			const item = await tx.inventoryItem.create({
				data: {
					warehouseId: input.warehouseId,
					skuId: input.skuId,
					quantity: input.quantity,
					batchNumber: input.batchNumber,
					expiryDate: input.expiryDate
						? new Date(input.expiryDate)
						: null,
					currentStorageUnitId: inboundUnit?.id ?? null,
					status: "AVAILABLE",
				},
			});

			// Post RECEIVED movement
			await tx.inventoryMovement.create({
				data: {
					warehouseId: input.warehouseId,
					inventoryItemId: item.id,
					transactionType: "RECEIVED",
					status: "COMPLETED",
					toStorageUnitId: inboundUnit?.id ?? null,
					quantity: input.quantity,
					referenceNumber: poLine.purchaseOrder.poNumber,
					performedByUserId: user.id,
					startedAt: new Date(),
					completedAt: new Date(),
				},
			});

			// Update PO line received qty and status
			const newReceivedQty = Number(poLine.receivedQty) + input.quantity;
			const newStatus =
				newReceivedQty >= Number(poLine.orderedQty)
					? "FULLY_RECEIVED"
					: "PARTIALLY_RECEIVED";

			await tx.purchaseOrderLine.update({
				where: { id: input.poLineId },
				data: {
					receivedQty: newReceivedQty,
					status: newStatus as
						| "FULLY_RECEIVED"
						| "PARTIALLY_RECEIVED",
				},
			});

			// Upsert inventory balance in the inbound staging area
			if (inboundUnit) {
				const existing = await tx.inventoryBalance.findFirst({
					where: {
						warehouseId: input.warehouseId,
						skuId: input.skuId,
						storageUnitId: inboundUnit.id,
						batchNumber: input.batchNumber ?? null,
					},
					select: { id: true },
				});

				if (existing) {
					await tx.inventoryBalance.update({
						where: { id: existing.id },
						data: { qtyOnHand: { increment: input.quantity } },
					});
				} else {
					await tx.inventoryBalance.create({
						data: {
							warehouseId: input.warehouseId,
							skuId: input.skuId,
							storageUnitId: inboundUnit.id,
							batchNumber: input.batchNumber,
							expiryDate: input.expiryDate
								? new Date(input.expiryDate)
								: null,
							qtyOnHand: input.quantity,
						},
					});
				}
			}
		});

		// Return putaway suggestions
		const suggestions = await suggestPutawayLocations({
			warehouseId: input.warehouseId,
			skuId: input.skuId,
		});

		return {
			success: true,
			receivedQty: input.quantity,
			putawaySuggestions: suggestions,
		};
	});
