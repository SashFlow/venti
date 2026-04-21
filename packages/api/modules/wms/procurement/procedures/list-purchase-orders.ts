import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listPurchaseOrders = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/purchase-orders",
		tags: ["WMS", "Procurement"],
		summary: "List purchase orders",
	})
	.input(
		z.object({
			organizationId: z.string(),
			status: z
				.enum(["DRAFT", "SUBMITTED", "APPROVED", "PARTIAL", "RECEIVED", "CANCELLED"])
				.optional(),
			supplierId: z.string().optional(),
			warehouseId: z.string().optional(),
			poType: z.enum(["STANDARD", "MTO", "REPLENISHMENT"]).optional(),
			limit: z.number().int().positive().max(100).default(25),
			offset: z.number().int().nonnegative().default(0),
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

		const where = {
			organizationId: input.organizationId,
			...(input.status ? { status: input.status } : {}),
			...(input.supplierId ? { supplierId: input.supplierId } : {}),
			...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
			...(input.poType ? { poType: input.poType } : {}),
		};

		const [purchaseOrders, total] = await db.$transaction([
			db.purchaseOrder.findMany({
				where,
				include: {
					supplier: { select: { id: true, name: true } },
					warehouse: { select: { id: true, name: true } },
					_count: { select: { lines: true, grns: true } },
				},
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.purchaseOrder.count({ where }),
		]);

		return { purchaseOrders, total };
	});
