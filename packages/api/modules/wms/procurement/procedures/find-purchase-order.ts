import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findPurchaseOrder = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/purchase-orders/{purchaseOrderId}",
		tags: ["WMS", "Procurement"],
		summary: "Get a purchase order by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			purchaseOrderId: z.string(),
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
				WMS_RESOURCES.PROCUREMENT,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const purchaseOrder = await db.purchaseOrder.findFirst({
			where: {
				id: input.purchaseOrderId,
				organizationId: input.organizationId,
			},
			include: {
				supplier: true,
				warehouse: { select: { id: true, name: true, code: true } },
				lines: {
					include: {
						// variant with sku/name
						// POLine has variantId and uomId fields directly
					},
				},
				landedCosts: true,
				grns: {
					select: {
						id: true,
						grnNumber: true,
						status: true,
						createdAt: true,
						workflowType: true,
					},
				},
			},
		});

		if (!purchaseOrder) throw new ORPCError("NOT_FOUND", "Purchase order not found");

		// Fetch variant and UOM details for each line separately (POLine has no direct relation)
		const lineDetails = await Promise.all(
			purchaseOrder.lines.map(async (line) => {
				const [variant, uom] = await Promise.all([
					db.productVariant.findUnique({
						where: { id: line.variantId },
						select: { id: true, sku: true, name: true },
					}),
					db.unitOfMeasure.findUnique({
						where: { id: line.uomId },
						select: { id: true, code: true, name: true },
					}),
				]);
				return { ...line, variant, uom };
			}),
		);

		return {
			purchaseOrder: {
				...purchaseOrder,
				lines: lineDetails,
			},
		};
	});
