import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const updateSupplier = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/suppliers/{supplierId}",
		tags: ["WMS", "Suppliers"],
		summary: "Update a supplier",
	})
	.input(
		z.object({
			organizationId: z.string(),
			supplierId: z.string(),
			name: z.string().min(1).optional(),
			contactName: z.string().optional(),
			email: z.string().email().optional(),
			phone: z.string().optional(),
			address: z.string().optional(),
			active: z.boolean().optional(),
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
				WMS_ACTIONS.UPDATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.supplier.findFirst({
			where: {
				id: input.supplierId,
				organizationId: input.organizationId,
			},
		});
		if (!existing)
			throw new ORPCError("NOT_FOUND", {
				message: "Supplier not found.",
			});

		const { organizationId, supplierId, ...data } = input;

		const supplier = await db.supplier.update({
			where: { id: supplierId },
			data,
		});

		return { supplier };
	});
