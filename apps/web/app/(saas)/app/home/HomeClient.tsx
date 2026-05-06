"use client";

import { Button } from "@repo/ui/button";
// import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";

// Warehouse network data structure
interface WarehouseNode {
	id: string;
	name: string;
	type: "NDC" | "LDC";
	region: string;
	lat: number;
	lon: number;
	inventory: number;
	capacity: number;
	status: "operational" | "warning" | "critical";
}

interface StockTransfer {
	from: string;
	to: string;
	quantity: number;
	sku: string;
	status: "in-transit" | "completed" | "pending";
}

const WAREHOUSES: WarehouseNode[] = [
	// NDCs
	{
		id: "ndc-neemrana",
		name: "Neemrana NDC",
		type: "NDC",
		region: "North & West",
		lat: 27.98,
		lon: 76.38,
		inventory: 45680,
		capacity: 60000,
		status: "operational",
	},
	{
		id: "ndc-sricity",
		name: "Sri City NDC",
		type: "NDC",
		region: "South & East",
		lat: 13.65,
		lon: 80.04,
		inventory: 38920,
		capacity: 55000,
		status: "operational",
	},

	// North Region LDCs
	{
		id: "ldc-gurgaon",
		name: "Gurgaon",
		type: "LDC",
		region: "North",
		lat: 28.46,
		lon: 77.03,
		inventory: 5240,
		capacity: 8000,
		status: "operational",
	},
	{
		id: "ldc-ghaziabad",
		name: "Ghaziabad",
		type: "LDC",
		region: "North",
		lat: 28.67,
		lon: 77.44,
		inventory: 4850,
		capacity: 7500,
		status: "operational",
	},
	{
		id: "ldc-delhi",
		name: "Delhi",
		type: "LDC",
		region: "North",
		lat: 28.61,
		lon: 77.23,
		inventory: 6120,
		capacity: 9000,
		status: "warning",
	},
	{
		id: "ldc-ludhiana",
		name: "Ludhiana",
		type: "LDC",
		region: "North",
		lat: 30.91,
		lon: 75.85,
		inventory: 3890,
		capacity: 6500,
		status: "operational",
	},
	{
		id: "ldc-chandigarh",
		name: "Chandigarh",
		type: "LDC",
		region: "North",
		lat: 30.73,
		lon: 76.78,
		inventory: 3210,
		capacity: 6000,
		status: "operational",
	},

	// West Region LDCs
	{
		id: "ldc-mumbai",
		name: "Mumbai",
		type: "LDC",
		region: "West",
		lat: 19.08,
		lon: 72.88,
		inventory: 7840,
		capacity: 11000,
		status: "critical",
	},
	{
		id: "ldc-ahmedabad",
		name: "Ahmedabad",
		type: "LDC",
		region: "West",
		lat: 23.03,
		lon: 72.59,
		inventory: 5620,
		capacity: 8500,
		status: "operational",
	},
	{
		id: "ldc-surat",
		name: "Surat",
		type: "LDC",
		region: "West",
		lat: 21.17,
		lon: 72.83,
		inventory: 4330,
		capacity: 7000,
		status: "operational",
	},
	{
		id: "ldc-jaipur",
		name: "Jaipur",
		type: "LDC",
		region: "West",
		lat: 26.91,
		lon: 75.79,
		inventory: 3980,
		capacity: 7000,
		status: "operational",
	},
	{
		id: "ldc-pune",
		name: "Pune",
		type: "LDC",
		region: "West",
		lat: 18.52,
		lon: 73.86,
		inventory: 5240,
		capacity: 8000,
		status: "operational",
	},

	// South Region LDCs
	{
		id: "ldc-chennai",
		name: "Chennai",
		type: "LDC",
		region: "South",
		lat: 13.08,
		lon: 80.27,
		inventory: 6890,
		capacity: 10000,
		status: "operational",
	},
	{
		id: "ldc-bengaluru",
		name: "Bengaluru",
		type: "LDC",
		region: "South",
		lat: 12.97,
		lon: 77.59,
		inventory: 7320,
		capacity: 10500,
		status: "operational",
	},
	{
		id: "ldc-hyderabad",
		name: "Hyderabad",
		type: "LDC",
		region: "South",
		lat: 17.39,
		lon: 78.49,
		inventory: 5940,
		capacity: 9000,
		status: "operational",
	},
	{
		id: "ldc-vijayawada",
		name: "Vijayawada",
		type: "LDC",
		region: "South",
		lat: 16.51,
		lon: 80.63,
		inventory: 3450,
		capacity: 6000,
		status: "operational",
	},
	{
		id: "ldc-cochin",
		name: "Cochin",
		type: "LDC",
		region: "South",
		lat: 9.93,
		lon: 76.27,
		inventory: 4180,
		capacity: 7000,
		status: "operational",
	},

	// East Region LDCs
	{
		id: "ldc-kolkata",
		name: "Kolkata",
		type: "LDC",
		region: "East",
		lat: 22.57,
		lon: 88.36,
		inventory: 6230,
		capacity: 9500,
		status: "operational",
	},
	{
		id: "ldc-guwahati",
		name: "Guwahati",
		type: "LDC",
		region: "East",
		lat: 26.14,
		lon: 91.74,
		inventory: 2890,
		capacity: 5500,
		status: "operational",
	},
];

// Connection mapping: NDC to LDCs
const CONNECTIONS = [
	// Neemrana to North
	{ from: "ndc-neemrana", to: "ldc-gurgaon" },
	{ from: "ndc-neemrana", to: "ldc-ghaziabad" },
	{ from: "ndc-neemrana", to: "ldc-delhi" },
	{ from: "ndc-neemrana", to: "ldc-ludhiana" },
	{ from: "ndc-neemrana", to: "ldc-chandigarh" },

	// Neemrana to West
	{ from: "ndc-neemrana", to: "ldc-mumbai" },
	{ from: "ndc-neemrana", to: "ldc-ahmedabad" },
	{ from: "ndc-neemrana", to: "ldc-surat" },
	{ from: "ndc-neemrana", to: "ldc-jaipur" },
	{ from: "ndc-neemrana", to: "ldc-pune" },

	// Sri City to South
	{ from: "ndc-sricity", to: "ldc-chennai" },
	{ from: "ndc-sricity", to: "ldc-bengaluru" },
	{ from: "ndc-sricity", to: "ldc-hyderabad" },
	{ from: "ndc-sricity", to: "ldc-vijayawada" },
	{ from: "ndc-sricity", to: "ldc-cochin" },

	// Sri City to East
	{ from: "ndc-sricity", to: "ldc-kolkata" },
	{ from: "ndc-sricity", to: "ldc-guwahati" },
];

// Mock active transfers
const ACTIVE_TRANSFERS: StockTransfer[] = [
	{
		from: "ndc-neemrana",
		to: "ldc-delhi",
		quantity: 240,
		sku: "AC-SPLIT-1.5T",
		status: "in-transit",
	},
	{
		from: "ndc-sricity",
		to: "ldc-bengaluru",
		quantity: 180,
		sku: "AC-WINDOW-1T",
		status: "in-transit",
	},
	{
		from: "ndc-neemrana",
		to: "ldc-mumbai",
		quantity: 320,
		sku: "AC-CASSETTE-2T",
		status: "in-transit",
	},
];

// // Custom icon creators with enhanced styling
// const createWarehouseIcon = (
// 	type: "NDC" | "LDC",
// 	status: "operational" | "warning" | "critical",
// 	name: string,
// ) => {
// 	const color =
// 		status === "critical"
// 			? "#ef4444"
// 			: status === "warning"
// 				? "#f59e0b"
// 				: type === "NDC"
// 					? "#3b82f6"
// 					: "#10b981";

// 	const size = type === "NDC" ? 32 : 20;
// 	const iconSymbol = type === "NDC" ? "◆" : "●";
// 	const pulseAnimation =
// 		status !== "operational"
// 			? `
// 		@keyframes pulse {
// 			0%, 100% { opacity: 1; transform: scale(1); }
// 			50% { opacity: 0.6; transform: scale(1.1); }
// 		}
// 	`
// 			: "";

// 	return L.divIcon({
// 		html: `
// 			<style>
// 				${pulseAnimation}
// 				.warehouse-marker {
// 					position: relative;
// 					display: flex;
// 					flex-direction: column;
// 					align-items: center;
// 					gap: 4px;
// 				}
// 				.warehouse-icon {
// 					width: ${size}px;
// 					height: ${size}px;
// 					background: ${color};
// 					border: 3px solid white;
// 					border-radius: 50%;
// 					box-shadow: 0 3px 8px rgba(0,0,0,0.4), 0 0 0 4px rgba(${status === "critical" ? "239, 68, 68" : status === "warning" ? "245, 158, 11" : type === "NDC" ? "59, 130, 246" : "16, 185, 129"}, 0.2);
// 					display: flex;
// 					align-items: center;
// 					justify-content: center;
// 					font-size: ${type === "NDC" ? "18px" : "12px"};
// 					color: white;
// 					font-weight: bold;
// 					animation: ${status !== "operational" ? "pulse 2s ease-in-out infinite" : "none"};
// 					cursor: pointer;
// 					transition: transform 0.2s;
// 				}
// 				.warehouse-icon:hover {
// 					transform: scale(1.15);
// 				}
// 				.warehouse-label {
// 					background: white;
// 					padding: 2px 8px;
// 					border-radius: 10px;
// 					font-size: 10px;
// 					font-weight: 600;
// 					color: #333;
// 					box-shadow: 0 2px 4px rgba(0,0,0,0.2);
// 					white-space: nowrap;
// 					pointer-events: none;
// 				}
// 			</style>
// 			<div class="warehouse-marker">
// 				<div class="warehouse-icon">${iconSymbol}</div>
// 				<div class="warehouse-label">${name.replace(/^(NDC|LDC)-/, "")}</div>
// 			</div>
// 		`,
// 		className: "",
// 		iconSize: [size + 60, size + 30],
// 		iconAnchor: [(size + 60) / 2, size / 2],
// 	});
// };

export default function HomeClient() {
	const [selectedWarehouse, setSelectedWarehouse] =
		useState<WarehouseNode | null>(null);
	const [activeView, setActiveView] = useState<"network" | "transfers">(
		"network",
	);

	const totalInventory = WAREHOUSES.reduce((sum, w) => sum + w.inventory, 0);
	const totalCapacity = WAREHOUSES.reduce((sum, w) => sum + w.capacity, 0);
	const utilizationRate = ((totalInventory / totalCapacity) * 100).toFixed(1);

	const criticalWarehouses = WAREHOUSES.filter(
		(w) => w.status === "critical",
	).length;
	const warningWarehouses = WAREHOUSES.filter(
		(w) => w.status === "warning",
	).length;

	return (
		<>
			<style jsx global>{`
				@keyframes pathFlow {
					0% {
						stroke-dashoffset: 0;
					}
					100% {
						stroke-dashoffset: -40;
					}
				}

				@keyframes activePathFlow {
					0% {
						stroke-dashoffset: 0;
					}
					100% {
						stroke-dashoffset: 30;
					}
				}

				.inactive-path {
					animation: pathFlow 3s linear infinite;
				}

				.active-path {
					stroke-dasharray: 10 5;
					animation: activePathFlow 1s linear infinite;
				}
			`}</style>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							WMS Command Center
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Real-time visibility across your 3-tier distribution
							network
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant={
								activeView === "network" ? "default" : "outline"
							}
							size="sm"
							onClick={() => setActiveView("network")}
						>
							Network View
						</Button>
						<Button
							variant={
								activeView === "transfers"
									? "default"
									: "outline"
							}
							size="sm"
							onClick={() => setActiveView("transfers")}
						>
							Active Transfers
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
