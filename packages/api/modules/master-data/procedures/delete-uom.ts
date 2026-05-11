import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { deleteUom } from "../services/uoms-service";

const deleteUomInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const deleteUomProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/master-data/uoms/{id}",
		tags: ["Master Data"],
		summary: "Delete UOM",
		description: "Delete a unit of measure for an organization.",
	})
	.input(deleteUomInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const deleted = await deleteUom({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!deleted) {
			throw new ORPCError("NOT_FOUND", {
				message: "UOM not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "uom.delete",
			resource: "uom",
			resourceId: input.id,
		});

		return {
			deleted: true,
		};
	});
