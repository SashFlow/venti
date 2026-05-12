import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { updateWarehouse } from "../services/warehouse-service";

const updateWarehouseInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	name: z.string().min(1).max(255),
	code: z.string().min(1).max(50),
	description: z.string().max(2000).optional(),
	timezone: z.string().max(50).optional(),
	address: z
		.object({
			addressLine1: z.string().max(255).optional(),
			addressLine2: z.string().max(255).optional(),
			city: z.string().max(100).optional(),
			state: z.string().max(100).optional(),
			zip: z.string().max(30).optional(),
			country: z.string().max(100).optional(),
		})
		.optional(),
	returnAddress: z
		.object({
			addressLine1: z.string().max(255).optional(),
			addressLine2: z.string().max(255).optional(),
			city: z.string().max(100).optional(),
			state: z.string().max(100).optional(),
			zip: z.string().max(30).optional(),
			country: z.string().max(100).optional(),
		})
		.nullable()
		.optional(),
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
