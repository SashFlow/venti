import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findAdjustment = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/adjustments/{adjustmentId}",
		tags: ["WMS", "Adjustments"],
		summary: "Get a stock adjustment by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			adjustmentId: z.string(),
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

		const adjustment = await db.stockAdjustment.findUnique({
			where: { id: input.adjustmentId },
			include: {
				requestedBy: { select: { name: true } },
				approvedBy: { select: { name: true } },
			},
		});

		if (!adjustment || adjustment.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Stock adjustment not found");
		}

		return { adjustment };
	});
