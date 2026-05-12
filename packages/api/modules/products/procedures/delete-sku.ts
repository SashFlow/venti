import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { deleteSKU } from "../services/products-service";

const deleteSKUInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const deleteSKUProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/products/{id}",
		tags: ["Products"],
		summary: "Delete SKU",
		description: "Delete a SKU for an organization.",
	})
	.input(deleteSKUInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const deleted = await deleteSKU({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!deleted) {
			throw new ORPCError("NOT_FOUND", {
				message: "SKU not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "sku.delete",
			resource: "sku",
			resourceId: input.id,
		});

		return {
			deleted: true,
		};
	});
