import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { bulkUpdateShipmentStatuses } from "@repo/database";

const bulkUpdateShipmentStatusesInput = z.object({
	organizationId: z.string(),
	updates: z
		.array(
			z.object({
				shipmentId: z.string(),
				status: z.enum([
					"PENDING",
					"PACKED",
					"SHIPPED",
					"DELIVERED",
					"FAILED",
				]),
			}),
		)
		.min(1)
		.max(200),
});

export const bulkUpdateShipmentStatusesProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/orders/shipments/status/bulk",
		tags: ["Orders"],
		summary: "Bulk update shipment statuses",
		description:
			"Update statuses for multiple shipments in a single request for fulfillment operations.",
	})
	.input(bulkUpdateShipmentStatusesInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const result = await bulkUpdateShipmentStatuses(input);

		return result;
	});
