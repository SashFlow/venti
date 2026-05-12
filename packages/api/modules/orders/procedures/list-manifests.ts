import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listManifests } from "../services/orders-service";

const listManifestsInput = z.object({
	organizationId: z.string(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listManifestsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/manifests",
		tags: ["Orders"],
		summary: "List manifests",
		description: "List outbound manifest records for the organization.",
	})
	.input(listManifestsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listManifests(input);
	});
