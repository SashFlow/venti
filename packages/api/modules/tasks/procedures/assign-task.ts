import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const assignTaskInput = z.object({
	organizationId: z.string(),
	taskId: z.string(),
	userId: z.string(),
});

export const assignTaskProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/tasks/{taskId}/assign",
		tags: ["Tasks"],
		summary: "Assign Task",
		description: "Assign a task to an operator",
	})
	.input(assignTaskInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		const task = await db.warehouseTask.update({
			where: { id: input.taskId },
			data: {
				assignedUserId: input.userId,
				status: "ASSIGNED",
			},
		});

		return task;
	});
