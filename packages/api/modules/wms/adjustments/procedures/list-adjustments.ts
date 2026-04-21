import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

const StockAdjustmentStatusSchema = z.enum([
	"DRAFT",
	"PENDING_APPROVAL",
	"APPROVED",
	"REJECTED",
]);

export const listAdjustments = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/adjustments",
		tags: ["WMS", "Adjustments"],
		summary: "List stock adjustments",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			status: StockAdjustmentStatusSchema.optional(),
			limit: z.number().int().positive().max(200).default(50),
			offset: z.number().int().min(0).default(0),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const where = {
			organizationId: input.organizationId,
			...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
			...(input.status ? { status: input.status } : {}),
		};

		const [adjustments, total] = await Promise.all([
			db.stockAdjustment.findMany({
				where,
				include: {
					requestedBy: { select: { name: true } },
					approvedBy: { select: { name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.stockAdjustment.count({ where }),
		]);

		return { adjustments, total };
	});
