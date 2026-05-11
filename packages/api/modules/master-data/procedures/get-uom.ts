import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getUomById } from "../services/uoms-service";

const getUomInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const getUomProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/master-data/uoms/{id}",
		tags: ["Master Data"],
		summary: "Get UOM",
		description:
			"Fetch a unit of measure by id within the organization scope.",
	})
	.input(getUomInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const uom = await getUomById({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!uom) {
			throw new ORPCError("NOT_FOUND", {
				message: "UOM not found.",
			});
		}

		return { uom };
	});
