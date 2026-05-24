import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { deleteLocation } from "../../services/location-service";

const deleteLocationInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locationId: z.string(),
});

export const deleteLocationProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/locations",
		tags: ["Location"],
		summary: "Delete location",
	})
	.input(deleteLocationInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return deleteLocation(input);
	});
