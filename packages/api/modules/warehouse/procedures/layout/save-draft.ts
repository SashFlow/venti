import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { saveWarehouseLayoutDraft } from "@repo/database";
import { layoutSceneSchema } from "./layout-schemas";

const saveDraftInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	name: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	scene: layoutSceneSchema,
});

export const saveLayoutDraftProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/layout/draft",
		tags: ["WarehouseLayout"],
		summary: "Save warehouse layout draft",
	})
	.input(saveDraftInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return saveWarehouseLayoutDraft(input);
	});

