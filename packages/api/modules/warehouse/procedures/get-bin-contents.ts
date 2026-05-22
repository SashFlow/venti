import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const getBinContentsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/warehouses/{warehouseId}/scanner/bin-contents",
		tags: ["Scanner"],
		summary: "Get inventory contents of a bin by barcode",
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

		const storageUnit = await db.storageUnit.findFirst({
			where: {
				warehouseId: input.warehouseId,
				OR: [
					{ barcode: input.barcode },
					{ qrCode: input.barcode },
					{ code: input.barcode },
				],
			},
			select: {
				id: true,
				code: true,
				name: true,
				maxUnits: true,
				isBlocked: true,
				zone: { select: { name: true, type: true } },
				inventoryBalances: {
					select: {
						id: true,
						qtyOnHand: true,
						qtyReserved: true,
						batchNumber: true,
						expiryDate: true,
						sku: {
							select: {
								id: true,
								skuCode: true,
								name: true,
								gtin: true,
							},
						},
					},
				},
			},
		});

		if (!storageUnit) {
			throw new Error("Bin not found for this barcode");
		}

		const contents = storageUnit.inventoryBalances.map((b) => ({
			...b,
			qtyOnHand: Number(b.qtyOnHand),
			qtyReserved: Number(b.qtyReserved),
			qtyAvailable: Number(b.qtyOnHand) - Number(b.qtyReserved),
		}));

		return { storageUnit: { ...storageUnit, inventoryBalances: contents } };
	});
