import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listGrns = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/grns",
		tags: ["WMS", "Procurement"],
		summary: "List GRNs",
	})
	.input(
		z.object({
			organizationId: z.string(),
			status: z
				.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
				.optional(),
			warehouseId: z.string().optional(),
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
			...(input.warehouseId ? { warehouseId: input.warehouseId } : {}),
		};

		const [grns, total] = await db.$transaction([
			db.gRN.findMany({
				where,
				include: {
					po: { select: { id: true, poNumber: true } },
					warehouse: { select: { id: true, name: true } },
					_count: { select: { lines: true } },
				},
				orderBy: { createdAt: "desc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.gRN.count({ where }),
		]);

		return { grns, total };
	});
