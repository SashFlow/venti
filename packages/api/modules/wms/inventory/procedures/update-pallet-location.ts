import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const updatePalletLocation = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/pallets/{id}/location",
		tags: ["WMS", "Inventory"],
		summary: "Update pallet location",
	})
	.input(
		z.object({
			organizationId: z.string(),
			palletId: z.string(),
			warehouseId: z.string(),
			binId: z.string().optional().nullable(),
			status: z.string().optional(),
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
				WMS_ACTIONS.UPDATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const existing = await db.palletRecord.findFirst({
			where: {
				id: input.palletId,
				organizationId: input.organizationId,
			},
			select: { id: true },
		});

		if (!existing)
			throw new ORPCError("NOT_FOUND", { message: "Pallet not found" });

		const pallet = await db.palletRecord.update({
			where: { id: input.palletId },
			data: {
				warehouseId: input.warehouseId,
				binId: input.binId ?? null,
				...(input.status !== undefined && { status: input.status }),
			},
			include: {
				bin: { select: { id: true, code: true, name: true } },
			},
		});

		return { pallet };
	});
