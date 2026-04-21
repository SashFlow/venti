import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listPallets = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/pallets",
		tags: ["WMS", "Inventory"],
		summary: "List pallet records",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			status: z.string().optional(),
			forkliftRequired: z.boolean().optional(),
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
		if (input.status) where.status = input.status;
		if (input.forkliftRequired !== undefined)
			where.forkliftRequired = input.forkliftRequired;

		const [pallets, total] = await Promise.all([
			db.palletRecord.findMany({
				where,
				include: {
					bin: { select: { id: true, code: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.palletRecord.count({ where }),
		]);

		return { pallets, total };
	});
