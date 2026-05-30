import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { db } from "@repo/database";

const getCostLedgerInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string().optional(),
	limit: z.number().default(50),
	offset: z.number().default(0),
});

export const getCostLedgerProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/cost-ledger",
		tags: ["Analytics", "Financials"],
		summary: "Get the cost ledger entries",
	})
	.input(getCostLedgerInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		
		const entries = await db.costLedger.findMany({
			where: {
				organizationId: input.organizationId,
				...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
			},
			orderBy: { createdAt: "desc" },
			take: input.limit,
			skip: input.offset,
		});

		const totalCount = await db.costLedger.count({
			where: {
				organizationId: input.organizationId,
				...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
			},
		});

		return { entries, totalCount };
	});
