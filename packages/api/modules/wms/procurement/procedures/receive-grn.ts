import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const receiveGrn = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/grns/{grnId}/receive",
		tags: ["WMS", "Procurement"],
		summary: "Record physical count for a GRN (Step 1)",
	})
	.input(
		z.object({
			organizationId: z.string(),
			grnId: z.string(),
			lines: z.array(
				z.object({
					grnLineId: z.string(),
					receivedQty: z.number().nonnegative(),
					rejectedQty: z.number().nonnegative().default(0),
				}),
			),
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
				WMS_ACTIONS.RECEIVE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify GRN belongs to org and is IN_PROGRESS
		const grn = await db.gRN.findFirst({
			where: {
				id: input.grnId,
				organizationId: input.organizationId,
			},
			include: { lines: true },
		});

		if (!grn) throw new ORPCError("NOT_FOUND", "GRN not found");

		if (grn.status !== "IN_PROGRESS") {
			throw new ORPCError(
				"CONFLICT",
				`GRN must be in IN_PROGRESS status, current status: ${grn.status}`,
			);
		}

		const isThreeStep = grn.workflowType === "THREE_STEP";

		const updatedGrn = await db.$transaction(async (tx) => {
			for (const inputLine of input.lines) {
				const grnLine = grn.lines.find((l) => l.id === inputLine.grnLineId);
				if (!grnLine) {
					throw new ORPCError(
						"NOT_FOUND",
						`GRN line ${inputLine.grnLineId} not found`,
					);
				}

				const rejectedQty = inputLine.rejectedQty ?? 0;

				if (isThreeStep) {
					// THREE_STEP: set qcStatus to PENDING_QC, acceptedQty stays 0 until QC
					await tx.gRNLine.update({
						where: { id: inputLine.grnLineId },
						data: {
							receivedQty: inputLine.receivedQty,
							rejectedQty,
							qcStatus: "PENDING_QC",
						},
					});
				} else {
					// ONE_STEP / TWO_STEP: auto-accept
					const acceptedQty = Math.max(
						0,
						inputLine.receivedQty - rejectedQty,
					);
					await tx.gRNLine.update({
						where: { id: inputLine.grnLineId },
						data: {
							receivedQty: inputLine.receivedQty,
							rejectedQty,
							acceptedQty,
							qcStatus: "ACCEPTED",
						},
					});
				}
			}

			const updated = await tx.gRN.update({
				where: { id: input.grnId },
				data: {
					receivedById: context.user.id,
					receivedAt: new Date(),
				},
				include: { lines: true },
			});

			return updated;
		});

		return { grn: updatedGrn };
	});
