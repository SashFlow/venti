import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { publishLayoutVersion } from "../services/warehouse-service";

const publishLayoutVersionInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	layoutVersionId: z.string(),
});

export const publishLayoutVersionProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/warehouses/{warehouseId}/layout/publish",
		tags: ["Warehouse Layout"],
		summary: "Publish layout version",
		description: "Publish an existing draft layout version.",
	})
	.input(publishLayoutVersionInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return publishLayoutVersion({
			...input,
			publishedByUserId: user.id,
		});
	});
