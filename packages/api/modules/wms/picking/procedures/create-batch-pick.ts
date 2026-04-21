import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const createBatchPick = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/picking/batch",
		tags: ["WMS", "Picking"],
		summary: "Create a batch pick",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
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
				WMS_ACTIONS.CREATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify warehouse belongs to org
		const warehouse = await db.warehouse.findUnique({
			where: { id: input.warehouseId },
		});
		if (!warehouse || warehouse.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "Warehouse not found");
		}

		const batchPick = await db.$transaction(async (tx) => {
			const batchNumber = await generateDocNumber(tx, {
				organizationId: input.organizationId,
				prefix: "BPK",
				countFn: () =>
					tx.batchPick.count({
						where: { organizationId: input.organizationId },
					}),
			});

			return tx.batchPick.create({
				data: {
					organizationId: input.organizationId,
					warehouseId: input.warehouseId,
					batchNumber,
					pickerId: input.pickerId,
					status: "PENDING",
				},
			});
		});

		return { batchPick };
	});
