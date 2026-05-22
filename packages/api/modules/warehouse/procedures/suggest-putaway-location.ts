import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { suggestPutawayLocations } from "../services/putaway-service";

export const suggestPutawayLocationProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/warehouses/{warehouseId}/scanner/putaway-suggestions",
		tags: ["Scanner"],
		summary: "Get putaway location suggestions for a SKU",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			skuId: z.string(),
			limit: z.number().int().min(1).max(10).default(3),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const suggestions = await suggestPutawayLocations({
			warehouseId: input.warehouseId,
			skuId: input.skuId,
			limit: input.limit,
		});

		return { suggestions };
	});
