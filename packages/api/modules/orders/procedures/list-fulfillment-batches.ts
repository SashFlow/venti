import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { listFulfillmentBatches } from "../services/orders-service";

const listFulfillmentBatchesInput = z.object({
	organizationId: z.string(),
	status: z.array(z.string()).optional(),
	limit: z.number().min(1).max(100).default(20),
	offset: z.number().min(0).default(0),
});

export const listFulfillmentBatchesProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/fulfillment/batches",
		tags: ["Orders"],
		summary: "List fulfillment batches",
		description: "List fulfillment batches for the organization.",
	})
	.input(listFulfillmentBatchesInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		return listFulfillmentBatches(input);
	});
