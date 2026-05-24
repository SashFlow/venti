import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listSuppliers } from "@repo/database";

const listSuppliersInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listSuppliersProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/suppliers",
		tags: ["Master Data"],
		summary: "List suppliers",
		description:
			"List suppliers with organization scope and offset pagination.",
	})
	.input(listSuppliersInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listSuppliers(input);
	});
