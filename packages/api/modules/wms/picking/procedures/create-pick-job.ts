import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const createPickJob = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/picking/jobs",
		tags: ["WMS", "Picking"],
		summary: "Create a pick job with lines",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			waveId: z.string().optional(),
			batchPickId: z.string().optional(),
			pickerId: z.string().optional(),
			lines: z.array(
				z.object({
					variantId: z.string(),
					binId: z.string(),
					qtyToPick: z.number().positive(),
				}),
			),
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

		// If waveId provided, verify it belongs to org
		if (input.waveId) {
			const wave = await db.pickingWave.findUnique({
				where: { id: input.waveId },
			});
			if (!wave || wave.organizationId !== input.organizationId) {
				throw new ORPCError("NOT_FOUND", "Picking wave not found");
			}
		}

		const pickJob = await db.$transaction(async (tx) => {
			const pickJobNumber = await generateDocNumber(tx, {
				organizationId: input.organizationId,
				prefix: "PJ",
				countFn: () =>
					tx.pickJob.count({
						where: { organizationId: input.organizationId },
					}),
			});

			return tx.pickJob.create({
				data: {
					organizationId: input.organizationId,
					warehouseId: input.warehouseId,
					pickJobNumber,
					waveId: input.waveId,
					batchPickId: input.batchPickId,
					pickerId: input.pickerId,
					status: "PENDING",
					lines: {
						create: input.lines.map((line) => ({
							variantId: line.variantId,
							binId: line.binId,
							qtyToPick: line.qtyToPick,
							qtyPicked: 0,
						})),
					},
				},
				include: {
					lines: true,
					picker: { select: { name: true } },
				},
			});
		});

		return { pickJob };
	});
