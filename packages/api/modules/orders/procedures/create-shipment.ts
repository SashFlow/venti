import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createShipment } from "@repo/database";

export const createShipmentProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/shipments",
		tags: ["Orders"],
		summary: "Create shipment",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			salesOrderId: z.string(),
			shipmentNumber: z.string().min(1).max(100),
			carrierId: z.string().optional(),
			dockDoorId: z.string().optional(),
			trackingNumber: z.string().optional(),
			scheduledAt: z.coerce.date().optional(),
			notes: z.string().optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return createShipment(input);
	});
