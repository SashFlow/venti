import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const rejectAdjustment = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/adjustments/{adjustmentId}/reject",
		tags: ["WMS", "Adjustments"],
		summary: "Reject a pending stock adjustment",
	})
	.input(
		z.object({
			organizationId: z.string(),
			adjustmentId: z.string(),
			reason: z.string().optional(),
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
				WMS_ACTIONS.APPROVE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.stockAdjustment.findUnique({
			where: { id: input.adjustmentId },
		});

		if (!existing || existing.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Stock adjustment not found");
		}

		if (existing.status !== "PENDING_APPROVAL") {
			throw new ORPCError(
				"CONFLICT",
				`Adjustment is not pending approval (current: ${existing.status})`,
			);
		}

		const adjustment = await db.stockAdjustment.update({
			where: { id: input.adjustmentId },
			data: {
				status: "REJECTED",
				approvedById: context.user.id,
				approvedAt: new Date(),
				...(input.reason ? { notes: input.reason } : {}),
			},
			include: {
				requestedBy: { select: { name: true } },
				approvedBy: { select: { name: true } },
			},
		});

		return { adjustment };
	});
