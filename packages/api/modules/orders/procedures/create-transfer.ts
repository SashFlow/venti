import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createTransfer } from "../services/orders-service";

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
			inventoryItemId: z.string(),
			fromStorageUnitId: z.string().optional(),
			toStorageUnitId: z.string().optional(),
			quantity: z.number().positive(),
			referenceNumber: z.string().optional(),
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
