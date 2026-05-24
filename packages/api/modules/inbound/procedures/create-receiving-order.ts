import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const createReceivingOrderInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	purchaseOrderId: z.string().optional(),
	asnId: z.string().optional(),
});

export const createReceivingOrderProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/inbound/receiving",
		tags: ["Inbound"],
		summary: "Create Receiving Order",
		description: "Start a receiving session",
	})
	.input(createReceivingOrderInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		if (!input.purchaseOrderId && !input.asnId) {
			throw new Error("Must provide either PO ID or ASN ID");
		}

		const order = await db.receivingOrder.create({
			data: {
				warehouseId: input.warehouseId,
				purchaseOrderId: input.purchaseOrderId,
				asnId: input.asnId,
				status: "PENDING",
			},
		});

		return order;
	});
