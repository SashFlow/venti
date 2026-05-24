import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getShipmentById } from "@repo/database";

export const getShipmentProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/shipments/{shipmentId}",
		tags: ["Orders"],
		summary: "Get shipment by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			shipmentId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const shipment = await getShipmentById(input);

		if (!shipment) {
			throw new ORPCError("NOT_FOUND", {
				message: "Shipment not found.",
			});
		}

		return { shipment };
	});
