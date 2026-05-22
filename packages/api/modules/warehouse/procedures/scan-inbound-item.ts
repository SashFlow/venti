import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

export const scanInboundItemProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/warehouses/{warehouseId}/scanner/scan-inbound",
		tags: ["Scanner"],
		summary:
			"Resolve a scanned barcode against an open PO for inbound receiving",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			barcode: z.string().min(1),
			purchaseOrderId: z.string().optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		// Resolve barcode → SKU
		const sku = await db.sKU.findFirst({
			where: {
				organizationId: input.organizationId,
				OR: [{ gtin: input.barcode }, { skuCode: input.barcode }],
			},
			select: { id: true, skuCode: true, name: true, gtin: true },
		});

		if (!sku) {
			return { found: false, sku: null, poLine: null };
		}

		// Find open PO line for this SKU at this warehouse
		const poLineWhere = {
			skuId: sku.id,
			purchaseOrder: {
				warehouseId: input.warehouseId,
				status: { in: ["APPROVED", "PARTIALLY_RECEIVED"] as const },
			},
			...(input.purchaseOrderId
				? { purchaseOrderId: input.purchaseOrderId }
				: {}),
		};

		const poLine = await db.purchaseOrderLine.findFirst({
			where: poLineWhere,
			orderBy: { createdAt: "asc" },
			select: {
				id: true,
				lineNumber: true,
				orderedQty: true,
				receivedQty: true,
				status: true,
				purchaseOrder: {
					select: { id: true, poNumber: true, expectedDate: true },
				},
			},
		});

		return {
			found: true,
			sku,
			poLine: poLine
				? {
						...poLine,
						orderedQty: Number(poLine.orderedQty),
						receivedQty: Number(poLine.receivedQty),
						remainingQty:
							Number(poLine.orderedQty) -
							Number(poLine.receivedQty),
					}
				: null,
		};
	});
