import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { saveWarehouseLayout } from "@repo/database";
import { layoutAssetInputSchema, layoutLocationInputSchema } from "./layout-schemas";

const saveLayoutInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locations: z.array(layoutLocationInputSchema),
	assets: z.array(layoutAssetInputSchema).optional(),
});

export const saveLayoutProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/layout/save",
		tags: ["WarehouseLayout"],
		summary: "Save warehouse layout (overwrites all locations)",
	})
	.input(saveLayoutInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return saveWarehouseLayout(input);
	});
