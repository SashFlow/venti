import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

const POStatusSchema = z.enum([
	"DRAFT",
	"SUBMITTED",
	"APPROVED",
	"PARTIAL",
	"RECEIVED",
	"CANCELLED",
]);

// Valid forward-only transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
	DRAFT: ["SUBMITTED"],
	SUBMITTED: ["APPROVED", "CANCELLED"],
	APPROVED: ["PARTIAL", "RECEIVED", "CANCELLED"],
	PARTIAL: ["RECEIVED", "CANCELLED"],
	RECEIVED: [],
	CANCELLED: [],
};

// Transitions that require APPROVE permission (vs CREATE)
const APPROVE_REQUIRED = new Set(["APPROVED", "CANCELLED"]);

export const updatePoStatus = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/purchase-orders/{purchaseOrderId}/status",
		tags: ["WMS", "Procurement"],
		summary: "Update purchase order status",
	})
	.input(
		z.object({
			organizationId: z.string(),
			purchaseOrderId: z.string(),
			status: POStatusSchema,
			notes: z.string().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		const po = await db.purchaseOrder.findFirst({
			where: {
				id: input.purchaseOrderId,
				organizationId: input.organizationId,
			},
		});
		if (!po) throw new ORPCError("NOT_FOUND", "Purchase order not found");

		// Check transition is valid
		const allowed = ALLOWED_TRANSITIONS[po.status] ?? [];
		if (!allowed.includes(input.status)) {
			throw new ORPCError(
				"CONFLICT",
				`Cannot transition purchase order from ${po.status} to ${input.status}`,
			);
		}

		// Check permission based on target status
		if (APPROVE_REQUIRED.has(input.status)) {
			if (
				!(await context.can(
					input.organizationId,
					WMS_RESOURCES.PROCUREMENT,
					WMS_ACTIONS.APPROVE,
				))
			) {
				throw new ORPCError("FORBIDDEN");
			}
		} else {
			// SUBMITTED requires CREATE
			if (
				!(await context.can(
					input.organizationId,
					WMS_RESOURCES.PROCUREMENT,
					WMS_ACTIONS.CREATE,
				))
			) {
				throw new ORPCError("FORBIDDEN");
			}
		}

		const purchaseOrder = await db.purchaseOrder.update({
			where: { id: input.purchaseOrderId },
			data: {
				status: input.status,
				...(input.notes ? { notes: input.notes } : {}),
			},
		});

		return { purchaseOrder };
	});
