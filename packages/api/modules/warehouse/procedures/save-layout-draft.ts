import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { saveLayoutDraft } from "../services/warehouse-service";

const layoutNodeSchema = z.object({
	id: z.string(),
	label: z.string().min(1).max(100),
	x: z.number().min(0).max(2000),
	y: z.number().min(0).max(2000),
	width: z.number().min(40).max(1200),
	height: z.number().min(40).max(1200),
	color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
});

const saveLayoutDraftInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	name: z.string().max(255).optional(),
	notes: z.string().max(2000).optional(),
	scene: z.object({
		viewMode: z.enum(["2d", "iso", "3d"]),
		nodes: z.array(layoutNodeSchema).max(200),
	}),
});

export const saveLayoutDraftProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/warehouses/{warehouseId}/layout/draft",
		tags: ["Warehouse Layout"],
		summary: "Save layout draft",
		description: "Create a new layout draft version from scene state.",
	})
	.input(saveLayoutDraftInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return saveLayoutDraft(input);
	});
