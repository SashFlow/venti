import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

const WaveStatusSchema = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]);

export const listWaves = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/picking/waves",
		tags: ["WMS", "Picking"],
		summary: "List picking waves",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			status: WaveStatusSchema.optional(),
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

		const waves = await db.pickingWave.findMany({
			where: {
				organizationId: input.organizationId,
				...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
				...(input.status ? { status: input.status } : {}),
			},
			include: {
				_count: { select: { pickJobs: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		return { waves };
	});
