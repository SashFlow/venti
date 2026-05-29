"use client";

import {
	Background,
	Controls,
	type Edge,
	MarkerType,
	type Node,
	ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";

export type ProductLifecycleFlowProps = {
	returnEnabled: boolean;
	onReturn?: string;
	deadStockAction?: string;
};

export function ProductLifecycleFlow({
	returnEnabled,
	onReturn,
	deadStockAction,
}: ProductLifecycleFlowProps) {
	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);

	useEffect(() => {
		const newNodes: Node[] = [
			{
				id: "receive",
				position: { x: 250, y: 0 },
				data: { label: "Receive Inventory" },
				type: "input",
			},
			{
				id: "storage",
				position: { x: 250, y: 100 },
				data: { label: "Warehouse Storage" },
			},
			{
				id: "ship",
				position: { x: 250, y: 200 },
				data: { label: "Ship to Customer" },
				type: "output",
			},
		];

		const newEdges: Edge[] = [
			{
				id: "e-receive-storage",
				source: "receive",
				target: "storage",
				markerEnd: { type: MarkerType.ArrowClosed },
			},
			{
				id: "e-storage-ship",
				source: "storage",
				target: "ship",
				markerEnd: { type: MarkerType.ArrowClosed },
			},
		];

		if (returnEnabled) {
			newNodes.push({
				id: "return",
				position: { x: 50, y: 200 },
				data: { label: "Customer Return" },
			});
			newEdges.push({
				id: "e-ship-return",
				source: "ship",
				target: "return",
				animated: true,
				label: "Returns",
				markerEnd: { type: MarkerType.ArrowClosed },
			});

			const actionNodeId = `return-${onReturn || "restock"}`;
			newNodes.push({
				id: actionNodeId,
				position: { x: 50, y: 100 },
				data: { label: `Action: ${onReturn || "RESTOCK"}` },
			});
			newEdges.push({
				id: `e-return-${actionNodeId}`,
				source: "return",
				target: actionNodeId,
				markerEnd: { type: MarkerType.ArrowClosed },
			});

			if (onReturn === "RESTOCK" || !onReturn) {
				newEdges.push({
					id: `e-${actionNodeId}-storage`,
					source: actionNodeId,
					target: "storage",
					markerEnd: { type: MarkerType.ArrowClosed },
				});
			}
		}

		if (deadStockAction && deadStockAction !== "NONE") {
			newNodes.push({
				id: "dead-stock",
				position: { x: 450, y: 100 },
				data: { label: "Dead Stock Processing" },
			});
			newEdges.push({
				id: "e-storage-deadstock",
				source: "storage",
				target: "dead-stock",
				animated: true,
				label: "Age / Value",
				markerEnd: { type: MarkerType.ArrowClosed },
			});

			const dsActionNodeId = `ds-${deadStockAction}`;
			newNodes.push({
				id: dsActionNodeId,
				position: { x: 450, y: 200 },
				data: { label: `Action: ${deadStockAction}` },
				type: "output",
			});
			newEdges.push({
				id: `e-deadstock-${dsActionNodeId}`,
				source: "dead-stock",
				target: dsActionNodeId,
				markerEnd: { type: MarkerType.ArrowClosed },
			});
		}

		setNodes(newNodes);
		setEdges(newEdges);
	}, [returnEnabled, onReturn, deadStockAction]);

	return (
		<div className="h-[400px] w-full border rounded-lg bg-muted/5">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				fitView
				attributionPosition="bottom-right"
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
			>
				<Background />
				<Controls showInteractive={false} />
			</ReactFlow>
		</div>
	);
}
