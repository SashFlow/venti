import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findQcInspection = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/qc/inspections/{inspectionId}",
		tags: ["WMS", "QC"],
		summary: "Get a QC inspection by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			inspectionId: z.string(),
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

		const inspection = await db.qCInspection.findUnique({
			where: { id: input.inspectionId },
			include: {
				grn: { select: { grnNumber: true, status: true } },
				holdRecords: true,
			},
		});

		if (!inspection || inspection.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "QC inspection not found");
		}

		return { inspection };
	});
