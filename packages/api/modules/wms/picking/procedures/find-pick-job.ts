import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findPickJob = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/picking/jobs/{pickJobId}",
		tags: ["WMS", "Picking"],
		summary: "Get a pick job by ID",
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
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const pickJob = await db.pickJob.findUnique({
			where: { id: input.pickJobId },
			include: {
				lines: true,
				packingSlip: true,
				picker: { select: { name: true } },
			},
		});

		if (!pickJob || pickJob.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Pick job not found");
		}

		return { pickJob };
	});
