import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getPackageTypeById } from "../services/packaging-service";

const getPackageTypeInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const getPackageTypeProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/packaging/{id}",
		tags: ["Packaging"],
		summary: "Get package type",
		description:
			"Fetch a single package type by id within organization scope.",
	})
	.input(getPackageTypeInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const packageType = await getPackageTypeById({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!packageType) {
			throw new ORPCError("NOT_FOUND", {
				message: "Package type not found.",
			});
		}

		return { packageType };
	});
