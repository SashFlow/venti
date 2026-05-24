import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listFulfillmentShipments } from "@repo/database";

const listFulfillmentShipmentsInput = z.object({
	organizationId: z.string(),
	status: z.array(z.string()).optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listFulfillmentShipmentsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/fulfillment/shipments",
		tags: ["Orders"],
		summary: "List unbatched shipments",
		description: "List shipments pending fulfillment handling.",
	})
	.input(listFulfillmentShipmentsInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listFulfillmentShipments(input);
	});
