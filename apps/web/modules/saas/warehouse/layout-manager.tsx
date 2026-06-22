import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import type { LucideIcon } from "lucide-react";
import {
	ArrowUpRight,
	Box,
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
	Save,
	Square,
	Trash2,
	Truck,
	Upload,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { AgvFleetPanel } from "./components/AgvFleetPanel";
import CanvasEditor from "./components/CanvasEditor";
import Inspector from "./components/Inspector";
import IsoView from "./components/IsoView";
import ThreeView from "./components/ThreeView";
import { Tip } from "./components/Tip";
import { useAgvFleet } from "./hooks/use-agv-fleet";
import { useWarehouseInventory } from "./hooks/use-warehouse-inventory";
import { parseRoutePlan } from "./lib/route-viz-types";
import {
	locationsToWarehouse,
	warehouseToLayoutPayload,
} from "./lib/warehouse-layout-serializer";
import {
	makeAsset,
	makeStorageUnit,
	useWarehouse,
} from "./lib/warehouse-store";
import type {
	Asset,
	AssetType,
	HandlingUnit,
	StorageUnit,
	StorageUnitType,
	Tool,
	ViewMode,
} from "./lib/warehouse-types";

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
		updateAsset,
		removeAsset,
		updatePlacement,
		addHandlingUnit,
		updateHandlingUnit,
		removeHandlingUnit,
		generateShelvesForRack,
		generateBinsForRack,
		generatePalletGridForArea,
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
		undefined,
	);

	useEffect(() => {
		if (
			warehouse.zones.length > 0 &&
			(!activeZoneId ||
				!warehouse.zones.some((z) => z.id === activeZoneId))
		) {
			setActiveZoneId(warehouse.zones[0]?.id);
		}
	}, [warehouse.zones, activeZoneId]);
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
			if (
				Array.isArray(draftScene?.locations) &&
				draftScene.locations.length > 0
			) {
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

	const selectedAsset = useMemo(() => {
		if (!selection || selection.kind !== "asset") {
			return undefined;
		}
		for (const f of warehouse.floors) {
			const a = f.assets.find((asset: Asset) => asset.id === selection.id);
			if (a) {
				return a;
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

	const showInspectorPanel =
		(view === "2d" || (view === "3d" && operationsMode)) &&
		(operationsMode
			? selection?.kind === "storage"
			: Boolean(selectedStorage || selectedAsset || selectedHandling));

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

	const resolveSelectionKind = (id: string) => {
		if (activeFloor?.assets.some((a) => a.id === id)) {
			return "asset" as const;
		}
		return "storage" as const;
	};

	return (
		<div className="flex flex-col h-full min-h-0 flex-1 overflow-hidden bg-surface text-foreground">
			{/* Unified toolbar */}
			<header className="shrink-0 border-b border-border bg-surface-elevated">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
					<div className="flex items-center gap-2 min-w-0 flex-1">
						<Tip label="Toggle layout design vs inventory operations view">
							<Button
								type="button"
								variant={operationsMode ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setOperationsMode((v) => !v);
									setTool("select");
								}}
							>
								{operationsMode ? "Operations" : "Layout"}
							</Button>
						</Tip>

						<div className="hidden sm:block h-6 w-px bg-border shrink-0" />

						<span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
							Floor
						</span>
						<div className="flex items-center gap-1 overflow-x-auto min-w-0">
							{warehouse.floors
								.slice()
								.sort((a, b) => a.floorNumber - b.floorNumber)
								.map((f) => {
									const isActive =
										f.id === warehouse.activeFloorId;
									return (
										<div
											key={f.id}
											className={cn(
												"h-8 rounded-md text-xs font-medium inline-flex items-center transition-colors",
												isActive
													? "bg-primary text-primary-foreground"
													: "text-muted-foreground hover:bg-accent hover:text-foreground",
											)}
										>
											<button
												type="button"
												onClick={() =>
													setActiveFloor(f.id)
												}
												className="h-8 pl-3 pr-2 inline-flex items-center gap-1.5"
											>
												<span className="font-mono opacity-70">
													{f.code}
												</span>
												<span>{f.name}</span>
												{f.elevationMm > 0 && (
													<span className="font-mono text-[10px] opacity-70">
														+
														{(
															f.elevationMm /
															1000
														).toFixed(1)}
														m
													</span>
												)}
											</button>
											{warehouse.floors.length > 1 && (
												<Tip
													label={`Delete floor "${f.name}"`}
												>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															if (
																confirm(
																	`Delete floor "${f.name}"? All its units will be removed.`,
																)
															) {
																removeFloor(
																	f.id,
																);
															}
														}}
														className={cn(
															"h-8 w-7 inline-flex items-center justify-center rounded-r-md opacity-60 hover:opacity-100",
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
									variant="outline"
									className="h-8 gap-1 shrink-0"
									onClick={() => {
										const name = prompt(
											"Floor name?",
											"Mezzanine",
										);
										if (!name) {
											return;
										}
										const elev = Number(
											prompt(
												"Elevation in meters above ground?",
												"3",
											) ?? 0,
										);
										addFloor({
											name,
											elevationMm: elev * 1000,
										});
									}}
								>
									<Plus className="w-3.5 h-3.5" /> Floor
								</Button>
							</Tip>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2 shrink-0">
						{routePlan && (
							<div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
								<Button
									type="button"
									variant={
										highlightPicker === "all"
											? "secondary"
											: "ghost"
									}
									size="sm"
									className="h-7 px-2 text-xs"
									onClick={() => setHighlightPicker("all")}
								>
									All routes
								</Button>
								{routePlan.pickers.map((picker) => (
									<Button
										key={picker.label}
										type="button"
										variant={
											highlightPicker === picker.label
												? "secondary"
												: "ghost"
										}
										size="sm"
										className="h-7 px-2 text-xs gap-1"
										onClick={() =>
											setHighlightPicker(picker.label)
										}
									>
										<span
											className="size-2 rounded-full"
											style={{
												backgroundColor: picker.color,
											}}
										/>
										{picker.label}
									</Button>
								))}
							</div>
						)}

						<div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
							{Tabs.map(({ id, label, icon: Icon, tip }) => (
								<Tip key={id} label={tip}>
									<Button
										type="button"
										variant={
											view === id ? "secondary" : "ghost"
										}
										size="sm"
										className="h-7 px-2.5 text-xs gap-1.5"
										onClick={() => setView(id)}
									>
										<Icon className="w-3.5 h-3.5" />
										{label}
									</Button>
								</Tip>
							))}
						</div>

						<Tip label="Save layout to backend">
							<Button
								variant="outline"
								size="sm"
								onClick={handleSaveDraft}
								className="gap-1.5"
							>
								<Save className="w-3.5 h-3.5" />
								Save draft
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
								<Upload className="w-3.5 h-3.5" />
								Publish
							</Button>
						</Tip>
						<Tip label="Download warehouse as JSON">
							<Button
								variant="outline"
								size="sm"
								onClick={handleExport}
								className="gap-1.5"
							>
								<Download className="w-3.5 h-3.5" />
								Export
							</Button>
						</Tip>
					</div>
				</div>
			</header>

			{/* Workspace — canvas is primary */}
			<div className="flex min-h-0 flex-1 overflow-hidden">
				{/* Canvas */}
				<main className="relative min-h-0 min-w-0 flex-1">
					{view === "2d" && !operationsMode && (
						<div className="pointer-events-none absolute inset-0 z-30">
							<div className="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-row items-center gap-1 rounded-xl border border-border bg-surface-elevated p-1.5 shadow-md">
								{TOOLS.map(({ id, icon: Icon, label }) => (
									<Tip key={id} label={label} side="top">
										<button
											type="button"
											onClick={() => setTool(id)}
											className={cn(
												"flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
												tool === id
													? "bg-primary text-primary-foreground"
													: "text-muted-foreground hover:bg-accent hover:text-foreground",
											)}
										>
											<Icon className="h-4 w-4" />
										</button>
									</Tip>
								))}
								<div className="mx-0.5 h-8 w-px bg-border" />
								<Tip
									label="Add handling unit (pallet, carton, …)"
									side="top"
								>
									<button
										type="button"
										onClick={() =>
											addHandlingUnit({
												currentStorageUnitId:
													selectedStorage?.id,
											})
										}
										className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
									>
										<Truck className="h-4 w-4" />
									</button>
								</Tip>
								<Tip
									label="Clear storage units on this floor (structural assets are kept)"
									side="top"
								>
									<button
										type="button"
										onClick={() => {
											if (
												confirm(
													"Clear all storage units on this floor? Walls, stairs, and other structural assets will be kept.",
												)
											) {
												clearActiveFloor();
											}
										}}
										className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</Tip>
								<Tip
									label="Reset entire warehouse to defaults"
									side="top"
								>
									<button
										type="button"
										onClick={() => {
											if (
												confirm(
													"Reset entire warehouse?",
												)
											) {
												reset();
											}
										}}
										className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
									>
										<RotateCcw className="h-4 w-4" />
									</button>
								</Tip>
							</div>
						</div>
					)}
					{view === "2d" && activeFloor && (
						<>
							<CanvasEditor
								floor={activeFloor}
								tool={operationsMode ? "select" : tool}
								zones={warehouse.zones}
								activeZoneId={activeZoneId}
								operationsMode={operationsMode}
								readOnly={operationsMode}
								inventoryByLocationId={byLocationId}
								maxInventoryQty={maxQty || 1}
								selectedId={
									selection?.kind === "storage" ||
									selection?.kind === "asset"
										? selection.id
										: null
								}
								onSelect={(id) =>
									setSelection(
										id
											? {
													kind: resolveSelectionKind(
														id,
													),
													id,
												}
											: null,
									)
								}
								onDelete={(id) => {
									if (
										activeFloor.assets.some(
											(a) => a.id === id,
										)
									) {
										removeAsset(id);
										return;
									}
									removeStorageUnit(id);
								}}
								onAdd={(type, partial) => {
									const assetTypes = new Set([
										"WALL",
										"AISLE",
										"DOCK_DOOR",
										"STAIRS",
									]);
									if (assetTypes.has(type)) {
										addAsset(
											makeAsset(
												type as AssetType,
												partial as Partial<Asset>,
											),
										);
										return;
									}
									addStorageUnit(
										makeStorageUnit(
											type as StorageUnitType,
											partial as Partial<StorageUnit>,
										),
									);
								}}
								onUpdate={updatePlacement}
								routePlan={routePlan}
								highlightPicker={highlightPicker}
							/>
							{!operationsMode && tool !== "select" && (
								<div className="pointer-events-auto absolute bottom-[4.75rem] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-3 py-1.5 font-mono text-xs text-background shadow-sm">
									<span className="pointer-events-none">
										Drag on the canvas to draw a {tool}
									</span>
									{tool === "AREA" && (
										<select
											value={activeZoneId ?? ""}
											onChange={(e) =>
												setActiveZoneId(
													e.target.value || undefined,
												)
											}
											className="max-w-[140px] rounded border border-background/20 bg-background/10 px-2 py-0.5 text-xs text-background outline-none"
											aria-label="Active zone for area"
										>
											{warehouse.zones.length === 0 ? (
												<option value="">
													No zones
												</option>
											) : (
												warehouse.zones.map((z) => (
													<option
														key={z.id}
														value={z.id}
													>
														{z.name}
													</option>
												))
											)}
										</select>
									)}
								</div>
							)}
						</>
					)}
					{view === "3d" && (
						<div className="h-full min-h-0 overflow-hidden">
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
						</div>
					)}
					{view === "iso" && (
						<div className="h-full min-h-0 overflow-auto">
							<IsoView warehouse={warehouse} />
						</div>
					)}

					{showInspectorPanel && (
						<div className="pointer-events-none absolute inset-0 z-40">
							<aside className="pointer-events-auto absolute right-4 top-4 flex w-72 max-h-[calc(100%-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated/95 shadow-lg backdrop-blur-sm">
								<div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
									<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										{operationsMode
											? "Bin Details"
											: "Properties"}
									</h2>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => setSelection(null)}
										aria-label="Close properties"
									>
										<X className="h-3.5 w-3.5" />
									</Button>
								</div>
								<div className="min-h-0 flex-1 overflow-auto">
									{operationsMode && (
										<div className="border-b border-border p-3">
											<AgvFleetPanel />
										</div>
									)}
									{operationsMode &&
										selection?.kind === "storage" &&
										(() => {
											const summary = getSummary(
												selection.id,
											);
											return (
												<div className="space-y-2 border-b border-border px-4 py-3 text-sm">
													<p className="font-medium">
														{selectedStorage?.code ??
															summary?.locationCode ??
															"Bin"}
													</p>
													{summary &&
													summary.totalQty > 0 ? (
														<div className="space-y-1">
															<p className="text-muted-foreground text-xs">
																Total qty:{" "}
																{
																	summary.totalQty
																}
															</p>
															{summary.items.map(
																(item) => (
																	<div
																		key={`${item.skuCode}-${item.qty}`}
																		className="font-mono text-xs"
																	>
																		{
																			item.skuCode
																		}{" "}
																		—{" "}
																		{
																			item.skuName
																		}{" "}
																		×{" "}
																		{
																			item.qty
																		}
																		{item.lotNumber
																			? ` (lot ${item.lotNumber})`
																			: ""}
																	</div>
																),
															)}
														</div>
													) : (
														<p className="text-xs text-muted-foreground">
															Available capacity
															— no inventory on
															hand.
														</p>
													)}
												</div>
											);
										})()}
									{!operationsMode && (
										<Inspector
											warehouse={warehouse}
											storage={selectedStorage}
											asset={selectedAsset}
											handling={selectedHandling}
											onUpdateStorage={updateStorageUnit}
											onRemoveStorage={removeStorageUnit}
											onUpdateAsset={updateAsset}
											onRemoveAsset={removeAsset}
											onUpdateHandling={
												updateHandlingUnit
											}
											onRemoveHandling={
												removeHandlingUnit
											}
											onGenerateShelves={
												generateShelvesForRack
											}
											onGenerateBinsForRack={
												generateBinsForRack
											}
											onGeneratePalletGridForArea={
												generatePalletGridForArea
											}
										/>
									)}
								</div>
							</aside>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default Index;
