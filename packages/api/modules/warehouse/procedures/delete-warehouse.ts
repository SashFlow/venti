import { archiveWarehouse } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const deleteWarehouseInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const deleteWarehouseProcedure = protectedProcedure
	.route({
		method: "DELETE",
		path: "/warehouses/{id}",
		tags: ["Warehouse"],
		summary: "Delete warehouse",
		description: "Delete a warehouse for an organization.",
	})
	.input(deleteWarehouseInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return archiveWarehouse(input);
	});
