import { db } from "../prisma";

type WorkflowNodeInput = {
	id: string;
	position: { x: number; y: number };
	data: { label: string };
};

type WorkflowEdgeInput = {
	id: string;
	source: string;
	target: string;
};

export async function saveInboundDemoWorkflow(params: {
	warehouseId: string;
	organizationId: string;
	name?: string;
	nodes: WorkflowNodeInput[];
	edges: WorkflowEdgeInput[];
}) {
	const warehouse = await db.warehouse.findFirst({
		where: {
			id: params.warehouseId,
			organizationId: params.organizationId,
		},
	});

	if (!warehouse) {
		throw new Error("Warehouse not found.");
	}

	const existing = await db.workflowDefinition.findFirst({
		where: {
			warehouseId: params.warehouseId,
			type: "INBOUND",
			isActive: true,
		},
	});

	if (existing) {
		await db.workflowExecutionStep.deleteMany({
			where: { execution: { workflowId: existing.id } },
		});
		await db.workflowExecution.deleteMany({
			where: { workflowId: existing.id },
		});
		await db.workflowEdge.deleteMany({ where: { workflowId: existing.id } });
		await db.workflowNode.deleteMany({ where: { workflowId: existing.id } });
		await db.workflowDefinition.delete({ where: { id: existing.id } });
	}

	const workflow = await db.workflowDefinition.create({
		data: {
			warehouseId: params.warehouseId,
			name: params.name ?? "Inbound Receive → QC → Putaway",
			type: "INBOUND",
			version: 1,
			isActive: true,
			nodes: {
				create: params.nodes.map((n) => ({
					nodeId: n.id,
					type: "action",
					label: String(n.data.label),
					positionX: n.position.x,
					positionY: n.position.y,
				})),
			},
			edges: {
				create: params.edges.map((e) => ({
					sourceNodeId: e.source,
					targetNodeId: e.target,
				})),
			},
		},
		include: { nodes: true, edges: true },
	});

	return workflow;
}

export async function getInboundWorkflow(params: {
	warehouseId: string;
	organizationId: string;
}) {
	const warehouse = await db.warehouse.findFirst({
		where: {
			id: params.warehouseId,
			organizationId: params.organizationId,
		},
	});

	if (!warehouse) {
		return null;
	}

	return db.workflowDefinition.findFirst({
		where: {
			warehouseId: params.warehouseId,
			type: "INBOUND",
			isActive: true,
		},
		include: { nodes: true, edges: true },
		orderBy: { createdAt: "desc" },
	});
}

export async function runWorkflowDemo(params: {
	workflowId: string;
	organizationId: string;
}) {
	const workflow = await db.workflowDefinition.findFirst({
		where: {
			id: params.workflowId,
			warehouse: { organizationId: params.organizationId },
		},
		include: { nodes: true, edges: true },
	});

	if (!workflow) {
		throw new Error("Workflow not found.");
	}

	const orderedNodeIds = topologicalOrder(workflow.nodes, workflow.edges);

	const execution = await db.workflowExecution.create({
		data: {
			workflowId: workflow.id,
			status: "RUNNING",
			referenceType: "DEMO",
			steps: {
				create: orderedNodeIds.map((nodeId) => ({
					nodeId,
					status: "PENDING",
				})),
			},
		},
		include: { steps: true },
	});

	const steps = orderedNodeIds.map((nodeId) => {
		const node = workflow.nodes.find((n) => n.nodeId === nodeId);
		return {
			nodeId,
			label: node?.label ?? nodeId,
		};
	});

	return { executionId: execution.id, steps };
}

export async function completeWorkflowStep(params: {
	executionId: string;
	nodeId: string;
	organizationId: string;
}) {
	const execution = await db.workflowExecution.findFirst({
		where: {
			id: params.executionId,
			workflow: { warehouse: { organizationId: params.organizationId } },
		},
		include: { steps: true },
	});

	if (!execution) {
		throw new Error("Execution not found.");
	}

	await db.workflowExecutionStep.updateMany({
		where: {
			executionId: params.executionId,
			nodeId: params.nodeId,
		},
		data: {
			status: "COMPLETED",
			completedAt: new Date(),
		},
	});

	const pending = execution.steps.filter((s) => s.status === "PENDING");
	const allDone =
		pending.length <= 1 &&
		pending.every((s) => s.nodeId === params.nodeId);

	if (allDone || pending.length === 0) {
		await db.workflowExecution.update({
			where: { id: params.executionId },
			data: {
				status: "COMPLETED",
				completedAt: new Date(),
			},
		});
	}

	return { ok: true };
}

function topologicalOrder(
	nodes: Array<{ nodeId: string }>,
	edges: Array<{ sourceNodeId: string; targetNodeId: string }>,
) {
	const nodeIds = nodes.map((n) => n.nodeId);
	const incoming = new Map(nodeIds.map((id) => [id, 0]));

	for (const edge of edges) {
		incoming.set(
			edge.targetNodeId,
			(incoming.get(edge.targetNodeId) ?? 0) + 1,
		);
	}

	const queue = nodeIds.filter((id) => incoming.get(id) === 0);
	const order: string[] = [];

	while (queue.length > 0) {
		const id = queue.shift()!;
		order.push(id);
		for (const edge of edges.filter((e) => e.sourceNodeId === id)) {
			const next = edge.targetNodeId;
			const count = (incoming.get(next) ?? 1) - 1;
			incoming.set(next, count);
			if (count === 0) {
				queue.push(next);
			}
		}
	}

	return order.length > 0 ? order : nodeIds;
}
