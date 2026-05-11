import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { updateUom } from "../services/uoms-service";

const updateUomInput = z.object({
	organizationId: z.string(),
	id: z.string(),
	code: z.string().trim().min(1).max(20).optional(),
	name: z.string().trim().min(1).max(100).optional(),
	abbreviation: z.string().trim().min(1).max(20).optional(),
	isBase: z.boolean().optional(),
	precision: z.number().int().min(0).max(6).optional(),
});

export const updateUomProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/master-data/uoms/{id}",
		tags: ["Master Data"],
		summary: "Update UOM",
		description: "Update a unit of measure for an organization.",
	})
	.input(updateUomInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const uom = await updateUom({
			organizationId: input.organizationId,
			id: input.id,
			data: {
				code: input.code,
				name: input.name,
				abbreviation: input.abbreviation,
				isBase: input.isBase,
				precision: input.precision,
			},
		});

		if (!uom) {
			throw new ORPCError("NOT_FOUND", {
				message: "UOM not found.",
			});
		}

		await writeAuditLog({
			headers,
			organizationId: input.organizationId,
			userId: user.id,
			action: "uom.update",
			resource: "uom",
			resourceId: uom.id,
			metadata: {
				code: uom.code,
				name: uom.name,
			},
		});

		return { uom };
	});
