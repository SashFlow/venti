import {
	completeWorkflowStep,
	getInboundWorkflow,
	runWorkflowDemo,
	saveInboundDemoWorkflow,
} from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const nodeSchema = z.object({
	id: z.string(),
	position: z.object({ x: z.number(), y: z.number() }),
	data: z.object({ label: z.string() }),
});

const edgeSchema = z.object({
	id: z.string(),
	source: z.string(),
	target: z.string(),
});

export const saveWorkflowProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/workflows/save",
		tags: ["Workflows"],
		summary: "Save inbound workflow definition",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			name: z.string().optional(),
			nodes: z.array(nodeSchema),
			edges: z.array(edgeSchema),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return saveInboundDemoWorkflow(input);
	});

export const getWorkflowProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/workflows/inbound",
		tags: ["Workflows"],
		summary: "Get inbound workflow for warehouse",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return getInboundWorkflow(input);
	});

export const runWorkflowDemoProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/workflows/{workflowId}/run-demo",
		tags: ["Workflows"],
		summary: "Start workflow demo execution",
	})
	.input(
		z.object({
			organizationId: z.string(),
			workflowId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return runWorkflowDemo(input);
	});

export const completeWorkflowStepProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/workflows/executions/{executionId}/steps/{nodeId}/complete",
		tags: ["Workflows"],
		summary: "Mark workflow demo step complete",
	})
	.input(
		z.object({
			organizationId: z.string(),
			executionId: z.string(),
			nodeId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(input.organizationId, context.user.id);
		return completeWorkflowStep(input);
	});
