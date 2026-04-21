import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

const QCDecisionSchema = z.enum(["ACCEPT", "REJECT", "CONDITIONAL_ACCEPT"]);

export const completeQcInspection = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/qc/inspections/{inspectionId}/complete",
		tags: ["WMS", "QC"],
		summary: "Complete a QC inspection with decision",
	})
	.input(
		z.object({
			organizationId: z.string(),
			inspectionId: z.string(),
			decision: QCDecisionSchema,
			findings: z.string().optional(),
			holds: z
				.array(
					z.object({
						variantId: z.string(),
						qty: z.number().positive(),
						holdZoneBinId: z.string().optional(),
					}),
				)
				.optional(),
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
				WMS_ACTIONS.INSPECT,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const inspection = await db.qCInspection.findUnique({
			where: { id: input.inspectionId },
			include: { grn: { include: { lines: true } } },
		});

		if (!inspection || inspection.organizationId !== input.organizationId) {
			throw new ORPCError("NOT_FOUND", "QC inspection not found");
		}

		if (inspection.decision !== null) {
			throw new ORPCError(
				"CONFLICT",
				"QC inspection already has a decision recorded",
			);
		}

		const result = await db.$transaction(async (tx) => {
			// 1. Update inspection with decision
			const updatedInspection = await tx.qCInspection.update({
				where: { id: input.inspectionId },
				data: {
					decision: input.decision,
					findings: input.findings,
					inspectedAt: new Date(),
				},
				include: {
					grn: { select: { grnNumber: true, status: true } },
					holdRecords: true,
				},
			});

			// 2. Create hold records if provided
			if (input.holds && input.holds.length > 0) {
				await tx.inboundQCHold.createMany({
					data: input.holds.map((hold) => ({
						organizationId: input.organizationId,
						qcInspectionId: input.inspectionId,
						variantId: hold.variantId,
						qty: hold.qty,
						holdZoneBinId: hold.holdZoneBinId,
						status: "HELD",
					})),
				});
			}

			// 3/4. Update GRN lines qcStatus based on decision
			const qcStatus =
				input.decision === "REJECT" ? "REJECTED" : "ACCEPTED";

			await tx.gRNLine.updateMany({
				where: { grnId: inspection.grnId },
				data: { qcStatus },
			});

			return updatedInspection;
		});

		return { inspection: result };
	});
