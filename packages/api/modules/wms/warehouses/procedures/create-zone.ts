import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createZone = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/levels/:levelId/zones",
		tags: ["WMS", "Warehouses"],
		summary: "Create a zone within a warehouse level",
	})
	.input(
		z.object({
			organizationId: z.string(),
			levelId: z.string(),
			code: z.string().min(1).max(50),
			name: z.string().min(1).max(200),
			type: z
				.enum([
					"BULK",
					"RACKING",
					"RETURNS",
					"QC_HOLD",
					"CONSIGNMENT",
					"STAGING",
					"DOCK",
					"REFRIGERANT",
					"DEFECTIVE",
					"DISPATCH",
				])
				.default("BULK"),
			metadata: z.record(z.unknown()).optional(),
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
				WMS_ACTIONS.CREATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Verify levelId belongs to an org-owned warehouse
		const level = await db.warehouseLevel.findFirst({
			where: {
				id: input.levelId,
				warehouse: { organizationId: input.organizationId },
			},
		});
		if (!level) throw new ORPCError("NOT_FOUND");

		const zone = await db.warehouseZone.create({
			data: {
				levelId: input.levelId,
				code: input.code,
				name: input.name,
				type: input.type,
				metadata: input.metadata,
			},
		});

		return { zone };
	});
