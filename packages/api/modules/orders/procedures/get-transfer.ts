import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getTransferById } from "@repo/database";

export const getTransferProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/transfers/{transferId}",
		tags: ["Orders"],
		summary: "Get transfer by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			transferId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const transfer = await getTransferById(input);

		if (!transfer) {
			throw new ORPCError("NOT_FOUND", {
				message: "Transfer not found.",
			});
		}

		return { transfer };
	});
