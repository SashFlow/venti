import { z } from "zod";
import { requireOrganizationMembership } from "../../../../lib/organization-access";
import { protectedProcedure } from "../../../../orpc/procedures";
import { createLocation } from "../../services/location-service";

const createLocationInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	parentLocationId: z.string().optional(),
	code: z.string(),
	name: z.string().optional(),
	type: z.enum([
		"FLOOR",
		"ZONE",
		"AISLE",
		"RACK",
		"SHELF",
		"BIN",
		"PALLET",
		"DOCK",
		"STAGING",
		"PACKING",
	]),
	barcode: z.string().optional(),
});

export const createLocationProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/locations",
		tags: ["Location"],
		summary: "Create location",
	})
	.input(createLocationInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return createLocation(input);
	});
