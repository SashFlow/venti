import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const createQcInspection = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/qc/inspections",
		tags: ["WMS", "QC"],
		summary: "Create a QC inspection for a GRN",
	})
	.input(
		z.object({
			organizationId: z.string(),
			grnId: z.string(),
			sampleSize: z.number().int().positive().optional(),
			metadata: z.record(z.unknown()).optional(),
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
				WMS_ACTIONS.CREATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify GRN belongs to org and is IN_PROGRESS
		const grn = await db.gRN.findUnique({
			where: { id: input.grnId },
		});

		if (!grn || grn.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "GRN not found");
		}

		if (grn.status !== "IN_PROGRESS") {
			throw new ORPCError(
				"CONFLICT",
				`GRN is not in IN_PROGRESS status (current: ${grn.status})`,
			);
		}

		// Check for existing inspection (grnId is @unique)
		const existing = await db.qCInspection.findUnique({
			where: { grnId: input.grnId },
		});

		if (existing) {
			throw new ORPCError(
				"CONFLICT",
				"A QC inspection already exists for this GRN",
			);
		}

		const inspection = await db.qCInspection.create({
			data: {
				organizationId: input.organizationId,
				grnId: input.grnId,
				inspectorId: context.user.id,
				sampleSize: input.sampleSize,
				metadata: input.metadata,
			},
			include: {
				grn: { select: { grnNumber: true, status: true } },
				holdRecords: true,
			},
		});

		return { inspection };
	});
