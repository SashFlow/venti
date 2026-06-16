import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { getWarehouseLayoutDraft } from "@repo/database";

const getDraftInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
});

export const getLayoutDraftProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/layout/draft",
		tags: ["WarehouseLayout"],
		summary: "Get warehouse layout draft",
	})
	.input(getDraftInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return getWarehouseLayoutDraft(input);
	});

