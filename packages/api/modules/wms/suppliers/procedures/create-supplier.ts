import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const createSupplier = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/suppliers",
		tags: ["WMS", "Suppliers"],
		summary: "Create a supplier",
	})
	.input(
		z.object({
			organizationId: z.string(),
			code: z.string().min(1),
			name: z.string().min(1),
			contactName: z.string().optional(),
			email: z.string().email().optional(),
			phone: z.string().optional(),
			address: z.string().optional(),
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
				WMS_ACTIONS.CREATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.supplier.findFirst({
			where: { organizationId: input.organizationId, code: input.code },
		});
		if (existing) {
			throw new ORPCError("CONFLICT", {
				message: `Supplier with code "${input.code}" already exists in this organization.`,
			});
		}

		const supplier = await db.supplier.create({
			data: {
				organizationId: input.organizationId,
				code: input.code,
				name: input.name,
				contactName: input.contactName,
				email: input.email,
				phone: input.phone,
				address: input.address,
				metadata: input.metadata,
			},
		});

		return { supplier };
	});
