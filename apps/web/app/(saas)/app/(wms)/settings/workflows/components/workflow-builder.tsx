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
} from "@xyflow/react";
import { useCallback } from "react";
import "@xyflow/react/dist/style.css";
import { Button } from "@repo/ui/button";

const initialNodes = [
	{
		id: "start",
		position: { x: 50, y: 50 },
		data: { label: "Receive Goods" },
	},
	{ id: "qc", position: { x: 250, y: 50 }, data: { label: "QC Inspection" } },
	{
		id: "putaway",
		position: { x: 450, y: 50 },
		data: { label: "Putaway Task" },
	},
];

const initialEdges = [
	{ id: "e1-2", source: "start", target: "qc" },
	{ id: "e2-3", source: "qc", target: "putaway" },
];

export function WorkflowBuilder() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const onConnect = useCallback(
		(params: any) => setEdges((eds) => addEdge(params, eds)),
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
			},
		]);
	};

	return (
		<div className="w-full h-full relative">
			<div className="absolute top-4 left-4 z-10 space-x-2">
				<Button size="sm" onClick={addNode}>
					Add Action Node
				</Button>
				<Button size="sm" variant="secondary">
					Save Workflow
				</Button>
			</div>
			<ReactFlow
				nodes={nodes}
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
