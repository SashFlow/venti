import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getLatestLayoutVersion } from "../services/warehouse-service";

const getLatestLayoutInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
});

export const getLatestLayoutProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/warehouses/{warehouseId}/layout/latest",
		tags: ["Warehouse Layout"],
		summary: "Get latest warehouse layout",
		description: "Fetch the most recent layout version for a warehouse.",
	})
	.input(getLatestLayoutInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return getLatestLayoutVersion(input);
	});
