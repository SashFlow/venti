import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listWarehouses } from "@repo/database";

const listWarehousesInput = z.object({
	organizationId: z.string(),
	query: z.string().optional(),
	status: z.enum(["active", "INACTIVE", "all"]).default("active"),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listWarehousesProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/warehouses",
		tags: ["Warehouse"],
		summary: "List warehouses",
		description:
			"List organization warehouses with lightweight stats and latest layout version.",
	})
	.input(listWarehousesInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listWarehouses(input);
	});
