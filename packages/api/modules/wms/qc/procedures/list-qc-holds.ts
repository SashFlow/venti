import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listQcHolds = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/qc/holds",
		tags: ["WMS", "QC"],
		summary: "List inbound QC holds",
	})
	.input(
		z.object({
			organizationId: z.string(),
			status: z.string().optional(),
			warehouseId: z.string().optional(),
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
				WMS_RESOURCES.QC,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const holds = await db.inboundQCHold.findMany({
			where: {
				organizationId: input.organizationId,
				...(input.status ? { status: input.status } : {}),
				// Filter by warehouseId via the linked QC inspection → GRN → warehouse
				...(input.warehouseId
					? {
							qcInspection: {
								grn: { warehouseId: input.warehouseId },
							},
						}
					: {}),
			},
			include: {
				qcInspection: {
					select: {
						id: true,
						decision: true,
						grn: {
							select: { grnNumber: true, warehouseId: true },
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return { holds };
	});
