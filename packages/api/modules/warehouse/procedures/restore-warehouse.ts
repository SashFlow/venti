import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { restoreWarehouse } from "../services/warehouse-service";

const restoreWarehouseInput = z.object({
	organizationId: z.string(),
	id: z.string(),
});

export const restoreWarehouseProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/warehouses/{id}/restore",
		tags: ["Warehouse"],
		summary: "Restore warehouse",
		description: "Restore an archived warehouse for an organization.",
	})
	.input(restoreWarehouseInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return restoreWarehouse(input);
	});
