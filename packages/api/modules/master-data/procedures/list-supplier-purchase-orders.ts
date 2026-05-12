import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const listSupplierPurchaseOrdersInput = z.object({
	organizationId: z.string(),
	supplierId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listSupplierPurchaseOrdersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/suppliers/{supplierId}/purchase-orders",
		tags: ["Master Data"],
		summary: "List supplier purchase orders",
		description: "List purchase orders for a specific supplier.",
	})
	.input(listSupplierPurchaseOrdersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const trimmedQuery = input.query?.trim();

		const where = {
			organizationId: input.organizationId,
			supplierId: input.supplierId,
			...(trimmedQuery
				? {
						OR: [
							{
								poNumber: {
									contains: trimmedQuery,
									mode: "insensitive" as const,
								},
							},
							{
								warehouse: {
									name: {
										contains: trimmedQuery,
										mode: "insensitive" as const,
									},
								},
							},
						],
					}
				: {}),
		};

		const [orders, total] = await Promise.all([
			db.purchaseOrder.findMany({
				where,
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
				select: {
					id: true,
					poNumber: true,
					status: true,
					expectedDate: true,
					orderedAt: true,
					createdAt: true,
					warehouse: { select: { name: true } },
					_count: { select: { lines: true } },
				},
			}),
			db.purchaseOrder.count({ where }),
		]);

		return { orders, total };
	});
