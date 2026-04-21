import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const listBins = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/aisles/:aisleId/bins",
		tags: ["WMS", "Warehouses"],
		summary: "List bins within an aisle",
	})
	.input(
		z.object({
			organizationId: z.string(),
			aisleId: z.string(),
			includeInactive: z.boolean().optional(),
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
				WMS_RESOURCES.WAREHOUSE,
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Verify aisle belongs to an org-owned warehouse
		const aisle = await db.warehouseAisle.findFirst({
			where: {
				id: input.aisleId,
				zone: {
					level: {
						warehouse: { organizationId: input.organizationId },
					},
				},
			},
		});
		if (!aisle) throw new ORPCError("NOT_FOUND");

		const bins = await db.warehouseBin.findMany({
			where: {
				aisleId: input.aisleId,
				...(input.includeInactive ? {} : { active: true }),
			},
			orderBy: [{ sequence: "asc" }, { code: "asc" }],
		});

		return { bins };
	});
