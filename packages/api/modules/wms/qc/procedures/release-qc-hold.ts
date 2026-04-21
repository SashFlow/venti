import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const releaseQcHold = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/qc/holds/{holdId}/release",
		tags: ["WMS", "QC"],
		summary: "Release an inbound QC hold",
	})
	.input(
		z.object({
			organizationId: z.string(),
			holdId: z.string(),
			resolution: z.string().min(1),
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
				WMS_RESOURCES.QC,
				WMS_ACTIONS.APPROVE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const hold = await db.inboundQCHold.findUnique({
			where: { id: input.holdId },
		});

		if (!hold || hold.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "QC hold not found");
		}

		if (hold.status === "RELEASED") {
			throw new ORPCError("CONFLICT", "QC hold is already released");
		}

		const updatedHold = await db.inboundQCHold.update({
			where: { id: input.holdId },
			data: { status: "RELEASED" },
		});

		return { hold: updatedHold };
	});
