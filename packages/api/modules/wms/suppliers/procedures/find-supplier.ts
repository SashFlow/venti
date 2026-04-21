import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findSupplier = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/suppliers/{supplierId}",
		tags: ["WMS", "Suppliers"],
		summary: "Find a supplier by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			supplierId: z.string(),
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
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const supplier = await db.supplier.findFirst({
			where: {
				id: input.supplierId,
				organizationId: input.organizationId,
			},
		});

		if (!supplier)
			throw new ORPCError("NOT_FOUND", {
				message: "Supplier not found.",
			});

		return { supplier };
	});
