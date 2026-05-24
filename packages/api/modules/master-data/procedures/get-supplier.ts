import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getSupplierById } from "@repo/database";

const getSupplierInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const getSupplierProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/suppliers/{id}",
		tags: ["Master Data"],
		summary: "Get supplier",
		description:
			"Fetch a single supplier by id within the organization scope.",
	})
	.input(getSupplierInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const supplier = await getSupplierById({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!supplier) {
			throw new ORPCError("NOT_FOUND", {
				message: "Supplier not found.",
			});
		}

		return { supplier };
	});
