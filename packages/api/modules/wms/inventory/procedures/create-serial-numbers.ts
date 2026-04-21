import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const createSerialNumbers = wmsProcedure
	.route({
		method: "POST",
		path: "/wms/serials",
		tags: ["WMS", "Inventory"],
		summary: "Bulk create serial numbers",
	})
	.input(
		z.object({
			organizationId: z.string(),
			variantId: z.string(),
			serials: z
				.array(
					z.object({
						serial: z.string().min(1),
						mfgDate: z.string().datetime().optional(),
						warrantyExpiry: z.string().datetime().optional(),
					}),
				)
				.min(1),
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
				WMS_ACTIONS.CREATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		// Verify variant belongs to this organization
		const variant = await db.productVariant.findFirst({
			where: { id: input.variantId, organizationId: input.organizationId },
			select: { id: true },
		});
		if (!variant) throw new ORPCError("NOT_FOUND", { message: "Variant not found" });

		// Check for duplicates in the incoming list
		const incomingSerials = input.serials.map((s) => s.serial);
		const existing = await db.serialNumber.findMany({
			where: {
				organizationId: input.organizationId,
				variantId: input.variantId,
				serial: { in: incomingSerials },
			},
			select: { serial: true },
		});

		if (existing.length > 0) {
			const dupes = existing.map((s) => s.serial).join(", ");
			throw new ORPCError("CONFLICT", {
				message: `Duplicate serial numbers already exist: ${dupes}`,
			});
		}

		const result = await db.serialNumber.createMany({
			data: input.serials.map((s: { serial: string; mfgDate?: string; warrantyExpiry?: string }) => ({
				organizationId: input.organizationId,
				variantId: input.variantId,
				serial: s.serial,
				mfgDate: s.mfgDate ? new Date(s.mfgDate) : undefined,
				warrantyExpiry: s.warrantyExpiry
					? new Date(s.warrantyExpiry)
					: undefined,
				status: "AVAILABLE",
			})),
			skipDuplicates: false,
		});

		return { created: result.count };
	});
