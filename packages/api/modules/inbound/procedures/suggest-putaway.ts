import { suggestPutawayLocation } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const suggestPutawayProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/inbound/suggest-putaway",
		tags: ["Inbound"],
		summary: "Suggest putaway bin for received SKU",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			skuId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return suggestPutawayLocation(input);
	});
