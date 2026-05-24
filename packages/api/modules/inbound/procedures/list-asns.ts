import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const listAsnsInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string().optional(),
	limit: z.number().default(20),
	offset: z.number().default(0),
});

export const listAsnsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/inbound/asns",
		tags: ["Inbound"],
		summary: "List ASNs",
		description: "List Advanced Shipping Notices",
	})
	.input(listAsnsInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		const where = {
			warehouse: {
				organizationId: input.organizationId,
				...(input.warehouseId ? { id: input.warehouseId } : {}),
			},
		};

		const [asns, total] = await Promise.all([
			db.advancedShippingNotice.findMany({
				where,
				take: input.limit,
				skip: input.offset,
				orderBy: { createdAt: "desc" },
				include: {
					supplier: { select: { name: true } },
				},
			}),
			db.advancedShippingNotice.count({ where }),
		]);

		return { asns, total };
	});
