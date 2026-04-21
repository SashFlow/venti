import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

const CycleCountStatusSchema = z.enum([
	"SCHEDULED",
	"IN_PROGRESS",
	"COMPLETED",
	"CANCELLED",
]);

export const listCycleCounts = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/cycle-counts",
		tags: ["WMS", "CycleCounts"],
		summary: "List cycle counts",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			status: CycleCountStatusSchema.optional(),
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
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const cycleCounts = await db.cycleCount.findMany({
			where: {
				organizationId: input.organizationId,
				...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
				...(input.status ? { status: input.status } : {}),
			},
			include: {
				_count: { select: { lines: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		return { cycleCounts };
	});
