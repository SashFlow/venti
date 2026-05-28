import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { loadWarehouseLayout } from "@repo/database";

const loadLayoutInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
});

export const loadLayoutProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/layout",
		tags: ["WarehouseLayout"],
		summary: "Load warehouse layout (all locations)",
	})
	.input(loadLayoutInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return loadWarehouseLayout(input);
	});
