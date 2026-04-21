import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { generateDocNumber } from "../../lib/sequence";

export const createGrn = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/grns",
		tags: ["WMS", "Procurement"],
		summary: "Create a goods receipt note",
	})
	.input(
		z.object({
			organizationId: z.string(),
			purchaseOrderId: z.string(),
			notes: z.string().optional(),
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
				WMS_RESOURCES.PROCUREMENT,
				WMS_ACTIONS.RECEIVE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify PO belongs to org and is APPROVED
		const po = await db.purchaseOrder.findFirst({
			where: {
				id: input.purchaseOrderId,
				organizationId: input.organizationId,
			},
			include: { lines: true },
		});

		if (!po) throw new ORPCError("NOT_FOUND", "Purchase order not found");

		if (po.status !== "APPROVED") {
			throw new ORPCError(
				"CONFLICT",
				`Purchase order must be in APPROVED status to create a GRN, current status: ${po.status}`,
			);
		}

		// Get workflow type from tenant config
		const tenantConfig = await db.wmsTenantConfig.findUnique({
			where: { organizationId: input.organizationId },
			select: { defaultReceivingWorkflow: true },
		});

		const workflowType = tenantConfig?.defaultReceivingWorkflow ?? "TWO_STEP";

		const grn = await db.$transaction(async (tx) => {
			const grnNumber = await generateDocNumber(tx, {
				organizationId: input.organizationId,
				prefix: "GRN",
				countFn: () =>
					tx.gRN.count({
						where: { organizationId: input.organizationId },
					}),
			});

			const created = await tx.gRN.create({
				data: {
					organizationId: input.organizationId,
					grnNumber,
					poId: input.purchaseOrderId,
					warehouseId: po.warehouseId,
					workflowType,
					status: "IN_PROGRESS",
					notes: input.notes,
					metadata: input.metadata,
					lines: {
						create: po.lines.map((poLine) => ({
							poLineId: poLine.id,
							variantId: poLine.variantId,
							uomId: poLine.uomId,
							expectedQty: poLine.qty,
							receivedQty: 0,
							acceptedQty: 0,
							rejectedQty: 0,
							qcStatus: "PENDING",
						})),
					},
				},
				include: { lines: true },
			});

			return created;
		});

		return { grn };
	});
