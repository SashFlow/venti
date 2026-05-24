import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { updateLocationHierarchy } from "../../services/location-service";

const updateLocationHierarchyInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	updates: z.array(
		z.object({
			id: z.string(),
			parentLocationId: z.string().nullable(),
			sequence: z.number(),
		}),
	),
});

export const updateLocationHierarchyProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/locations/hierarchy",
		tags: ["Location"],
		summary: "Update locations hierarchy",
	})
	.input(updateLocationHierarchyInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return updateLocationHierarchy(input);
	});
