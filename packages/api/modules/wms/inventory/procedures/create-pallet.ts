import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createPallet = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/pallets",
		tags: ["WMS", "Inventory"],
		summary: "Create a pallet record",
	})
	.input(
		z.object({
			organizationId: z.string(),
			palletCode: z.string().min(1),
			warehouseId: z.string(),
			binId: z.string().optional(),
			variantId: z.string().optional(),
			batchLotId: z.string().optional(),
			qty: z.number().positive(),
			weightKg: z.number().positive().optional(),
			mfgDate: z.string().datetime().optional(),
			forkliftRequired: z.boolean().optional(),
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
				WMS_ACTIONS.CREATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Enforce unique [organizationId, palletCode]
		const duplicate = await db.palletRecord.findUnique({
			where: {
				organizationId_palletCode: {
					organizationId: input.organizationId,
					palletCode: input.palletCode,
				},
			},
			select: { id: true },
		});
		if (duplicate)
			throw new ORPCError("CONFLICT", {
				message: "A pallet with this code already exists in this organization",
			});

		const pallet = await db.palletRecord.create({
			data: {
				organizationId: input.organizationId,
				palletCode: input.palletCode,
				warehouseId: input.warehouseId,
				binId: input.binId,
				variantId: input.variantId,
				batchLotId: input.batchLotId,
				qty: input.qty,
				weightKg: input.weightKg,
				mfgDate: input.mfgDate ? new Date(input.mfgDate) : undefined,
				forkliftRequired: input.forkliftRequired ?? false,
				status: "ACTIVE",
			},
		});

		return { pallet };
	});
