import { createWarehouse } from "@repo/database";
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

const createWarehouseInput = z.object({
	organizationId: z.string(),
	name: z.string().min(1).max(255),
	code: z.string().min(1).max(50),
	timezone: z.string().max(50).optional(),
	sameReturn: z.boolean(),
	address: addressSchema,
	returnAddress: addressSchema.optional(),
});

export const createWarehouseProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/warehouses",
		tags: ["Warehouse"],
		summary: "Create warehouse",
		description: "Create a new warehouse for an organization.",
	})
	.input(createWarehouseInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return createWarehouse(input);
	});
