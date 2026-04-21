import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findWave = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/picking/waves/{waveId}",
		tags: ["WMS", "Picking"],
		summary: "Get a picking wave by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
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

		const wave = await db.pickingWave.findUnique({
			where: { id: input.waveId },
			include: {
				pickJobs: {
					select: {
						id: true,
						pickJobNumber: true,
						status: true,
						pickerId: true,
						_count: { select: { lines: true } },
					},
				},
			},
		});

		if (!wave || wave.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Picking wave not found");
		}

		return { wave };
	});
