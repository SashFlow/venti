"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { cn } from "@repo/ui/utils";
import L from "leaflet";
import {
	AlertTriangle,
	ArrowUpRight,
	Building2,
	Package,
	TrendingDown,
	TrendingUp,
	Truck,
	Warehouse,
	ZapOff,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import {
	MapContainer,
	Marker,
	Polyline,
	Popup,
	TileLayer,
	Tooltip,
} from "react-leaflet";

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

// Custom icon creators with enhanced styling
const createWarehouseIcon = (
	type: "NDC" | "LDC",
	status: "operational" | "warning" | "critical",
	name: string,
) => {
	const color =
		status === "critical"
			? "#ef4444"
			: status === "warning"
				? "#f59e0b"
				: type === "NDC"
					? "#3b82f6"
					: "#10b981";

	const size = type === "NDC" ? 32 : 20;
	const iconSymbol = type === "NDC" ? "◆" : "●";
	const pulseAnimation =
		status !== "operational"
			? `
		@keyframes pulse {
			0%, 100% { opacity: 1; transform: scale(1); }
			50% { opacity: 0.6; transform: scale(1.1); }
		}
	`
			: "";

	return L.divIcon({
		html: `
			<style>
				${pulseAnimation}
				.warehouse-marker {
					position: relative;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
				}
				.warehouse-icon {
					width: ${size}px;
					height: ${size}px;
					background: ${color};
					border: 3px solid white;
					border-radius: 50%;
					box-shadow: 0 3px 8px rgba(0,0,0,0.4), 0 0 0 4px rgba(${status === "critical" ? "239, 68, 68" : status === "warning" ? "245, 158, 11" : type === "NDC" ? "59, 130, 246" : "16, 185, 129"}, 0.2);
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: ${type === "NDC" ? "18px" : "12px"};
					color: white;
					font-weight: bold;
					animation: ${status !== "operational" ? "pulse 2s ease-in-out infinite" : "none"};
					cursor: pointer;
					transition: transform 0.2s;
				}
				.warehouse-icon:hover {
					transform: scale(1.15);
				}
				.warehouse-label {
					background: white;
					padding: 2px 8px;
					border-radius: 10px;
					font-size: 10px;
					font-weight: 600;
					color: #333;
					box-shadow: 0 2px 4px rgba(0,0,0,0.2);
					white-space: nowrap;
					pointer-events: none;
				}
			</style>
			<div class="warehouse-marker">
				<div class="warehouse-icon">${iconSymbol}</div>
				<div class="warehouse-label">${name.replace(/^(NDC|LDC)-/, "")}</div>
			</div>
		`,
		className: "",
		iconSize: [size + 60, size + 30],
		iconAnchor: [(size + 60) / 2, size / 2],
	});
};

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
							activeView === "transfers" ? "default" : "outline"
						}
						size="sm"
						onClick={() => setActiveView("transfers")}
					>
						Active Transfers
					</Button>
				</div>
			</div>

			{/* Executive KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Inventory
						</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalInventory.toLocaleString()} units
						</div>
						<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
							<TrendingUp className="h-3 w-3 text-chart-2" />
							<span className="text-chart-2">+12.5%</span> from
							last month
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Network Utilization
						</CardTitle>
						<Warehouse className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{utilizationRate}%
						</div>
						<div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary transition-all"
								style={{ width: `${utilizationRate}%` }}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Transfers
						</CardTitle>
						<Truck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{ACTIVE_TRANSFERS.length}
						</div>
						<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
							<TrendingDown className="h-3 w-3 text-chart-3" />
							<span className="text-chart-3">-8.2%</span> vs
							yesterday
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							System Health
						</CardTitle>
						{criticalWarehouses > 0 ? (
							<AlertTriangle className="h-4 w-4 text-destructive" />
						) : (
							<ZapOff className="h-4 w-4 text-chart-2" />
						)}
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{criticalWarehouses > 0
								? `${criticalWarehouses} Critical`
								: "All Clear"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{warningWarehouses} warnings across network
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Map Visualization */}
				<div className="lg:col-span-8">
					<Card className="h-[600px]">
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Distribution Network Map</span>
								<div className="flex items-center gap-4 text-xs font-normal">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-primary" />
										<span>NDC (2)</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-2.5 h-2.5 rounded-full bg-chart-2" />
										<span>
											LDC (
											{
												WAREHOUSES.filter(
													(w) => w.type === "LDC",
												).length
											}
											)
										</span>
									</div>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent className="h-[calc(100%-80px)]">
							<MapContainer
								center={[22, 82]}
								zoom={5}
								scrollWheelZoom={true}
								className="w-full h-full rounded-lg"
								style={{ height: "100%", minHeight: "500px" }}
							>
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>

								{/* Connection Lines */}
								{CONNECTIONS.map((connection, idx) => {
									const from = WAREHOUSES.find(
										(w) => w.id === connection.from,
									);
									const to = WAREHOUSES.find(
										(w) => w.id === connection.to,
									);
									if (!from || !to) {
										return null;
									}

									const activeTransfer =
										ACTIVE_TRANSFERS.find(
											(t) =>
												t.from === connection.from &&
												t.to === connection.to,
										);
									const isActive =
										activeView === "transfers" &&
										activeTransfer;

									return (
										<React.Fragment key={idx}>
											{/* Base connection line */}
											<Polyline
												positions={[
													[from.lat, from.lon],
													[to.lat, to.lon],
												]}
												pathOptions={{
													color: isActive
														? "#3b82f6"
														: "#64748b",
													weight: isActive ? 4 : 2.5,
													opacity: isActive
														? 0.8
														: 0.6,
													lineCap: "round",
													dashArray: isActive
														? undefined
														: "6, 8",
												}}
												className={
													isActive
														? "active-path"
														: "inactive-path"
												}
											>
												<Tooltip sticky>
													<div className="text-xs">
														<div className="font-semibold">
															{from.name} →{" "}
															{to.name}
														</div>
														{isActive &&
															activeTransfer && (
																<div className="text-muted-foreground mt-1">
																	{
																		activeTransfer.quantity
																	}{" "}
																	units
																	<br />
																	{
																		activeTransfer.sku
																	}
																	<br />
																	Status:{" "}
																	{
																		activeTransfer.status
																	}
																</div>
															)}
													</div>
												</Tooltip>
											</Polyline>
											{/* Glow effect for active transfers */}
											{isActive && (
												<Polyline
													positions={[
														[from.lat, from.lon],
														[to.lat, to.lon],
													]}
													pathOptions={{
														color: "#60a5fa",
														weight: 8,
														opacity: 0.3,
														lineCap: "round",
													}}
												/>
											)}
										</React.Fragment>
									);
								})}

								{/* Warehouse Markers */}
								{WAREHOUSES.map((warehouse) => {
									const utilizationPercent =
										(warehouse.inventory /
											warehouse.capacity) *
										100;
									return (
										<Marker
											key={warehouse.id}
											position={[
												warehouse.lat,
												warehouse.lon,
											]}
											icon={createWarehouseIcon(
												warehouse.type,
												warehouse.status,
												warehouse.name,
											)}
											eventHandlers={{
												click: () => {
													setSelectedWarehouse(
														warehouse,
													);
												},
											}}
										>
											<Popup>
												<div className="p-3 min-w-[200px]">
													<div className="flex items-start justify-between mb-2">
														<div>
															<h3 className="font-bold text-sm mb-0.5">
																{warehouse.name}
															</h3>
															<p className="text-xs text-muted-foreground">
																{warehouse.type}{" "}
																•{" "}
																{
																	warehouse.region
																}
															</p>
														</div>
														<span
															className={`text-xs px-2 py-0.5 rounded-full ${
																warehouse.status ===
																"operational"
																	? "bg-chart-2 text-white"
																	: warehouse.status ===
																			"warning"
																		? "bg-chart-3 text-white"
																		: "bg-destructive text-white"
															}`}
														>
															{warehouse.status}
														</span>
													</div>
													<div className="space-y-2 mt-2">
														<div className="flex justify-between text-xs">
															<span className="text-muted-foreground">
																Inventory:
															</span>
															<span className="font-semibold">
																{warehouse.inventory.toLocaleString()}
															</span>
														</div>
														<div className="flex justify-between text-xs">
															<span className="text-muted-foreground">
																Capacity:
															</span>
															<span className="font-semibold">
																{warehouse.capacity.toLocaleString()}
															</span>
														</div>
														<div className="mt-2">
															<div className="flex justify-between text-xs mb-1">
																<span className="text-muted-foreground">
																	Utilization
																</span>
																<span className="font-semibold">
																	{utilizationPercent.toFixed(
																		1,
																	)}
																	%
																</span>
															</div>
															<div className="w-full bg-muted rounded-full h-2">
																<div
																	className="h-2 rounded-full transition-all"
																	style={{
																		width: `${utilizationPercent}%`,
																		backgroundColor:
																			utilizationPercent >
																			85
																				? "#ef4444"
																				: utilizationPercent >
																						70
																					? "#f59e0b"
																					: "#10b981",
																	}}
																/>
															</div>
														</div>
													</div>
												</div>
											</Popup>
										</Marker>
									);
								})}
							</MapContainer>
						</CardContent>
					</Card>
				</div>

				{/* Right Sidebar */}
				<div className="lg:col-span-4 space-y-4">
					{/* Selected Warehouse Details */}
					{selectedWarehouse ? (
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center justify-between">
									<span>{selectedWarehouse.name}</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											setSelectedWarehouse(null)
										}
									>
										✕
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="text-muted-foreground">
											Type
										</span>
										<span className="font-semibold">
											{selectedWarehouse.type}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm mb-1">
										<span className="text-muted-foreground">
											Region
										</span>
										<span className="font-semibold">
											{selectedWarehouse.region}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											Status
										</span>
										<span
											className={cn(
												"font-semibold capitalize",
												selectedWarehouse.status ===
													"operational" &&
													"text-chart-2",
												selectedWarehouse.status ===
													"warning" && "text-chart-3",
												selectedWarehouse.status ===
													"critical" &&
													"text-destructive",
											)}
										>
											{selectedWarehouse.status}
										</span>
									</div>
								</div>

								<div className="pt-4 border-t">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium">
											Inventory
										</span>
										<span className="text-lg font-bold">
											{selectedWarehouse.inventory.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-muted-foreground">
											Capacity
										</span>
										<span className="text-sm">
											{selectedWarehouse.capacity.toLocaleString()}
										</span>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<div
											className={cn(
												"h-full transition-all",
												selectedWarehouse.status ===
													"critical" &&
													"bg-destructive",
												selectedWarehouse.status ===
													"warning" && "bg-chart-3",
												selectedWarehouse.status ===
													"operational" &&
													"bg-chart-2",
											)}
											style={{
												width: `${(selectedWarehouse.inventory / selectedWarehouse.capacity) * 100}%`,
											}}
										/>
									</div>
									<div className="text-xs text-muted-foreground mt-1 text-right">
										{(
											(selectedWarehouse.inventory /
												selectedWarehouse.capacity) *
											100
										).toFixed(1)}
										% utilized
									</div>
								</div>

								<div className="pt-4 border-t">
									<Button className="w-full" size="sm">
										<Building2 className="mr-2 h-4 w-4" />
										View Warehouse Details
									</Button>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-12 text-center">
								<Building2 className="h-12 w-12 text-muted-foreground mb-4" />
								<p className="text-sm font-medium">
									Select a warehouse
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Click on any node to view details
								</p>
							</CardContent>
						</Card>
					)}

					{/* Active Transfers */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								Active Transfers
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{ACTIVE_TRANSFERS.map((transfer, idx) => {
								const from = WAREHOUSES.find(
									(w) => w.id === transfer.from,
								);
								const to = WAREHOUSES.find(
									(w) => w.id === transfer.to,
								);

								return (
									<div
										key={idx}
										className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
									>
										<div className="p-2 rounded-full bg-primary/10">
											<Truck className="h-4 w-4 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-xs font-semibold truncate">
													{from?.name}
												</span>
												<ArrowUpRight className="h-3 w-3 text-muted-foreground shrink-0" />
												<span className="text-xs font-semibold truncate">
													{to?.name}
												</span>
											</div>
											<p className="text-xs text-muted-foreground">
												{transfer.quantity} units •{" "}
												{transfer.sku}
											</p>
											<div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
												<div className="h-full bg-primary w-2/3 animate-pulse" />
											</div>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>
				</div>
				</div>
			</div>
		</>
	);
}
