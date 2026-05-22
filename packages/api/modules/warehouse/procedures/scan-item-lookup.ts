import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const scanItemLookupProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/warehouses/{warehouseId}/scanner/item-lookup",
		tags: ["Scanner"],
		summary:
			"Resolve a barcode to SKU + current stock information (Check Stock)",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			barcode: z.string().min(1),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		// Try to resolve as a bin barcode first
		const storageUnit = await db.storageUnit.findFirst({
			where: {
				warehouseId: input.warehouseId,
				OR: [
					{ barcode: input.barcode },
					{ qrCode: input.barcode },
					{ code: input.barcode },
				],
			},
			select: { id: true, code: true, name: true },
		});

		if (storageUnit) {
			const balances = await db.inventoryBalance.findMany({
				where: {
					storageUnitId: storageUnit.id,
					warehouseId: input.warehouseId,
				},
				select: {
					qtyOnHand: true,
					qtyReserved: true,
					batchNumber: true,
					expiryDate: true,
					sku: { select: { id: true, skuCode: true, name: true } },
				},
			});

			return {
				resolvedAs: "bin" as const,
				storageUnit,
				balances: balances.map((b) => ({
					...b,
					qtyOnHand: Number(b.qtyOnHand),
					qtyReserved: Number(b.qtyReserved),
					qtyAvailable: Number(b.qtyOnHand) - Number(b.qtyReserved),
				})),
				sku: null,
			};
		}

		// Try to resolve as a SKU barcode
		const sku = await db.sKU.findFirst({
			where: {
				organizationId: input.organizationId,
				OR: [{ gtin: input.barcode }, { skuCode: input.barcode }],
			},
			select: { id: true, skuCode: true, name: true, gtin: true },
		});

		if (sku) {
			const balances = await db.inventoryBalance.findMany({
				where: { skuId: sku.id, warehouseId: input.warehouseId },
				select: {
					qtyOnHand: true,
					qtyReserved: true,
					batchNumber: true,
					expiryDate: true,
					storageUnit: {
						select: { id: true, code: true, name: true },
					},
				},
			});

			return {
				resolvedAs: "sku" as const,
				sku,
				storageUnit: null,
				balances: balances.map((b) => ({
					...b,
					qtyOnHand: Number(b.qtyOnHand),
					qtyReserved: Number(b.qtyReserved),
					qtyAvailable: Number(b.qtyOnHand) - Number(b.qtyReserved),
				})),
			};
		}

		return {
			resolvedAs: "unknown" as const,
			sku: null,
			storageUnit: null,
			balances: [],
		};
	});
