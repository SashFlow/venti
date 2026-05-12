import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { updateShipmentStatus } from "../services/orders-service";

const updateShipmentStatusInput = z.object({
	organizationId: z.string(),
	shipmentId: z.string(),
	status: z.enum(["READY_TO_SHIP", "DISPATCHED", "DELIVERED"]),
});

export const updateShipmentStatusProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/orders/shipments/{shipmentId}/status",
		tags: ["Orders"],
		summary: "Update shipment status",
		description: "Update shipment status for fulfillment operations.",
	})
	.input(updateShipmentStatusInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const shipment = await updateShipmentStatus(input);

		if (!shipment) {
			throw new ORPCError("NOT_FOUND", {
				message: "Shipment not found.",
			});
		}

		return { shipment };
	});
