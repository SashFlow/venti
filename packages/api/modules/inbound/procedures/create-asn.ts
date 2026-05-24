import { db } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const createAsnInput = z.object({
	organizationId: z.string(),
	warehouseId: z.string(),
	supplierId: z.string(),
	asnNumber: z.string(),
	purchaseOrderId: z.string().optional(),
	expectedArrival: z.date().optional(),
	pallets: z.number().optional(),
	cartons: z.number().optional(),
});

export const createAsnProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/inbound/asns",
		tags: ["Inbound"],
		summary: "Create ASN",
		description: "Create a new Advanced Shipping Notice",
	})
	.input(createAsnInput)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		const asn = await db.advancedShippingNotice.create({
			data: {
				warehouseId: input.warehouseId,
				supplierId: input.supplierId,
				asnNumber: input.asnNumber,
				purchaseOrderId: input.purchaseOrderId,
				expectedArrival: input.expectedArrival,
				pallets: input.pallets,
				cartons: input.cartons,
				status: "CREATED",
			},
		});

		return asn;
	});
