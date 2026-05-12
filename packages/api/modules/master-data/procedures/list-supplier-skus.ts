import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const listSupplierSkusInput = z.object({
	organizationId: z.string(),
	supplierId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listSupplierSkusProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/suppliers/{supplierId}/skus",
		tags: ["Master Data"],
		summary: "List supplier SKUs",
		description: "List SKUs linked to a supplier via SkuSupplier.",
	})
	.input(listSupplierSkusInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const trimmedQuery = input.query?.trim();

		const where = {
			supplierId: input.supplierId,
			sku: {
				organizationId: input.organizationId,
				...(trimmedQuery
					? {
							OR: [
								{
									skuCode: {
										contains: trimmedQuery,
										mode: "insensitive" as const,
									},
								},
								{
									name: {
										contains: trimmedQuery,
										mode: "insensitive" as const,
									},
								},
							],
						}
					: {}),
			},
		};

		const [skuSuppliers, total] = await Promise.all([
			db.skuSupplier.findMany({
				where,
				orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
				take: input.limit,
				skip: input.offset,
				select: {
					id: true,
					isPrimary: true,
					vendorCode: true,
					leadTimeDays: true,
					moq: true,
					unitPrice: true,
					sku: {
						select: {
							id: true,
							skuCode: true,
							name: true,
							lifecycle: true,
						},
					},
				},
			}),
			db.skuSupplier.count({ where }),
		]);

		return { skuSuppliers, total };
	});
