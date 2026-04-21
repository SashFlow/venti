import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const findSerialNumber = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/serials/{id}",
		tags: ["WMS", "Inventory"],
		summary: "Find a serial number by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			serialNumberId: z.string(),
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
				WMS_RESOURCES.INVENTORY,
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const serial = await db.serialNumber.findFirst({
			where: {
				id: input.serialNumberId,
				organizationId: input.organizationId,
			},
			include: {
				variant: { select: { id: true, sku: true, name: true } },
				warrantyRecord: true,
				installationRecord: true,
			},
		});

		if (!serial) throw new ORPCError("NOT_FOUND", { message: "Serial number not found" });

		return { serial };
	});
