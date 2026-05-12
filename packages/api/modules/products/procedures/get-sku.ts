import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getSKUById } from "../services/products-service";

const getSKUInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const getSKUProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/products/{id}",
		tags: ["Products"],
		summary: "Get SKU",
		description: "Fetch a single SKU by id within organization scope.",
	})
	.input(getSKUInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const sku = await getSKUById({
			organizationId: input.organizationId,
			id: input.id,
		});

		if (!sku) {
			throw new ORPCError("NOT_FOUND", {
				message: "SKU not found.",
			});
		}

		return { sku };
	});
