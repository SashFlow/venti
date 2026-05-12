import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listPackageTypes } from "../services/packaging-service";

const listPackageTypesInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listPackageTypesProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/packaging",
		tags: ["Packaging"],
		summary: "List packaging",
		description:
			"List package types with organization scope and offset pagination.",
	})
	.input(listPackageTypesInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listPackageTypes(input);
	});
