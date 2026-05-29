"use client";

import {
	Background,
	Controls,
	type Edge,
	MarkerType,
	type Node,
	Position,
	ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";

export type ProductLifecycleFlowProps = {
	returnEnabled: boolean;
	onReturn?: string;
	deadStockAction?: string;
};

const getNodeStyle = (
	theme:
		| "emerald"
		| "blue"
		| "indigo"
		| "orange"
		| "yellow"
		| "fuchsia"
		| "rose"
		| "slate",
) => {
	const themes = {
		emerald: { bg: "#ecfdf5", border: "#10b981", text: "#064e3b" },
		blue: { bg: "#eff6ff", border: "#3b82f6", text: "#1e3a8a" },
		indigo: { bg: "#eef2ff", border: "#6366f1", text: "#312e81" },
		orange: { bg: "#fff7ed", border: "#f97316", text: "#7c2d12" },
		yellow: { bg: "#fefce8", border: "#eab308", text: "#713f12" },
		fuchsia: { bg: "#fdf4ff", border: "#d946ef", text: "#4a044e" },
		rose: { bg: "#fff1f2", border: "#f43f5e", text: "#881337" },
		slate: { bg: "#f8fafc", border: "#64748b", text: "#0f172a" },
	};
	const t = themes[theme];
	return {
		background: t.bg,
		border: `1px solid ${t.border}`,
		color: t.text,
		fontWeight: 600,
		borderRadius: "0.5rem",
		width: 160,
		padding: "12px 10px",
		fontSize: "12px",
		textAlign: "center" as const,
		boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
	};
};

const defaultEdgeStyle = {
	stroke: "#94a3b8",
	strokeWidth: 2,
};

const defaultMarker = {
	type: MarkerType.ArrowClosed,
	color: "#94a3b8",
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
				position: { x: 300, y: 50 },
				data: { label: "Receive Inventory" },
				sourcePosition: Position.Bottom,
				targetPosition: Position.Top,
				style: getNodeStyle("emerald"),
			},
			{
				id: "storage",
				position: { x: 300, y: 150 },
				data: { label: "Warehouse Storage" },
				sourcePosition: Position.Bottom,
				targetPosition: Position.Top,
				style: getNodeStyle("blue"),
			},
			{
				id: "ship",
				position: { x: 300, y: 250 },
				data: { label: "Ship to Customer" },
				sourcePosition: Position.Bottom,
				targetPosition: Position.Top,
				style: getNodeStyle("indigo"),
			},
		];

		const newEdges: Edge[] = [
			{
				id: "e-receive-storage",
				source: "receive",
				target: "storage",
				type: "smoothstep",
				markerEnd: defaultMarker,
				style: defaultEdgeStyle,
			},
			{
				id: "e-storage-ship",
				source: "storage",
				target: "ship",
				type: "smoothstep",
				markerEnd: defaultMarker,
				style: defaultEdgeStyle,
			},
		];

		if (returnEnabled) {
			newNodes.push({
				id: "return",
				position: { x: 50, y: 250 },
				data: { label: "Customer Return" },
				sourcePosition: Position.Top,
				targetPosition: Position.Right,
				style: getNodeStyle("orange"),
			});
			newEdges.push({
				id: "e-ship-return",
				source: "ship",
				target: "return",
				type: "smoothstep",
				animated: true,
				label: "Returns",
				labelStyle: { fill: "#64748b", fontWeight: 600, fontSize: 11 },
				labelBgPadding: [8, 4],
				labelBgBorderRadius: 4,
				labelBgStyle: {
					fill: "#f8fafc",
					color: "#f8fafc",
					fillOpacity: 0.9,
				},
				markerEnd: defaultMarker,
				style: defaultEdgeStyle,
			});

			const actionNodeId = `return-${onReturn || "restock"}`;
			newNodes.push({
				id: actionNodeId,
				position: { x: 50, y: 150 },
				data: { label: `Action: ${onReturn || "RESTOCK"}` },
				sourcePosition: Position.Right,
				targetPosition: Position.Bottom,
				style: getNodeStyle("yellow"),
			});
			newEdges.push({
				id: `e-return-${actionNodeId}`,
				source: "return",
				target: actionNodeId,
				type: "smoothstep",
				markerEnd: defaultMarker,
				style: defaultEdgeStyle,
			});

			if (onReturn === "RESTOCK" || !onReturn) {
				newEdges.push({
					id: `e-${actionNodeId}-storage`,
					source: actionNodeId,
					target: "storage",
					type: "smoothstep",
					markerEnd: defaultMarker,
					style: defaultEdgeStyle,
				});
			}
		}

		if (deadStockAction && deadStockAction !== "NONE") {
			newNodes.push({
				id: "dead-stock",
				position: { x: 550, y: 150 },
				data: { label: "Dead Stock Processing" },
				sourcePosition: Position.Bottom,
				targetPosition: Position.Left,
				style: getNodeStyle("fuchsia"),
			});
			newEdges.push({
				id: "e-storage-deadstock",
				source: "storage",
				target: "dead-stock",
				type: "smoothstep",
				animated: true,
				label: "Age / Value",
				labelStyle: { fill: "#64748b", fontWeight: 600, fontSize: 11 },
				labelBgPadding: [8, 4],
				labelBgBorderRadius: 4,
				labelBgStyle: {
					fill: "#f8fafc",
					color: "#f8fafc",
					fillOpacity: 0.9,
				},
				markerEnd: defaultMarker,
				style: defaultEdgeStyle,
			});

			const dsActionNodeId = `ds-${deadStockAction}`;
			newNodes.push({
				id: dsActionNodeId,
				position: { x: 550, y: 250 },
				data: { label: `Action: ${deadStockAction}` },
				sourcePosition: Position.Bottom,
				targetPosition: Position.Top,
				style: getNodeStyle("rose"),
			});
			newEdges.push({
				id: `e-deadstock-${dsActionNodeId}`,
				source: "dead-stock",
				target: dsActionNodeId,
				type: "smoothstep",
				markerEnd: defaultMarker,
				style: defaultEdgeStyle,
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
