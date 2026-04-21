import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listStockLedger = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/stock/ledger",
		tags: ["WMS", "Inventory"],
		summary: "List stock ledger entries",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			variantId: z.string().optional(),
			movementType: z.string().optional(),
			referenceType: z.string().optional(),
			referenceId: z.string().optional(),
			dateFrom: z.string().datetime().optional(),
			dateTo: z.string().datetime().optional(),
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

		if (input.warehouseId) where.warehouseId = input.warehouseId;
		if (input.variantId) where.variantId = input.variantId;
		if (input.movementType) where.movementType = input.movementType;
		if (input.referenceType) where.referenceType = input.referenceType;
		if (input.referenceId) where.referenceId = input.referenceId;

		if (input.dateFrom || input.dateTo) {
			const createdAt: Record<string, Date> = {};
			if (input.dateFrom) createdAt.gte = new Date(input.dateFrom);
			if (input.dateTo) createdAt.lte = new Date(input.dateTo);
			where.createdAt = createdAt;
		}

		const [entries, total] = await Promise.all([
			db.stockLedger.findMany({
				where,
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.stockLedger.count({ where }),
		]);

		return { entries, total };
	});
