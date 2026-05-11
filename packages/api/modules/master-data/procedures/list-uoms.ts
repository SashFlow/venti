import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listUoms } from "../services/uoms-service";

const listUomsInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listUomsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/uoms",
		tags: ["Master Data"],
		summary: "List UOMs",
		description:
			"List units of measure with organization scope and offset pagination.",
	})
	.input(listUomsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listUoms(input);
	});
