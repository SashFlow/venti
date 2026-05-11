import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createUom } from "../services/uoms-service";

const createUomInput = z.object({
	organizationId: z.string(),
	code: z.string().trim().min(1).max(20),
	name: z.string().trim().min(1).max(100),
	abbreviation: z.string().trim().min(1).max(20),
	isBase: z.boolean().optional(),
	precision: z.number().int().min(0).max(6).optional(),
});

export const createUomProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/master-data/uoms",
		tags: ["Master Data"],
		summary: "Create UOM",
		description: "Create a unit of measure under an organization.",
	})
	.input(createUomInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const uom = await createUom({
				organizationId: input.organizationId,
				data: {
					code: input.code,
					name: input.name,
					abbreviation: input.abbreviation,
					isBase: input.isBase,
					precision: input.precision,
				},
			});

			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "uom.create",
				resource: "uom",
				resourceId: uom.id,
				metadata: {
					code: uom.code,
					name: uom.name,
				},
			});

			return { uom };
		} catch {
			throw new ORPCError("BAD_REQUEST", {
				message:
					"Could not create UOM. Check for duplicate UOM code in this organization.",
			});
		}
	});
