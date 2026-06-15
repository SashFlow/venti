"use client";

import {
	addEdge,
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	ReactFlow,
	useEdgesState,
	useNodesState,
	type Node,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import "@xyflow/react/dist/style.css";
import { Button } from "@repo/ui/button";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const initialNodes = [
	{
		id: "start",
		position: { x: 50, y: 50 },
		data: { label: "Receive Goods" },
		style: { borderRadius: 8, padding: 8 },
	},
	{
		id: "qc",
		position: { x: 250, y: 50 },
		data: { label: "QC Inspection" },
		style: { borderRadius: 8, padding: 8 },
	},
	{
		id: "putaway",
		position: { x: 450, y: 50 },
		data: { label: "Putaway Task" },
		style: { borderRadius: 8, padding: 8 },
	},
];

const initialEdges = [
	{ id: "e1-2", source: "start", target: "qc" },
	{ id: "e2-3", source: "qc", target: "putaway" },
];

export function WorkflowBuilder() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
	const [elapsedMs, setElapsedMs] = useState(0);
	const [running, setRunning] = useState(false);

	const { data: warehouseList } = useQuery({
		...orpc.warehouse.list.queryOptions({
			input: { organizationId, limit: 1 },
		}),
		enabled: Boolean(organizationId),
	});

	const warehouseId = warehouseList?.warehouses?.[0]?.id ?? "";

	const { data: savedWorkflow } = useQuery({
		...orpc.workflows.getInbound.queryOptions({
			input: { organizationId, warehouseId },
		}),
		enabled: Boolean(organizationId && warehouseId),
	});

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	useEffect(() => {
		if (!savedWorkflow?.nodes?.length) {
			return;
		}
		setNodes(
			savedWorkflow.nodes.map((n) => ({
				id: n.nodeId,
				position: {
					x: Number(n.positionX),
					y: Number(n.positionY),
				},
				data: { label: n.label },
				style: { borderRadius: 8, padding: 8 },
			})),
		);
		setEdges(
			savedWorkflow.edges.map((e, i) => ({
				id: `e-${i}`,
				source: e.sourceNodeId,
				target: e.targetNodeId,
			})),
		);
	}, [savedWorkflow, setNodes, setEdges]);

	const saveMutation = useMutation(orpc.workflows.save.mutationOptions());
	const runMutation = useMutation(orpc.workflows.runDemo.mutationOptions());

	const onConnect = useCallback(
		(params: { source: string; target: string }) =>
			setEdges((eds) =>
				addEdge({ ...params, id: `e-${eds.length}` }, eds),
			),
		[setEdges],
	);

	const addNode = () => {
		setNodes((nds) => [
			...nds,
			{
				id: `node-${nds.length + 1}`,
				position: {
					x: Math.random() * 200 + 50,
					y: Math.random() * 200 + 50,
				},
				data: { label: `New Action ${nds.length + 1}` },
				style: { borderRadius: 8, padding: 8 },
			},
		]);
	};

	const handleSave = async () => {
		if (!warehouseId) {
			toast.error("No warehouse found.");
			return;
		}
		try {
			await saveMutation.mutateAsync({
				organizationId,
				warehouseId,
				nodes: nodes.map((n) => ({
					id: n.id,
					position: n.position,
					data: { label: String(n.data.label) },
				})),
				edges: edges.map((e) => ({
					id: e.id,
					source: e.source,
					target: e.target,
				})),
			});
			toast.success("Workflow saved");
		} catch {
			toast.error("Failed to save workflow");
		}
	};

	const handleRunDemo = async () => {
		if (!warehouseId) {
			toast.error("No warehouse found.");
			return;
		}
		let workflowId = savedWorkflow?.id;
		if (!workflowId) {
			try {
				const saved = await saveMutation.mutateAsync({
					organizationId,
					warehouseId,
					nodes: nodes.map((n) => ({
						id: n.id,
						position: n.position,
						data: { label: String(n.data.label) },
					})),
					edges: edges.map((e) => ({
						id: e.id,
						source: e.source,
						target: e.target,
					})),
				});
				workflowId = saved.id;
			} catch {
				toast.error("Save workflow before running demo.");
				return;
			}
		}
		try {
			const result = await runMutation.mutateAsync({
				organizationId,
				workflowId,
			});
			setRunning(true);
			setElapsedMs(0);
			const start = Date.now();

			for (let i = 0; i < result.steps.length; i++) {
				const step = result.steps[i]!;
				setActiveNodeId(step.nodeId);
				await new Promise((r) => setTimeout(r, 2000));
				setElapsedMs(Date.now() - start);
			}

			setRunning(false);
			setActiveNodeId(null);
			toast.success("Workflow demo completed");
		} catch {
			toast.error("Failed to run workflow demo");
			setRunning(false);
		}
	};

	const styledNodes: Node[] = nodes.map((n) => ({
		...n,
		style: {
			...n.style,
			border:
				activeNodeId === n.id
					? "2px solid hsl(var(--primary))"
					: "1px solid hsl(var(--border))",
			boxShadow:
				activeNodeId === n.id
					? "0 0 0 4px hsl(var(--primary) / 0.2)"
					: undefined,
		},
	}));

	return (
		<div className="w-full h-full relative">
			<div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-center">
				<Button size="sm" onClick={addNode} disabled={running}>
					Add Action Node
				</Button>
				<Button
					size="sm"
					variant="secondary"
					onClick={handleSave}
					disabled={saveMutation.isPending || running}
				>
					Save Workflow
				</Button>
				<Button
					size="sm"
					variant="default"
					onClick={handleRunDemo}
					disabled={runMutation.isPending || running}
				>
					Run Demo
				</Button>
				{running && (
					<span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded border">
						Step active · {(elapsedMs / 1000).toFixed(1)}s elapsed
					</span>
				)}
			</div>
			<ReactFlow
				nodes={styledNodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
			>
				<Controls />
				<MiniMap />
				<Background
					variant={BackgroundVariant.Dots}
					gap={12}
					size={1}
				/>
			</ReactFlow>
		</div>
	);
}
