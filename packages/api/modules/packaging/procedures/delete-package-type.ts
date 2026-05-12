import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { deletePackageType } from "../services/packaging-service";

const deletePackageTypeInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const deletePackageTypeProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/packaging/{id}",
		tags: ["Packaging"],
		summary: "Delete package type",
		description: "Delete a package type for an organization.",
	})
	.input(deletePackageTypeInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const deleted = await deletePackageType({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!deleted) {
			throw new ORPCError("NOT_FOUND", {
				message: "Package type not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "packaging.delete",
			resource: "package_type",
			resourceId: input.id,
		});

		return {
			deleted: true,
		};
	});
