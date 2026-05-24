import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { listLocations } from "../../services/location-service";

const listLocationsInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
});

export const listLocationsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/locations",
		tags: ["Location"],
		summary: "List locations",
	})
	.input(listLocationsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listLocations(input);
	});
