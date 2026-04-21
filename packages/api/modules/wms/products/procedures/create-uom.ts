import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const createUom = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/uoms",
		tags: ["WMS", "Products"],
		summary: "Create a unit of measure",
	})
	.input(
		z.object({
			organizationId: z.string(),
			code: z.string().min(1),
			name: z.string().min(1),
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
				WMS_RESOURCES.PRODUCT,
				WMS_ACTIONS.CREATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const existing = await db.unitOfMeasure.findFirst({
			where: { organizationId: input.organizationId, code: input.code },
		});
		if (existing) {
			throw new ORPCError("CONFLICT", {
				message: `UoM with code "${input.code}" already exists in this organization.`,
			});
		}

		const uom = await db.unitOfMeasure.create({
			data: {
				organizationId: input.organizationId,
				code: input.code,
				name: input.name,
			},
		});

		return { uom };
	});
