import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const listTasksInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string().optional(),
	status: z
		.enum(["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
		.optional(),
	userId: z.string().optional(),
	limit: z.number().default(50),
	offset: z.number().default(0),
});

export const listTasksProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/tasks",
		tags: ["Tasks"],
		summary: "List Tasks",
		description: "List warehouse tasks",
	})
	.input(listTasksInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		const where = {
			warehouse: {
				organizationId: input.organizationId,
				...(input.warehouseId ? { id: input.warehouseId } : {}),
			},
			...(input.status ? { status: input.status } : {}),
			...(input.userId ? { assignedUserId: input.userId } : {}),
		};

		const [tasks, total] = await Promise.all([
			db.warehouseTask.findMany({
				where,
				take: input.limit,
				skip: input.offset,
				orderBy: { createdAt: "desc" },
				include: {
					assignedUser: { select: { name: true } },
					sku: { select: { code: true } },
				},
			}),
			db.warehouseTask.count({ where }),
		]);

		return { tasks, total };
	});
