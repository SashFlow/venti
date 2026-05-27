import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listSKUs } from "@repo/database";

const listSKUsInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listSKUsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/products",
		tags: ["Products"],
		summary: "List SKUs",
		description: "List SKUs with organization scope and offset pagination.",
	})
	.input(listSKUsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listSKUs(input);
	});
