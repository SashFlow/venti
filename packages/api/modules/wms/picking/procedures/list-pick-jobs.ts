import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

const PickJobStatusSchema = z.enum([
	"PENDING",
	"IN_PROGRESS",
	"COMPLETED",
	"EXCEPTION",
	"CANCELLED",
]);

export const listPickJobs = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/picking/jobs",
		tags: ["WMS", "Picking"],
		summary: "List pick jobs",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			status: PickJobStatusSchema.optional(),
			pickerId: z.string().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.PICKING,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const pickJobs = await db.pickJob.findMany({
			where: {
				organizationId: input.organizationId,
				...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
				...(input.status ? { status: input.status } : {}),
				...(input.pickerId ? { pickerId: input.pickerId } : {}),
			},
			include: {
				_count: { select: { lines: true } },
				picker: { select: { name: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		return { pickJobs };
	});
