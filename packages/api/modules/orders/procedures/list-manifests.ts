import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listManifests } from "@repo/database";

const listManifestsInput = z.object({
	organizationId: z.string(),
	carrierId: z.string().optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
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
