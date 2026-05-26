import { updateWarehouse } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const addressSchema = z.object({
	line1: z.string().min(1),
	line2: z.string().optional(),
	city: z.string().min(1),
	state: z.string().min(1),
	zip: z.string().min(1),
	country: z.string().min(1),
});

const updateWarehouseInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	name: z.string().min(1).max(255),
	code: z.string().min(1).max(50),
	timezone: z.string().max(50).optional(),
	sameReturn: z.boolean().optional(),
	address: addressSchema.optional(),
	returnAddress: addressSchema.nullable().optional(),
});

export const updateWarehouseProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/warehouses/{id}",
		tags: ["Warehouse"],
		summary: "Update warehouse",
		description:
			"Update core warehouse profile fields and its main address.",
	})
	.input(updateWarehouseInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return updateWarehouse(input);
	});
