import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const startPickJob = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/picking/jobs/{pickJobId}/start",
		tags: ["WMS", "Picking"],
		summary: "Start a pending pick job",
	})
	.input(
		z.object({
			organizationId: z.string(),
			pickJobId: z.string(),
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
				WMS_ACTIONS.PICK,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.pickJob.findUnique({
			where: { id: input.pickJobId },
		});

		if (!existing || existing.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Pick job not found");
		}

		if (existing.status !== "PENDING") {
			throw new ORPCError(
				"CONFLICT",
				`Pick job cannot be started (current status: ${existing.status})`,
			);
		}

		const pickJob = await db.pickJob.update({
			where: { id: input.pickJobId },
			data: {
				status: "IN_PROGRESS",
				startedAt: new Date(),
				pickerId: context.user.id,
			},
			include: {
				lines: true,
				picker: { select: { name: true } },
			},
		});

		return { pickJob };
	});
