import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import type { LucideIcon } from "lucide-react";
import {
	ArrowUpRight,
	Box,
	Boxes,
	DoorOpen,
	Download,
	Layers as LayersIcon,
	LayoutGrid,
	Map as MapIcon,
	MousePointer2,
	Package,
	PackageOpen,
	Plus,
	RotateCcw,
	Rows3,
	Square,
	Trash2,
	Truck,
} from "lucide-react";
import { toast } from "sonner";
import { AgvFleetPanel } from "./components/AgvFleetPanel";
import CanvasEditor from "./components/CanvasEditor";
import Inspector from "./components/Inspector";
import IsoView from "./components/IsoView";
import ThreeView from "./components/ThreeView";
import { Tip } from "./components/Tip";
import { useWarehouseInventory } from "./hooks/use-warehouse-inventory";
import { parseRoutePlan } from "./lib/route-viz-types";
import {
	locationsToWarehouse,
	warehouseToLayoutPayload,
} from "./lib/warehouse-layout-serializer";
import type {
	Asset,
	AssetType,
	HandlingUnit,
	StorageUnit,
	StorageUnitType,
	Tool,
	ViewMode,
	WarehouseFloor,
	Zone,
	ZoneType,
} from "./lib/warehouse-types";
import { ZONE_DEFAULT_COLORS } from "./lib/warehouse-types";
import { useWarehouse } from "./lib/warehouse-store";
import { makeAsset, makeStorageUnit } from "./lib/warehouse-store";
import { useAgvFleet } from "./hooks/use-agv-fleet";

const TOOLS: { id: Tool; icon: LucideIcon; label: string }[] = [
	{ id: "select", icon: MousePointer2, label: "Select" },
	{ id: "WALL", icon: Square, label: "Wall" },
	{ id: "AREA", icon: LayoutGrid, label: "Area / Zone region" },
	{ id: "RACK", icon: Package, label: "Rack" },
	{ id: "SHELF", icon: Rows3, label: "Shelf" },
	{ id: "BIN", icon: PackageOpen, label: "Bin" },
	{ id: "AISLE", icon: LayersIcon, label: "Aisle" },
	{ id: "DOCK_DOOR", icon: DoorOpen, label: "Dock door" },
	{ id: "STAIRS", icon: ArrowUpRight, label: "Stairs" },
];

const Tabs = [
	{
		id: "2d",
		label: "2D",
		icon: MapIcon,
		tip: "2D top-down editor",
	},
	{
		id: "iso",
		label: "Iso",
		icon: LayoutGrid,
		tip: "Isometric preview",
	},
	{
		id: "3d",
		label: "3D",
		icon: Box,
		tip: "3D perspective preview",
	},
] as {
	id: ViewMode;
	label: string;
	icon: LucideIcon;
	tip: string;
}[];

import { useSidebar } from "@repo/ui/shadcn-sidebar";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LayoutManagerProps = {
	warehouseId: string;
	organizationId: string;
	warehouseName: string;
	warehouseCode: string;
};

const Index = ({
	warehouseId,
	organizationId,
	warehouseName,
	warehouseCode,
}: LayoutManagerProps) => {
	useSidebar();
	const searchParams = useSearchParams();
	const waveIdParam = searchParams.get("waveId");
	const viewParam = searchParams.get("view");
	const highlightLocationId = searchParams.get("highlightLocationId");
	const {
		warehouse,
		activeFloor,
		selection,
		setSelection,
		setActiveFloor,
		addFloor,
		removeFloor,
		addStorageUnit,
		updateStorageUnit,
		removeStorageUnit,
		addAsset,
		updatePlacement,
		addZone,
		updateZone,
		removeZone,
		addHandlingUnit,
		updateHandlingUnit,
		removeHandlingUnit,
		generateShelvesForRack,
		reset,
		clearActiveFloor,
		initFromWarehouse,
	} = useWarehouse(warehouseId);
	const { fleet: agvFleet } = useAgvFleet();

	const queryClient = useQueryClient();
	const [tool, setTool] = useState<Tool>("select");
	const [operationsMode, setOperationsMode] = useState(false);
	const [highlightPicker, setHighlightPicker] = useState<string | null>(
		"all",
	);
	const [activeZoneId, setActiveZoneId] = useState<string | undefined>(
		warehouse.zones[0]?.id,
	);
	const [view, setView] = useState<ViewMode>("2d");

	// Some layout procedures are new; keep client resilient to typegen lag.
	const layoutApi = orpc.warehouse.layout as any;

	const { data: publishedLayout, error: publishedLayoutError } = useQuery({
		...layoutApi.load.queryOptions({
			input: { organizationId, warehouseId },
		}),
		enabled: Boolean(organizationId && warehouseId),
	});

	const { data: draftLayout, error: draftLayoutError } = useQuery({
		...layoutApi.getDraft.queryOptions({
			input: { organizationId, warehouseId },
		}),
		enabled: Boolean(organizationId && warehouseId && !operationsMode),
	});

	useEffect(() => {
		if (publishedLayoutError || draftLayoutError) {
			toast.error("Failed to load layout from backend");
		}
	}, [publishedLayoutError, draftLayoutError]);

	useEffect(() => {
		let locations: unknown[] = [];
		let assets: unknown[] = [];
		if (operationsMode) {
			locations = (publishedLayout as any)?.locations ?? [];
			assets = (publishedLayout as any)?.assets ?? [];
		} else {
			const draftScene = (draftLayout as any)?.scene;
			if (Array.isArray(draftScene?.locations) && draftScene.locations.length > 0) {
				locations = draftScene.locations;
				assets = draftScene.assets ?? [];
			} else {
				locations = (publishedLayout as any)?.locations ?? [];
				assets = (publishedLayout as any)?.assets ?? [];
			}
		}
		if (!Array.isArray(locations) || locations.length === 0) {
			return;
		}
		const w = locationsToWarehouse(
			locations as any,
			{
				name: warehouseName,
				code: warehouseCode,
				timezone: "UTC",
			},
			Array.isArray(assets) ? (assets as any) : [],
		);
		initFromWarehouse(w);
	}, [
		operationsMode,
		draftLayout,
		publishedLayout,
		initFromWarehouse,
		warehouseName,
		warehouseCode,
	]);

	const { data: waveData } = useQuery({
		...orpc.orders.getWave.queryOptions({
			input: {
				organizationId,
				waveId: waveIdParam ?? "",
			},
		}),
		enabled: Boolean(organizationId && waveIdParam),
	});

	const routePlan = useMemo(
		() => parseRoutePlan((waveData as any)?.wave?.routePlan),
		[(waveData as any)?.wave?.routePlan],
	);

	useEffect(() => {
		if (!waveIdParam && !highlightLocationId) {
			return;
		}
		setOperationsMode(true);
		setTool("select");
		if (viewParam === "3d" || viewParam === "2d" || viewParam === "iso") {
			setView(viewParam);
		} else if (highlightLocationId || waveIdParam) {
			setView("3d");
		}
	}, [waveIdParam, viewParam, highlightLocationId]);

	useEffect(() => {
		if (highlightLocationId) {
			setSelection({ kind: "storage", id: highlightLocationId });
		}
	}, [highlightLocationId, setSelection]);

	const { byLocationId, maxQty, getSummary } = useWarehouseInventory(
		organizationId,
		warehouseId,
		operationsMode,
	);

	const selectedStorage = useMemo(() => {
		if (!selection || selection.kind !== "storage") {
			return undefined;
		}
		for (const f of warehouse.floors) {
			const u = f.storageUnits.find(
				(s: StorageUnit) => s.id === selection.id,
			);
			if (u) {
				return u;
			}
		}
		return undefined;
	}, [warehouse, selection]);

	const selectedHandling = useMemo(() => {
		if (!selection || selection.kind !== "handling") {
			return undefined;
		}
		return warehouse.handlingUnits.find(
			(h: HandlingUnit) => h.id === selection.id,
		);
	}, [warehouse, selection]);

	const stats = useMemo(() => {
		const units = warehouse.floors.flatMap(
			(f: WarehouseFloor) => f.storageUnits,
		);
		const assets = warehouse.floors.flatMap(
			(f: WarehouseFloor) => f.assets,
		);
		return {
			floors: warehouse.floors.length,
			zones: warehouse.zones.length,
			racks: units.filter((u: StorageUnit) => u.type === "RACK").length,
			walls: assets.filter((a: Asset) => a.type === "WALL").length,
			bins: units.filter((u: StorageUnit) => u.type === "BIN").length,
			hu: warehouse.handlingUnits.length,
		};
	}, [warehouse]);

	const handleExport = () => {
		const blob = new Blob([JSON.stringify(warehouse, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${warehouse.code.toLowerCase()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success("Warehouse exported");
	};

	const saveDraftMutation = useMutation<any, any, any>(
		layoutApi.saveDraft.mutationOptions() as any,
	);
	const publishMutation = useMutation<any, any, any>(
		layoutApi.publish.mutationOptions() as any,
	);

	const handleSaveDraft = async () => {
		try {
			const scene = warehouseToLayoutPayload(warehouse);
			await saveDraftMutation.mutateAsync({
				organizationId,
				warehouseId,
				scene,
			});
			await queryClient.invalidateQueries({
				queryKey: layoutApi.getDraft.key(),
			});
			toast.success("Draft saved");
		} catch {
			toast.error("Failed to save draft");
		}
	};

	const handlePublish = async () => {
		try {
			const scene = warehouseToLayoutPayload(warehouse);
			await saveDraftMutation.mutateAsync({
				organizationId,
				warehouseId,
				scene,
			});
			await publishMutation.mutateAsync({
				organizationId,
				warehouseId,
			});
			await queryClient.invalidateQueries({
				queryKey: layoutApi.load.key(),
			});
			await queryClient.invalidateQueries({
				queryKey: layoutApi.getDraft.key(),
			});
			toast.success("Layout published");
		} catch {
			toast.error("Failed to publish layout");
		}
	};

	return (
		<div className="flex flex-col bg-surface text-foreground overflow-hidden max-h-[800px] w-full max-w-screen md:max-w-[calc(100vw-20rem)]">
			{/* Header */}
			<header className="h-14 shrink-0 border-b border-border bg-surface-elevated flex items-center px-4 gap-4">
				<div className="flex items-center gap-2">
					<div className="w-7 h-7 rounded-md bg-linear-to-br from-primary to-primary-glow flex items-center justify-center shadow-sm">
						<Boxes className="w-4 h-4 text-primary-foreground" />
					</div>
					<div>
						<h1 className="text-sm font-semibold leading-none">
							{warehouse.name}
						</h1>
						<p className="text-[11px] text-muted-foreground leading-none mt-0.5 font-mono">
							{warehouse.code}
						</p>
					</div>
				</div>

				<div className="h-6 w-px bg-border mx-2" />

				<div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
					<span>{stats.floors} floors</span>
					<span className="text-border-strong">·</span>
					<span>{stats.zones} zones</span>
					<span className="text-border-strong">·</span>
					<span>{stats.racks} racks</span>
					<span className="text-border-strong">·</span>
					<span>{stats.walls} walls</span>
					<span className="text-border-strong">·</span>
					<span>{stats.hu} HU</span>
				</div>

				<div className="ml-auto flex items-center gap-2">
					{routePlan && (
						<div className="flex items-center bg-secondary rounded-md p-0.5">
							<button
								type="button"
								onClick={() => setHighlightPicker("all")}
								className={cn(
									"px-2 h-7 text-xs font-medium rounded transition-all",
									highlightPicker === "all"
										? "bg-surface-elevated text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								All routes
							</button>
							{routePlan.pickers.map((picker) => (
								<button
									key={picker.label}
									type="button"
									onClick={() =>
										setHighlightPicker(picker.label)
									}
									className={cn(
										"px-2 h-7 text-xs font-medium rounded inline-flex items-center gap-1 transition-all",
										highlightPicker === picker.label
											? "bg-surface-elevated text-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									<span
										className="size-2 rounded-full"
										style={{
											backgroundColor: picker.color,
										}}
									/>
									{picker.label}
								</button>
							))}
						</div>
					)}
					<Tip label="Toggle layout design vs inventory operations view">
						<button
							type="button"
							onClick={() => {
								setOperationsMode((v) => !v);
								setTool("select");
							}}
							className={cn(
								"px-3 h-7 text-xs font-medium rounded border transition-all",
								operationsMode
									? "bg-primary text-primary-foreground border-primary"
									: "bg-secondary text-muted-foreground border-border hover:text-foreground",
							)}
						>
							{operationsMode ? "Operations" : "Layout"}
						</button>
					</Tip>
					<div className="flex items-center bg-secondary rounded-md p-0.5">
						{Tabs.map(({ id, label, icon: Icon, tip }) => (
							<Tip key={id} label={tip}>
								<button
									type="button"
									onClick={() => setView(id)}
									className={cn(
										"px-3 h-7 text-xs font-medium rounded inline-flex items-center gap-1.5 transition-all",
										view === id
											? "bg-surface-elevated text-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									<Icon className="w-3.5 h-3.5" />
									{label}
								</button>
							</Tip>
						))}
					</div>
					<Tip label="Save layout to backend">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSaveDraft}
							className="gap-1.5"
						>
							💾 Save draft
						</Button>
					</Tip>
					<Tip label="Publish draft to operational layout">
						<Button
							variant="default"
							size="sm"
							onClick={() => {
								if (
									confirm(
										"Publish this draft? This will overwrite operational warehouse locations/assets.",
									)
								) {
									void handlePublish();
								}
							}}
							className="gap-1.5"
						>
							📤 Publish
						</Button>
					</Tip>
					<Tip label="Download warehouse as JSON">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleExport}
							className="gap-1.5"
						>
							<Download className="w-3.5 h-3.5" /> Export
						</Button>
					</Tip>
				</div>
			</header>

			{/* Floor tab strip */}
			<div className="h-9 shrink-0 border-b border-border bg-surface-elevated flex items-center px-3 gap-1 overflow-x-auto">
				<span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
					Floor
				</span>
				{warehouse.floors
					.slice()
					.sort((a, b) => a.floorNumber - b.floorNumber)
					.map((f) => {
						const isActive = f.id === warehouse.activeFloorId;
						return (
							<div
								key={f.id}
								className={cn(
									"h-7 rounded text-xs font-medium inline-flex items-center transition-colors group",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-accent hover:text-foreground",
								)}
							>
								<button
									type="button"
									onClick={() => setActiveFloor(f.id)}
									className="h-7 pl-3 pr-2 inline-flex items-center gap-1.5"
								>
									<span className="font-mono opacity-70">
										{f.code}
									</span>
									<span>{f.name}</span>
									{f.elevationMm > 0 && (
										<span className="font-mono text-[10px] opacity-70">
											+{(f.elevationMm / 1000).toFixed(1)}
											m
										</span>
									)}
								</button>
								{warehouse.floors.length > 1 && (
									<Tip label={`Delete floor "${f.name}"`}>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												if (
													confirm(
														`Delete floor "${f.name}"? All its units will be removed.`,
													)
												) {
													removeFloor(f.id);
												}
											}}
											className={cn(
												"h-7 w-6 inline-flex items-center justify-center rounded-r opacity-60 hover:opacity-100",
												isActive
													? "hover:bg-primary-foreground/20"
													: "hover:text-destructive",
											)}
										>
											<Trash2 className="w-3 h-3" />
										</button>
									</Tip>
								)}
							</div>
						);
					})}
				<Tip label="Add a new floor or mezzanine">
					<Button
						size="sm"
						variant="ghost"
						className="h-7 px-2 gap-1 text-xs"
						onClick={() => {
							const name = prompt("Floor name?", "Mezzanine");
							if (!name) {
								return;
							}
							const elev = Number(
								prompt(
									"Elevation in meters above ground?",
									"3",
								) ?? 0,
							);
							addFloor({ name, elevationMm: elev * 1000 });
						}}
					>
						<Plus className="w-3.5 h-3.5" /> Floor
					</Button>
				</Tip>
			</div>

			{/* Main */}
			<div className="flex-1 flex min-h-0">
				{/* Tool + zones sidebar */}
				{view === "2d" && (
					<aside className="w-14 shrink-0 border-r border-border bg-surface-elevated flex flex-col items-center py-3 gap-1">
						{!operationsMode &&
							TOOLS.map(({ id, icon: Icon, label }) => (
							<Tip key={id} label={label} side="right">
								<button
									type="button"
									onClick={() => setTool(id)}
									className={cn(
										"w-10 h-10 rounded-md flex items-center justify-center transition-colors",
										tool === id
											? "bg-primary text-primary-foreground shadow-sm"
											: "text-muted-foreground hover:bg-accent hover:text-foreground",
									)}
								>
									<Icon className="w-4 h-4" />
								</button>
							</Tip>
						))}
						<div className="flex-1" />
						{!operationsMode && (
							<>
						<Tip
							label="Add handling unit (pallet, carton, …)"
							side="right"
						>
							<button
								type="button"
								onClick={() =>
									addHandlingUnit({
										currentStorageUnitId:
											selectedStorage?.id,
									})
								}
								className="w-10 h-10 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
							>
								<Truck className="w-4 h-4 mx-auto" />
							</button>
						</Tip>
						<Tip label="Clear all units on this floor" side="right">
							<button
								type="button"
								onClick={() => {
									if (
										confirm(
											"Clear all units on this floor?",
										)
									) {
										clearActiveFloor();
									}
								}}
								className="w-10 h-10 rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
							>
								<Trash2 className="w-4 h-4 mx-auto" />
							</button>
						</Tip>
						<Tip
							label="Reset entire warehouse to defaults"
							side="right"
						>
							<button
								type="button"
								onClick={() => {
									if (confirm("Reset entire warehouse?")) {
										reset();
									}
								}}
								className="w-10 h-10 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
							>
								<RotateCcw className="w-4 h-4 mx-auto" />
							</button>
						</Tip>
							</>
						)}
					</aside>
				)}

				{/* Zones panel */}
				{view === "2d" && (
					<aside className="w-70 shrink-0 border-r border-border bg-surface-elevated overflow-auto">
						<div className="px-3 py-2 border-b border-border flex items-center justify-between">
							<h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
								Zones
							</h2>
							<Tip label="Add a new zone">
								<Button
									size="icon"
									variant="ghost"
									className="h-6 w-6"
									onClick={() => {
										const id = addZone({
											name: `Zone ${warehouse.zones.length + 1}`,
										});
										setActiveZoneId(id);
									}}
								>
									<Plus className="w-3.5 h-3.5" />
								</Button>
							</Tip>
						</div>
						<div className="p-2 space-y-1">
							{warehouse.zones.length === 0 && (
								<p className="text-[11px] text-muted-foreground p-2">
									No zones. Add one to tag Area regions.
								</p>
							)}
							{warehouse.zones.map((z) => (
								<button
									type="button"
									key={z.id}
									className={cn(
										"group flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs",
										activeZoneId === z.id
											? "bg-accent"
											: "hover:bg-accent/60",
									)}
									onClick={() => setActiveZoneId(z.id)}
								>
									<input
										type="color"
										value={z.colorHex}
										onChange={(e) =>
											updateZone(z.id, {
												colorHex: e.target.value,
											})
										}
										className="w-4 h-4 rounded cursor-pointer border-0 p-0"
										onClick={(e) => e.stopPropagation()}
									/>
									<input
										value={z.name}
										onChange={(e) =>
											updateZone(z.id, {
												name: e.target.value,
											})
										}
										onClick={(e) => e.stopPropagation()}
										className="bg-transparent flex-1 min-w-0 outline-none"
									/>
									<select
										value={z.type}
										onChange={(e) => {
											const t = e.target
												.value as ZoneType;
											updateZone(z.id, {
												type: t,
												colorHex:
													ZONE_DEFAULT_COLORS[t],
											});
										}}
										onClick={(e) => e.stopPropagation()}
										className="text-[9px] bg-transparent border border-border rounded px-1"
									>
										{(
											Object.keys(
												ZONE_DEFAULT_COLORS,
											) as ZoneType[]
										).map((t) => (
											<option key={t} value={t}>
												{t}
											</option>
										))}
									</select>
									<Tip label="Delete zone">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												if (
													confirm(
														`Delete zone "${z.name}"?`,
													)
												) {
													removeZone(z.id);
												}
											}}
											className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
										>
											<Trash2 className="w-3 h-3" />
										</button>
									</Tip>
								</button>
							))}
						</div>

						<div className="px-3 py-2 border-y border-border mt-2">
							<h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
								Handling units
							</h2>
						</div>
						<div className="p-2 space-y-1">
							{warehouse.handlingUnits.length === 0 && (
								<p className="text-[11px] text-muted-foreground p-2">
									No handling units yet.
								</p>
							)}
							{warehouse.handlingUnits.map((h) => (
								<button
									type="button"
									key={h.id}
									onClick={() =>
										setSelection({
											kind: "handling",
											id: h.id,
										})
									}
									className={cn(
										"w-full text-left flex items-center gap-2 p-1.5 rounded text-[11px]",
										selection?.id === h.id
											? "bg-accent"
											: "hover:bg-accent/60",
									)}
								>
									<span className="font-mono">{h.code}</span>
									<span className="opacity-60">{h.type}</span>
								</button>
							))}
						</div>
					</aside>
				)}

				{/* Canvas */}
				<main className="flex-1 min-w-0 relative">
					{view === "2d" && activeFloor && (
						<>
							<CanvasEditor
								warehouse={warehouse}
								floor={activeFloor}
								tool={operationsMode ? "select" : tool}
								zones={warehouse.zones}
								activeZoneId={activeZoneId}
								operationsMode={operationsMode}
								readOnly={operationsMode}
								inventoryByLocationId={byLocationId}
								maxInventoryQty={maxQty || 1}
								selectedId={
									selection?.kind === "storage"
										? selection.id
										: null
								}
								onSelect={(id) =>
									setSelection(
										id ? { kind: "storage", id } : null,
									)
								}
								onAdd={(type, partial) => {
									const toolType = type as string;
									const assetTools = new Set([
										"WALL",
										"AISLE",
										"DOCK_DOOR",
										"STAIRS",
									]);
									if (assetTools.has(toolType)) {
										addAsset(
											makeAsset(
												toolType as AssetType,
												partial as Partial<Asset>,
											),
										);
										return;
									}
									const storageType =
										toolType === "AREA"
											? "FLOOR"
											: (toolType as StorageUnitType);
									addStorageUnit(
										makeStorageUnit(storageType, partial),
									);
								}}
								onUpdate={updatePlacement}
								routePlan={routePlan}
								highlightPicker={highlightPicker}
							/>
							{!operationsMode && tool !== "select" && (
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-xs font-mono px-3 py-1.5 rounded-full shadow-lg">
									Drag on the canvas to draw a {tool}
									{tool === "AREA" &&
										activeZoneId &&
										` (zone: ${warehouse.zones.find((z: Zone) => z.id === activeZoneId)?.name})`}
								</div>
							)}
						</>
					)}
					{view === "3d" && (
						<ThreeView
							warehouse={warehouse}
							operationsMode={operationsMode}
							inventoryByLocationId={byLocationId}
							maxInventoryQty={maxQty || 1}
							selectedId={
								selection?.kind === "storage"
									? selection.id
									: null
							}
							onSelect={(id) =>
								setSelection({ kind: "storage", id })
							}
							routePlan={routePlan}
							highlightPicker={highlightPicker}
							agvFleet={agvFleet}
						/>
					)}
					{view === "iso" && <IsoView warehouse={warehouse} />}
				</main>

				{/* Inspector */}
				{(view === "2d" || (view === "3d" && operationsMode)) && (
					<aside className="w-80 shrink-0 border-l border-border bg-surface-elevated overflow-auto">
						<div className="px-4 py-3 border-b border-border">
							<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								{operationsMode ? "Bin Details" : "Properties"}
							</h2>
						</div>
						{operationsMode && (
							<div className="p-3 border-b border-border">
								<AgvFleetPanel />
							</div>
						)}
						{operationsMode &&
							selection?.kind === "storage" &&
							(() => {
								const summary = getSummary(selection.id);
								return (
									<div className="px-4 py-3 border-b border-border text-sm space-y-2">
										<p className="font-medium">
											{selectedStorage?.code ??
												summary?.locationCode ??
												"Bin"}
										</p>
										{summary && summary.totalQty > 0 ? (
											<div className="space-y-1">
												<p className="text-muted-foreground text-xs">
													Total qty: {summary.totalQty}
												</p>
												{summary.items.map((item) => (
													<div
														key={`${item.skuCode}-${item.qty}`}
														className="text-xs font-mono"
													>
														{item.skuCode} —{" "}
														{item.skuName} ×{" "}
														{item.qty}
														{item.lotNumber
															? ` (lot ${item.lotNumber})`
															: ""}
													</div>
												))}
											</div>
										) : (
											<p className="text-xs text-muted-foreground">
												Available capacity — no
												inventory on hand.
											</p>
										)}
									</div>
								);
							})()}
						{!operationsMode && (
							<Inspector
								warehouse={warehouse}
								storage={selectedStorage}
								handling={selectedHandling}
								onUpdateStorage={updateStorageUnit}
								onRemoveStorage={removeStorageUnit}
								onUpdateHandling={updateHandlingUnit}
								onRemoveHandling={removeHandlingUnit}
								onGenerateShelves={generateShelvesForRack}
							/>
						)}
					</aside>
				)}
			</div>
		</div>
	);
};

export default Index;
