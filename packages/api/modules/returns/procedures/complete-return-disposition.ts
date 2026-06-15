import { ORPCError } from "@orpc/server";
import { completeReturnDisposition } from "@repo/database";
import { z } from "zod";
import { writeAuditLog } from "../../../lib/audit";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const dispositionSchema = z.enum([
	"RESTOCK",
	"SCRAP",
	"REFURBISH",
	"RETURN_TO_VENDOR",
]);

export const completeReturnDispositionProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/returns/{returnOrderId}/items/{itemId}/disposition",
		tags: ["Returns"],
		summary: "Complete return inspection and disposition",
	})
	.input(
		z.object({
			organizationId: z.string(),
			returnOrderId: z.string(),
			itemId: z.string(),
			disposition: dispositionSchema,
			inspectionPassed: z.boolean(),
			locationId: z.string().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);

		try {
			const result = await completeReturnDisposition({
				...input,
				userId: context.user.id,
			});

			await writeAuditLog({
				organizationId: input.organizationId,
				userId: context.user.id,
				action: "COMPLETE_RETURN_DISPOSITION",
				resource: "ReturnOrder",
				resourceId: input.returnOrderId,
				metadata: {
					summary: `Return disposition ${input.disposition} approved`,
					disposition: input.disposition,
					inspectionPassed: input.inspectionPassed,
				},
			});

			return result;
		} catch (error) {
			throw new ORPCError("BAD_REQUEST", {
				message:
					error instanceof Error
						? error.message
						: "Failed to complete return disposition",
			});
		}
	});
