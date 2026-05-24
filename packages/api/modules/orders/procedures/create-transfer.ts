import { createTransfer } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const createTransferProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/transfers",
		tags: ["Orders"],
		summary: "Create internal transfer",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			skuId: z.string(),
			fromLocationId: z.string().optional(),
			toLocationId: z.string().optional(),
			quantity: z.number().positive(),
			referenceId: z.string().optional(),
			notes: z.string().optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return createTransfer({
			...input,
			performedByUserId: user.id,
		});
	});
