import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { returnToSupplier } from "@repo/database";

const returnToSupplierInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	locationId: z.string(),
	skuId: z.string(),
	quantity: z.number().positive(),
	freightCost: z.number().nonnegative(),
});

export const returnToSupplierProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/returns/return-to-supplier",
		tags: ["Returns", "Procurement"],
		summary: "Return to supplier (RTV) and log credit",
	})
	.input(returnToSupplierInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return returnToSupplier({ ...input, userId: user.id });
	});
