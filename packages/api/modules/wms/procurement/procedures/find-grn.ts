import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const findGrn = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/grns/{grnId}",
		tags: ["WMS", "Procurement"],
		summary: "Get a GRN by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			grnId: z.string(),
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

		const grn = await db.gRN.findFirst({
			where: {
				id: input.grnId,
				organizationId: input.organizationId,
			},
			include: {
				po: {
					select: {
						id: true,
						poNumber: true,
						supplier: { select: { id: true, name: true } },
					},
				},
				lines: true,
				qcInspection: true,
			},
		});

		if (!grn) throw new ORPCError("NOT_FOUND", "GRN not found");

		// Enrich lines with variant sku/name
		const enrichedLines = await Promise.all(
			grn.lines.map(async (line) => {
				const variant = await db.productVariant.findUnique({
					where: { id: line.variantId },
					select: { id: true, sku: true, name: true },
				});
				return { ...line, variant };
			}),
		);

		return {
			grn: {
				...grn,
				lines: enrichedLines,
			},
		};
	});
