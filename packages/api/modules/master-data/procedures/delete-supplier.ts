import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { deleteSupplier } from "@repo/database";

const deleteSupplierInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const deleteSupplierProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/master-data/suppliers/{id}",
		tags: ["Master Data"],
		summary: "Delete supplier",
		description: "Delete a supplier for an organization.",
	})
	.input(deleteSupplierInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const deleted = await deleteSupplier({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!deleted) {
			throw new ORPCError("NOT_FOUND", {
				message: "Supplier not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "supplier.delete",
			resource: "supplier",
			resourceId: input.id,
		});

		return {
			deleted: true,
		};
	});
