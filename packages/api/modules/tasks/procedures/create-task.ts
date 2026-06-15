import { createWarehouseTask } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const createTaskProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/tasks",
		tags: ["Tasks"],
		summary: "Create warehouse task",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			type: z.enum([
				"RECEIVE",
				"PUTAWAY",
				"PICK",
				"PACK",
				"SHIP",
				"MOVE",
				"REPLENISHMENT",
				"CYCLE_COUNT",
				"QC",
			]),
			skuId: z.string().optional(),
			quantity: z.number().optional(),
			fromLocationId: z.string().optional(),
			toLocationId: z.string().optional(),
			priority: z
				.enum(["LOW", "NORMAL", "HIGH", "URGENT"])
				.optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		return createWarehouseTask(input);
	});
