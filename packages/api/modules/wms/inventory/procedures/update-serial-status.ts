import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

const VALID_STATUSES = [
	"AVAILABLE",
	"IN_STOCK",
	"DISPATCHED",
	"SOLD",
	"SCRAPPED",
	"IN_REPAIR",
] as const;

export const updateSerialStatus = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/serials/{id}/status",
		tags: ["WMS", "Inventory"],
		summary: "Update serial number status",
	})
	.input(
		z.object({
			organizationId: z.string(),
			serialNumberId: z.string(),
			status: z.enum(VALID_STATUSES),
			warehouseId: z.string().optional(),
			binId: z.string().optional(),
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

		const existing = await db.serialNumber.findFirst({
			where: {
				id: input.serialNumberId,
				organizationId: input.organizationId,
			},
			select: { id: true },
		});

		if (!existing)
			throw new ORPCError("NOT_FOUND", { message: "Serial number not found" });

		const serial = await db.serialNumber.update({
			where: { id: input.serialNumberId },
			data: {
				status: input.status,
				...(input.warehouseId !== undefined && {
					warehouseId: input.warehouseId,
				}),
				...(input.binId !== undefined && { binId: input.binId }),
			},
			include: {
				variant: { select: { id: true, sku: true, name: true } },
			},
		});

		return { serial };
	});
