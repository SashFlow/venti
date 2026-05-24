import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getInventoryTimeline } from "@repo/database";

const getInventoryTimelineInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string().optional(),
	skuId: z.string().optional(),
	limit: z.number().default(50),
});

export const getInventoryTimelineProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/inventory/timeline",
		tags: ["Inventory"],
		summary: "Get inventory timeline/transactions",
	})
	.input(getInventoryTimelineInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return getInventoryTimeline(input);
	});
