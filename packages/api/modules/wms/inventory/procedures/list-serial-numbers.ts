import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listSerialNumbers = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/serials",
		tags: ["WMS", "Inventory"],
		summary: "List serial numbers",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string().optional(),
			warehouseId: z.string().optional(),
			status: z.string().optional(),
			limit: z.number().int().min(1).max(500).default(50),
			offset: z.number().int().min(0).default(0),
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

		if (input.variantId) where.variantId = input.variantId;
		if (input.warehouseId) where.warehouseId = input.warehouseId;
		if (input.status) where.status = input.status;

		const [serials, total] = await Promise.all([
			db.serialNumber.findMany({
				where,
				include: {
					variant: { select: { id: true, sku: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.serialNumber.count({ where }),
		]);

		return { serials, total };
	});
