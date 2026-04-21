import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listStockLevels = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/stock",
		tags: ["WMS", "Inventory"],
		summary: "List stock levels",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			variantId: z.string().optional(),
			binId: z.string().optional(),
			showZero: z.boolean().default(false),
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
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const where: Record<string, unknown> = {
			organizationId: input.organizationId,
		};

		if (input.warehouseId) where.warehouseId = input.warehouseId;
		if (input.variantId) where.variantId = input.variantId;
		if (input.binId) where.binId = input.binId;

		if (!input.showZero) {
			where.qtyOnHand = { gt: 0 };
		}

		const stockLevels = await db.stockLevel.findMany({
			where,
			include: {
				variant: {
					select: { id: true, sku: true, name: true },
				},
				bin: {
					select: { id: true, code: true, name: true },
				},
			},
			orderBy: { updatedAt: "desc" },
		});

		return { stockLevels };
	});
