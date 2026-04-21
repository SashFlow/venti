import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createBin = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/aisles/:aisleId/bins",
		tags: ["WMS", "Warehouses"],
		summary: "Create a bin within an aisle",
	})
	.input(
		z.object({
			organizationId: z.string(),
			aisleId: z.string(),
			code: z.string().min(1).max(50),
			name: z.string().min(1).max(200),
			type: z
				.enum(["BIN", "PALLET_SLOT", "MEZZANINE_SHELF", "DOCK", "STAGING"])
				.optional(),
			rack: z.string().optional(),
			rackLevel: z.string().optional(),
			sequence: z.number().int().min(0).optional(),
			forkliftRequired: z.boolean().optional(),
			maxWeightKg: z.number().positive().optional(),
			maxVolumeM3: z.number().positive().optional(),
			metadata: z.record(z.unknown()).optional(),
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
				WMS_RESOURCES.WAREHOUSE,
				WMS_ACTIONS.CREATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Verify aisle belongs to an org-owned warehouse
		const aisle = await db.warehouseAisle.findFirst({
			where: {
				id: input.aisleId,
				zone: {
					level: {
						warehouse: { organizationId: input.organizationId },
					},
				},
			},
		});
		if (!aisle) throw new ORPCError("NOT_FOUND");

		const { organizationId, aisleId, maxWeightKg, maxVolumeM3, ...rest } = input;

		const bin = await db.warehouseBin.create({
			data: {
				aisleId,
				...rest,
				...(maxWeightKg !== undefined ? { maxWeightKg } : {}),
				...(maxVolumeM3 !== undefined ? { maxVolumeM3 } : {}),
			},
		});

		return { bin };
	});
