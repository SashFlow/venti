import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getWarehouseById } from "../services/warehouse-service";

const getWarehouseInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	includeArchived: z.boolean().default(false),
});

export const getWarehouseProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/warehouses/{id}",
		tags: ["Warehouse"],
		summary: "Get warehouse",
		description: "Get warehouse details and latest layout summary.",
	})
	.input(getWarehouseInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return getWarehouseById(input);
	});
