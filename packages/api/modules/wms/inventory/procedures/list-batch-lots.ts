import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listBatchLots = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/batches",
		tags: ["WMS", "Inventory"],
		summary: "List batch/lot records",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string().optional(),
			status: z.string().optional(),
			expiringSoonDays: z.number().int().positive().optional(),
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
		if (input.status) where.status = input.status;

		if (input.expiringSoonDays !== undefined) {
			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() + input.expiringSoonDays);
			where.expiryDate = { lte: cutoff };
		}

		const [batchLots, total] = await Promise.all([
			db.batchLot.findMany({
				where,
				include: {
					variant: { select: { id: true, sku: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.batchLot.count({ where }),
		]);

		return { batchLots, total };
	});
