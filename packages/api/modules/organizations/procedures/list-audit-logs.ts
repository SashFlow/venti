import { listAuditLogs } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const listAuditLogsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/organizations/audit-logs",
		tags: ["Organizations"],
		summary: "List audit logs for organization",
	})
	.input(
		z.object({
			organizationId: z.string(),
			userId: z.string().optional(),
			action: z.string().optional(),
			dateFrom: z.coerce.date().optional(),
			dateTo: z.coerce.date().optional(),
			limit: z.number().min(1).max(100).default(50),
			offset: z.number().min(0).default(0),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return listAuditLogs(input);
	});
