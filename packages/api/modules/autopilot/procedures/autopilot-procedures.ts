import {
	listAutopilotRules,
	listRecentWarehouseTasks,
	runAutopilotRulesForOrg,
	updateAutopilotRule,
} from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const listRulesProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/autopilot/rules",
		tags: ["Autopilot"],
		summary: "List autopilot rules for organization",
	})
	.input(z.object({ organizationId: z.string() }))
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return listAutopilotRules(input.organizationId);
	});

export const updateRuleProcedure = protectedProcedure
	.route({
		method: "PATCH",
		path: "/autopilot/rules/{ruleId}",
		tags: ["Autopilot"],
		summary: "Update autopilot rule",
	})
	.input(
		z.object({
			organizationId: z.string(),
			ruleId: z.string(),
			enabled: z.boolean().optional(),
			config: z.record(z.string(), z.unknown()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return updateAutopilotRule(input);
	});

export const runRulesNowProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/autopilot/run",
		tags: ["Autopilot"],
		summary: "Run all enabled autopilot rules now",
	})
	.input(z.object({ organizationId: z.string() }))
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return runAutopilotRulesForOrg({
			organizationId: input.organizationId,
			userId: context.user.id,
		});
	});

export const listRecentActionsProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/autopilot/recent-actions",
		tags: ["Autopilot"],
		summary: "List recent warehouse tasks (autopilot queue)",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string().optional(),
			limit: z.number().default(20),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		const tasks = await listRecentWarehouseTasks(input);
		return {
			items: tasks.map((t) => ({
				id: t.id,
				task: `${t.type} — ${t.sku?.code ?? "—"} (${t.warehouse.name})`,
				owner: t.assignedUser?.name ?? "Unassigned",
				state:
					t.status === "COMPLETED"
						? ("executed" as const)
						: t.status === "CANCELLED"
							? ("blocked" as const)
							: ("queued" as const),
				eta: t.createdAt.toISOString(),
				type: t.type,
				status: t.status,
			})),
		};
	});
