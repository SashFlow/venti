import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const findBatchLot = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/batches/{id}",
		tags: ["WMS", "Inventory"],
		summary: "Find a batch/lot record by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			batchLotId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const batchLot = await db.batchLot.findFirst({
			where: {
				id: input.batchLotId,
				organizationId: input.organizationId,
			},
			include: {
				variant: { select: { id: true, sku: true, name: true } },
			},
		});

		if (!batchLot)
			throw new ORPCError("NOT_FOUND", { message: "Batch/lot not found" });

		return { batchLot };
	});
