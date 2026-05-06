"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	Clock,
	Package,
	TrendingUp,
	Truck,
} from "lucide-react";
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

interface Order {
	id: string;
	created: string;
	destination: string;
	status: "pending" | "completed" | "in-progress";
	quantity: number;
}

interface Task {
	id: string;
	title: string;
	status: "incomplete" | "complete";
	warehouse?: string;
}

interface BestSeller {
	name: string;
	type: string;
	sales: number;
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

// Mock tasks
const TASKS: Task[] = [
	{
		id: "1",
		title: "ADD YOUR BILLING INFORMATION",
		status: "incomplete",
	},
	{
		id: "2",
		title: "CONNECT YOUR SHOPIFY",
		status: "incomplete",
	},
	{
		id: "3",
		title: "CREATE CUSTOM PACKAGING",
		status: "incomplete",
	},
	{
		id: "4",
		title: "CREATE WAREHOUSE",
		status: "incomplete",
		warehouse: "GOKUSBROTHERSAL",
	},
];

// Mock recent orders
const RECENT_ORDERS: Order[] = [
	{
		id: "ORD-001",
		created: "2026-05-06",
		destination: "Mumbai LDC",
		status: "completed",
		quantity: 240,
	},
	{
		id: "ORD-002",
		created: "2026-05-05",
		destination: "Delhi LDC",
		status: "in-progress",
		quantity: 180,
	},
	{
		id: "ORD-003",
		created: "2026-05-04",
		destination: "Bengaluru LDC",
		status: "pending",
		quantity: 320,
	},
];

// Mock best sellers
const BEST_SELLERS: BestSeller[] = [
	{ name: "AC Split 1.5T", type: "Cooling Unit", sales: 1240 },
	{ name: "AC Window 1T", type: "Cooling Unit", sales: 980 },
	{ name: "AC Cassette 2T", type: "Cooling Unit", sales: 750 },
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
	const [selectedRegion, setSelectedRegion] = useState<string>("all");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");

	const totalInventory = WAREHOUSES.reduce((sum, w) => sum + w.inventory, 0);
	const totalCapacity = WAREHOUSES.reduce((sum, w) => sum + w.capacity, 0);
	const utilizationRate = ((totalInventory / totalCapacity) * 100).toFixed(1);

	const criticalWarehouses = WAREHOUSES.filter(
		(w) => w.status === "critical",
	).length;
	const warningWarehouses = WAREHOUSES.filter(
		(w) => w.status === "warning",
	).length;

	// Filter warehouses based on selected region and status
	const filteredWarehouses = WAREHOUSES.filter((w) => {
		const regionMatch =
			selectedRegion === "all" || w.region === selectedRegion;
		const statusMatch =
			selectedStatus === "all" || w.status === selectedStatus;
		return regionMatch && statusMatch;
	});

	// Get unique regions
	const regions = Array.from(new Set(WAREHOUSES.map((w) => w.region)));

	const outboundToday = ACTIVE_TRANSFERS.filter(
		(t) => t.status === "in-transit",
	).length;
	const inboundToday = ACTIVE_TRANSFERS.length;

	const getStatusColor = (status: string) => {
		switch (status) {
			case "critical":
				return "text-red-600";
			case "warning":
				return "text-amber-600";
			case "operational":
				return "text-green-600";
			default:
				return "text-gray-600";
		}
	};

	const getStatusBgColor = (status: string) => {
		switch (status) {
			case "critical":
				return "bg-red-50 border-red-200";
			case "warning":
				return "bg-amber-50 border-amber-200";
			case "operational":
				return "bg-green-50 border-green-200";
			default:
				return "bg-gray-50 border-gray-200";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "critical":
				return <AlertCircle className="w-4 h-4 text-red-600" />;
			case "warning":
				return <AlertTriangle className="w-4 h-4 text-amber-600" />;
			case "operational":
				return <CheckCircle className="w-4 h-4 text-green-600" />;
			default:
				return <Clock className="w-4 h-4 text-gray-600" />;
		}
	};

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

				{/* Key Metrics */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Inventory
							</CardTitle>
							<Package className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{totalInventory.toLocaleString()}
							</div>
							<p className="text-xs text-muted-foreground">
								Units across network
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Utilization Rate
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{utilizationRate}%
							</div>
							<p className="text-xs text-muted-foreground">
								{totalInventory.toLocaleString()} /{" "}
								{totalCapacity.toLocaleString()} units
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Critical Alerts
							</CardTitle>
							<AlertCircle className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{criticalWarehouses}
							</div>
							<p className="text-xs text-muted-foreground">
								Warehouses need attention
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Transfers
							</CardTitle>
							<Truck className="h-4 w-4 text-orange-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{ACTIVE_TRANSFERS.length}
							</div>
							<p className="text-xs text-muted-foreground">
								In-transit shipments
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Tasks */}
				<Card>
					<CardHeader>
						<CardTitle>Tasks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{TASKS.map((task) => (
								<div
									key={task.id}
									className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<input
											type="checkbox"
											checked={task.status === "complete"}
											className="w-4 h-4 rounded"
										/>
										<div>
											<p
												className={`text-sm font-medium ${
													task.status === "complete"
														? "line-through text-gray-500"
														: "text-gray-900"
												}`}
											>
												{task.title}
											</p>
											{task.warehouse && (
												<p className="text-xs text-gray-500">
													{task.warehouse}
												</p>
											)}
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="text-blue-600"
									>
										→
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-4">
					<Card className="flex-1">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">
								Filter by Region
							</CardTitle>
						</CardHeader>
						<CardContent>
							<select
								value={selectedRegion}
								onChange={(e) =>
									setSelectedRegion(e.target.value)
								}
								className="w-full px-3 py-2 border rounded-md text-sm"
							>
								<option value="all">All Regions</option>
								{regions.map((region) => (
									<option key={region} value={region}>
										{region}
									</option>
								))}
							</select>
						</CardContent>
					</Card>

					<Card className="flex-1">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">
								Filter by Status
							</CardTitle>
						</CardHeader>
						<CardContent>
							<select
								value={selectedStatus}
								onChange={(e) =>
									setSelectedStatus(e.target.value)
								}
								className="w-full px-3 py-2 border rounded-md text-sm"
							>
								<option value="all">All Status</option>
								<option value="operational">Operational</option>
								<option value="warning">Warning</option>
								<option value="critical">Critical</option>
							</select>
						</CardContent>
					</Card>
				</div>

				{/* Warehouse Information Panel */}
				<Card>
					<CardHeader>
						<CardTitle>
							Warehouse Network{" "}
							<span className="text-sm font-normal text-gray-500">
								({filteredWarehouses.length} warehouses)
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{filteredWarehouses.map((warehouse) => (
								<div
									key={warehouse.id}
									className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${getStatusBgColor(warehouse.status)} ${selectedWarehouse?.id === warehouse.id ? "ring-2 ring-blue-500" : ""}`}
									onClick={() =>
										setSelectedWarehouse(warehouse)
									}
								>
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-2">
											<span
												className={`text-lg font-bold ${getStatusColor(warehouse.status)}`}
											>
												{warehouse.type === "NDC"
													? "◆"
													: "●"}
											</span>
											<div>
												<h3 className="font-semibold text-sm">
													{warehouse.name}
												</h3>
												<p className="text-xs text-gray-600">
													{warehouse.region}
												</p>
											</div>
										</div>
										{getStatusIcon(warehouse.status)}
									</div>

									<div className="space-y-2">
										<div className="flex justify-between text-xs">
											<span className="text-gray-600">
												Inventory:
											</span>
											<span className="font-medium">
												{warehouse.inventory.toLocaleString()}
											</span>
										</div>
										<div className="flex justify-between text-xs">
											<span className="text-gray-600">
												Capacity:
											</span>
											<span className="font-medium">
												{warehouse.capacity.toLocaleString()}
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className={`h-2 rounded-full ${
													warehouse.status ===
													"critical"
														? "bg-red-600"
														: warehouse.status ===
																"warning"
															? "bg-amber-600"
															: "bg-green-600"
												}`}
												style={{
													width: `${(warehouse.inventory / warehouse.capacity) * 100}%`,
												}}
											/>
										</div>
										<div className="text-xs text-gray-600">
											{(
												(warehouse.inventory /
													warehouse.capacity) *
												100
											).toFixed(1)}
											% utilized
										</div>
									</div>

									<div className="mt-3 pt-3 border-t text-xs text-gray-600">
										Coords: {warehouse.lat.toFixed(2)},
										{warehouse.lon.toFixed(2)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Selected Warehouse Details */}
				{selectedWarehouse && (
					<Card className="border-blue-200 bg-blue-50">
						<CardHeader>
							<CardTitle className="text-lg">
								{selectedWarehouse.name} - Detailed View
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div>
									<p className="text-sm text-gray-600">
										Type
									</p>
									<p className="text-lg font-semibold">
										{selectedWarehouse.type}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Status
									</p>
									<p className="text-lg font-semibold capitalize">
										{selectedWarehouse.status}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Region
									</p>
									<p className="text-lg font-semibold">
										{selectedWarehouse.region}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Utilization
									</p>
									<p className="text-lg font-semibold">
										{(
											(selectedWarehouse.inventory /
												selectedWarehouse.capacity) *
											100
										).toFixed(1)}
										%
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Latitude
									</p>
									<p className="text-lg font-semibold">
										{selectedWarehouse.lat.toFixed(4)}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Longitude
									</p>
									<p className="text-lg font-semibold">
										{selectedWarehouse.lon.toFixed(4)}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Current Inventory
									</p>
									<p className="text-lg font-semibold">
										{selectedWarehouse.inventory.toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-600">
										Max Capacity
									</p>
									<p className="text-lg font-semibold">
										{selectedWarehouse.capacity.toLocaleString()}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Outbound & Inbound */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Truck className="w-5 h-5" />
								Outbound
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold mb-2">
								{outboundToday}
							</div>
							<p className="text-sm text-gray-600 mb-4">
								Shipments in transit today
							</p>
							<div className="space-y-2">
								{ACTIVE_TRANSFERS.filter(
									(t) => t.status === "in-transit",
								).map((transfer, idx) => {
									const fromWarehouse = WAREHOUSES.find(
										(w) => w.id === transfer.from,
									);
									const toWarehouse = WAREHOUSES.find(
										(w) => w.id === transfer.to,
									);
									return (
										<div
											key={idx}
											className="text-xs p-2 bg-gray-50 rounded border"
										>
											<p className="font-medium">
												{fromWarehouse?.name} →{" "}
												{toWarehouse?.name}
											</p>
											<p className="text-gray-600">
												{transfer.sku} (
												{transfer.quantity} units)
											</p>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="w-5 h-5" />
								Inbound
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold mb-2">
								{inboundToday}
							</div>
							<p className="text-sm text-gray-600 mb-4">
								Total incoming shipments
							</p>
							<div className="space-y-2">
								{ACTIVE_TRANSFERS.map((transfer, idx) => {
									const fromWarehouse = WAREHOUSES.find(
										(w) => w.id === transfer.from,
									);
									const toWarehouse = WAREHOUSES.find(
										(w) => w.id === transfer.to,
									);
									return (
										<div
											key={idx}
											className="text-xs p-2 bg-gray-50 rounded border"
										>
											<p className="font-medium">
												{fromWarehouse?.name} →{" "}
												{toWarehouse?.name}
											</p>
											<p className="text-gray-600">
												{transfer.sku} (
												{transfer.quantity} units)
											</p>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Recent Orders */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="text-left py-2 px-4 font-semibold">
											ID
										</th>
										<th className="text-left py-2 px-4 font-semibold">
											Created
										</th>
										<th className="text-left py-2 px-4 font-semibold">
											Destination
										</th>
										<th className="text-left py-2 px-4 font-semibold">
											Quantity
										</th>
										<th className="text-left py-2 px-4 font-semibold">
											Status
										</th>
									</tr>
								</thead>
								<tbody>
									{RECENT_ORDERS.map((order) => (
										<tr
											key={order.id}
											className="border-b hover:bg-gray-50"
										>
											<td className="py-2 px-4 font-medium">
												{order.id}
											</td>
											<td className="py-2 px-4 text-gray-600">
												{order.created}
											</td>
											<td className="py-2 px-4 text-gray-600">
												{order.destination}
											</td>
											<td className="py-2 px-4 text-gray-600">
												{order.quantity}
											</td>
											<td className="py-2 px-4">
												<span
													className={`inline-block px-2 py-1 rounded text-xs font-medium ${
														order.status ===
														"completed"
															? "bg-green-100 text-green-800"
															: order.status ===
																	"in-progress"
																? "bg-blue-100 text-blue-800"
																: "bg-yellow-100 text-yellow-800"
													}`}
												>
													{order.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{RECENT_ORDERS.length === 0 && (
								<p className="text-center py-4 text-gray-500">
									No recent orders
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Best Selling This Week */}
				<Card>
					<CardHeader>
						<CardTitle>Best Selling This Week</CardTitle>
					</CardHeader>
					<CardContent>
						{BEST_SELLERS.length > 0 ? (
							<div className="space-y-4">
								{BEST_SELLERS.map((item, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div className="flex-1">
											<p className="font-medium text-sm">
												{item.name}
											</p>
											<p className="text-xs text-gray-600">
												{item.type}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-sm">
												{item.sales}
											</p>
											<p className="text-xs text-gray-600">
												Units sold
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-center py-4 text-gray-500">
								Insufficient sales data
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
