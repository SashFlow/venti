import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { publishWarehouseLayoutFromDraft } from "@repo/database";

const publishInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
});

export const publishLayoutProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/layout/publish",
		tags: ["WarehouseLayout"],
		summary: "Publish layout draft (overwrites warehouse locations/assets)",
	})
	.input(publishInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return publishWarehouseLayoutFromDraft(input);
	});

