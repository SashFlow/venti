import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const consumeConsignment = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/consignment/{id}/consume",
		tags: ["WMS", "Inventory"],
		summary: "Consume quantity from a consignment stock record",
	})
	.input(
		z.object({
			organizationId: z.string(),
			consignmentId: z.string(),
			qty: z.number().positive(),
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

		const existing = await db.consignmentStock.findFirst({
			where: {
				id: input.consignmentId,
				organizationId: input.organizationId,
			},
		});

		if (!existing)
			throw new ORPCError("NOT_FOUND", { message: "Consignment record not found" });

		// qty must be a number for comparison — Decimal comes from Prisma as Decimal object
		const currentQty = Number(existing.qty);
		if (input.qty > currentQty) {
			throw new ORPCError("BAD_REQUEST", {
				message: `Cannot consume ${input.qty} — only ${currentQty} available`,
			});
		}

		const newQty = currentQty - input.qty;

		const consignment = await db.consignmentStock.update({
			where: { id: input.consignmentId },
			data: { qty: newQty },
		});

		return { consignment };
	});
