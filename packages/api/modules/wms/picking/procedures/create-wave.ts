import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const createWave = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/picking/waves",
		tags: ["WMS", "Picking"],
		summary: "Create a picking wave",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			criteria: z.string().optional(),
			metadata: z.record(z.unknown()).optional(),
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

		const wave = await db.$transaction(async (tx) => {
			const waveNumber = await generateDocNumber(tx, {
				organizationId: input.organizationId,
				prefix: "WV",
				countFn: () =>
					tx.pickingWave.count({
						where: { organizationId: input.organizationId },
					}),
			});

			return tx.pickingWave.create({
				data: {
					organizationId: input.organizationId,
					warehouseId: input.warehouseId,
					waveNumber,
					criteria: input.criteria,
					status: "DRAFT",
					metadata: input.metadata,
				},
				include: {
					_count: { select: { pickJobs: true } },
				},
			});
		});

		return { wave };
	});
