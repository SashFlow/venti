import { ORPCError } from "@orpc/server";
import { createSKU } from "@repo/database";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const createSKUInput = z.object({
	organizationId: z.string(),
	code: z.string().trim().min(1).max(100),
	widthMm: z.number().positive().optional(),
	lengthMm: z.number().positive().optional(),
	heightMm: z.number().positive().optional(),
	weightKg: z.number().positive().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createSKUProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/products",
		tags: ["Products"],
		summary: "Create SKU",
		description: "Create a SKU under an organization.",
	})
	.input(createSKUInput)
	.handler(async ({ context: { user, headers }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		try {
			const sku = await createSKU({
				organizationId: input.organizationId,
				data: {
					productId: "default",
					code: input.code,
					width: input.widthMm,
					length: input.lengthMm,
					height: input.heightMm,
					weight: input.weightKg,
					metadata: input.metadata as any,
				},
			});
			await writeAuditLog({
				headers,
				organizationId: input.organizationId,
				userId: user.id,
				action: "sku.create",
				resource: "sku",
				resourceId: sku.id,
				metadata: {
					code: sku.code,
				},
			});

			return { sku };
		} catch {
			throw new ORPCError("BAD_REQUEST", {
				message: "Could not create SKU.",
			});
		}
	});
