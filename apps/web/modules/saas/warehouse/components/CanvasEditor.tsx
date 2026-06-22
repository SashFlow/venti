import { cn } from "@repo/ui/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
	Asset,
	AssetType,
	StorageUnit,
	StorageUnitType,
	Tool,
	WarehouseFloor,
	Zone,
} from "../lib/warehouse-types";
import {
	ASSET_COLORS,
	getDefaultDimensionsForTool,
	PX_PER_M,
	resolveToolTarget,
	STORAGE_UNIT_COLORS,
} from "../lib/warehouse-types";
import {
	computeHeatmapRatio,
	heatmapColor,
} from "../lib/inventory-heatmap";
import type { RouteVizPlan } from "../lib/route-viz-types";
import { routeCoordToMm } from "../lib/route-viz-types";

interface Props {
	floor: WarehouseFloor;
	tool: Tool;
	selectedId: string | null;
	zones: Zone[];
	activeZoneId?: string;
	operationsMode?: boolean;
	readOnly?: boolean;
	inventoryByLocationId?: Map<
		string,
		{ totalQty: number; items: Array<{ skuCode: string; qty: number }> }
	>;
	maxInventoryQty?: number;
	routePlan?: RouteVizPlan | null;
	highlightPicker?: string | null;
	onSelect: (id: string | null) => void;
	onAdd: (
		type: StorageUnitType | AssetType,
		partial: Partial<StorageUnit> | Partial<Asset>,
	) => void;
	onUpdate: (id: string, patch: Partial<StorageUnit>) => void;
	onDelete?: (id: string) => void;
}

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const BASE_CELL = PX_PER_M;
const CANVAS_M = 200;
const SNAP_MM = 250;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.15;

const snap = (mm: number) => Math.round(mm / SNAP_MM) * SNAP_MM;

function isEditableTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	const tag = target.tagName;
	return (
		target.isContentEditable ||
		tag === "INPUT" ||
		tag === "TEXTAREA" ||
		tag === "SELECT"
	);
}

// Painter order: AREA under, then WALL, AISLE, DOCK_DOOR, RACK, SHELF, BIN, STAIRS
const ORDER: Record<StorageUnitType | AssetType, number> = {
	FLOOR: 0,
	AISLE: 1,
	DOCK_DOOR: 2,
	WALL: 3,
	RACK: 4,
	SHELF: 5,
	PALLET: 6,
	BIN: 7,
	STAIRS: 8,
};

export default function CanvasEditor({
	floor,
	tool,
	selectedId,
	zones,
	activeZoneId,
	operationsMode = false,
	readOnly = false,
	inventoryByLocationId,
	maxInventoryQty = 1,
	onSelect,
	onAdd,
	onUpdate,
	onDelete,
	routePlan,
	highlightPicker,
}: Props) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const ref = useRef<HTMLDivElement>(null);
	const [zoom, setZoom] = useState(1);
	const [drag, setDrag] = useState<null | {
		sx: number;
		sy: number;
		cx: number;
		cy: number;
	}>(null);
	const [moveDrag, setMoveDrag] = useState<null | {
		id: string;
		offMmX: number;
		offMmY: number;
	}>(null);
	const [resizeDrag, setResizeDrag] = useState<null | {
		id: string;
		handle: ResizeHandle;
		orig: { x: number; y: number; w: number; l: number };
	}>(null);
	const [rotateDrag, setRotateDrag] = useState<null | {
		id: string;
		cx: number;
		cy: number;
	}>(null);

	const cellPx = BASE_CELL * zoom;
	const W = CANVAS_M * cellPx;
	const H = CANVAS_M * cellPx;

	const toMm = useCallback(
		(clientX: number, clientY: number) => {
			const rect = ref.current?.getBoundingClientRect();
			if (!rect) {
				return { xMm: 0, yMm: 0 };
			}
			const xPx = clientX - rect.left;
			const yPx = clientY - rect.top;
			return {
				xMm: Math.max(0, (xPx / cellPx) * 1000),
				yMm: Math.max(0, (yPx / cellPx) * 1000),
			};
		},
		[cellPx],
	);

	const applyZoom = useCallback(
		(nextZoom: number, anchorX?: number, anchorY?: number) => {
			const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextZoom));
			const scroller = scrollRef.current;
			if (!scroller) {
				setZoom(clamped);
				return;
			}

			const prevZoom = zoom;
			if (prevZoom === clamped) {
				return;
			}

			const ax = anchorX ?? scroller.clientWidth / 2;
			const ay = anchorY ?? scroller.clientHeight / 2;
			const ratio = clamped / prevZoom;
			const scrollLeft =
				(scroller.scrollLeft + ax) * ratio - ax;
			const scrollTop = (scroller.scrollTop + ay) * ratio - ay;

			setZoom(clamped);
			requestAnimationFrame(() => {
				scroller.scrollLeft = scrollLeft;
				scroller.scrollTop = scrollTop;
			});
		},
		[zoom],
	);

	const handleDeleteSelected = useCallback(() => {
		if (!selectedId || readOnly || !onDelete) {
			return;
		}
		onDelete(selectedId);
	}, [selectedId, readOnly, onDelete]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (isEditableTarget(e.target)) {
				return;
			}

			const mod = e.ctrlKey || e.metaKey;

			if (
				(e.key === "Delete" || e.key === "Backspace") &&
				!mod &&
				!readOnly
			) {
				e.preventDefault();
				handleDeleteSelected();
				return;
			}

			if (e.key === "Escape") {
				e.preventDefault();
				onSelect(null);
				return;
			}

			if (mod && (e.key === "=" || e.key === "+")) {
				e.preventDefault();
				applyZoom(zoom + ZOOM_STEP);
				return;
			}

			if (mod && e.key === "-") {
				e.preventDefault();
				applyZoom(zoom - ZOOM_STEP);
				return;
			}

			if (mod && e.key === "0") {
				e.preventDefault();
				applyZoom(1);
				return;
			}

			if (!mod && e.key === "+") {
				e.preventDefault();
				applyZoom(zoom + ZOOM_STEP);
				return;
			}

			if (!mod && e.key === "-") {
				e.preventDefault();
				applyZoom(zoom - ZOOM_STEP);
				return;
			}
		},
		[
			readOnly,
			handleDeleteSelected,
			onSelect,
			applyZoom,
			zoom,
		],
	);

	const handleWheel = useCallback(
		(e: React.WheelEvent<HTMLDivElement>) => {
			if (!e.ctrlKey && !e.metaKey) {
				return;
			}
			e.preventDefault();
			const scroller = scrollRef.current;
			if (!scroller) {
				return;
			}
			const rect = scroller.getBoundingClientRect();
			const anchorX = e.clientX - rect.left;
			const anchorY = e.clientY - rect.top;
			const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
			applyZoom(zoom + delta, anchorX, anchorY);
		},
		[applyZoom, zoom],
	);

	const handleDown = (e: React.MouseEvent) => {
		scrollRef.current?.focus();
		if (readOnly || e.button !== 0) {
			return;
		}
		const { xMm, yMm } = toMm(e.clientX, e.clientY);
		if (tool === "select") {
			onSelect(null);
			return;
		}
		setDrag({ sx: xMm, sy: yMm, cx: xMm, cy: yMm });
	};

	const handleMove = (e: React.MouseEvent) => {
		if (drag) {
			const { xMm, yMm } = toMm(e.clientX, e.clientY);
			setDrag({ ...drag, cx: xMm, cy: yMm });
		} else if (moveDrag) {
			const { xMm, yMm } = toMm(e.clientX, e.clientY);
			onUpdate(moveDrag.id, {
				startXMm: snap(Math.max(0, xMm - moveDrag.offMmX)),
				startYMm: snap(Math.max(0, yMm - moveDrag.offMmY)),
			});
		} else if (resizeDrag) {
			const { xMm, yMm } = toMm(e.clientX, e.clientY);
			const o = resizeDrag.orig;
			let nx = o.x;
			let ny = o.y;
			let nw = o.w;
			let nl = o.l;
			if (resizeDrag.handle.includes("e")) {
				nw = Math.max(SNAP_MM, snap(xMm - o.x));
			}
			if (resizeDrag.handle.includes("s")) {
				nl = Math.max(SNAP_MM, snap(yMm - o.y));
			}
			if (resizeDrag.handle.includes("w")) {
				nx = Math.min(o.x + o.w - SNAP_MM, snap(xMm));
				nw = o.x + o.w - nx;
			}
			if (resizeDrag.handle.includes("n")) {
				ny = Math.min(o.y + o.l - SNAP_MM, snap(yMm));
				nl = o.y + o.l - ny;
			}
			onUpdate(resizeDrag.id, {
				startXMm: nx,
				startYMm: ny,
				widthMm: nw,
				lengthMm: nl,
			});
		} else if (rotateDrag) {
			const { xMm, yMm } = toMm(e.clientX, e.clientY);
			const ang =
				Math.atan2(yMm - rotateDrag.cy, xMm - rotateDrag.cx) *
					(180 / Math.PI) +
				90;
			const step = e.shiftKey ? 15 : 1;
			const snapped = Math.round(ang / step) * step;
			onUpdate(rotateDrag.id, {
				rotationZDeg: ((snapped % 360) + 360) % 360,
			});
		}
	};

	const handleUp = () => {
		if (drag) {
			const xMm = snap(Math.min(drag.sx, drag.cx));
			const yMm = snap(Math.min(drag.sy, drag.cy));
			const wMm = Math.max(SNAP_MM, snap(Math.abs(drag.cx - drag.sx)));
			const lMm = Math.max(SNAP_MM, snap(Math.abs(drag.cy - drag.sy)));
			if (tool !== "select") {
				const target = resolveToolTarget(tool);
				if (target.kind === "none") {
					setDrag(null);
					return;
				}
				const d = getDefaultDimensionsForTool(tool);
				const partial: Partial<StorageUnit> = {
					startXMm: xMm,
					startYMm: yMm,
					widthMm: wMm,
					lengthMm: lMm,
					heightMm: d.heightMm,
				};
				if (
					target.kind === "storage" &&
					target.storageType === "FLOOR" &&
					activeZoneId
				) {
					const z = zones.find((zz) => zz.id === activeZoneId);
					partial.zoneId = activeZoneId;
					if (z) {
						partial.colorHex = z.colorHex;
						partial.name = z.name;
					}
				}
				const addType =
					target.kind === "storage"
						? target.storageType
						: target.assetType;
				onAdd(addType, partial);
			}
			setDrag(null);
		}
		setMoveDrag(null);
		setResizeDrag(null);
		setRotateDrag(null);
	};

	useEffect(() => {
		const up = () => {
			setDrag(null);
			setMoveDrag(null);
			setResizeDrag(null);
			setRotateDrag(null);
		};
		window.addEventListener("mouseup", up);
		return () => window.removeEventListener("mouseup", up);
	}, []);

	// center on first mount
	useEffect(() => {
		const el = scrollRef.current;
		if (el) {
			el.scrollLeft = (W - el.clientWidth) / 2;
			el.scrollTop = (H - el.clientHeight) / 2;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const ordered = [...floor.storageUnits, ...floor.assets].sort(
		(a, b) => ORDER[a.type] - ORDER[b.type],
	);

	const isAncestorSelected = (
		unit: StorageUnit,
		ancestorId: string | null,
	): boolean => {
		if (!ancestorId) {
			return false;
		}
		let parentId = unit.parentStorageUnitId;
		while (parentId) {
			if (parentId === ancestorId) {
				return true;
			}
			const parent = floor.storageUnits.find((x) => x.id === parentId);
			parentId = parent?.parentStorageUnitId;
		}
		return false;
	};

	const previewRect = drag
		? {
				xMm: Math.min(drag.sx, drag.cx),
				yMm: Math.min(drag.sy, drag.cy),
				wMm: Math.abs(drag.cx - drag.sx),
				lMm: Math.abs(drag.cy - drag.sy),
			}
		: null;

	const startMove = (e: React.MouseEvent, u: StorageUnit | Asset) => {
		if (readOnly || tool !== "select") {
			if (tool === "select") {
				e.stopPropagation();
				onSelect(u.id);
			}
			return;
		}
		e.stopPropagation();
		onSelect(u.id);
		const { xMm, yMm } = toMm(e.clientX, e.clientY);
		setMoveDrag({
			id: u.id,
			offMmX: xMm - u.startXMm,
			offMmY: yMm - u.startYMm,
		});
	};

	const startResize = (
		e: React.MouseEvent,
		u: StorageUnit | Asset,
		handle: ResizeHandle,
	) => {
		e.stopPropagation();
		onSelect(u.id);
		setResizeDrag({
			id: u.id,
			handle,
			orig: { x: u.startXMm, y: u.startYMm, w: u.widthMm, l: u.lengthMm },
		});
	};

	const startRotate = (e: React.MouseEvent, u: StorageUnit | Asset) => {
		e.stopPropagation();
		onSelect(u.id);
		setRotateDrag({
			id: u.id,
			cx: u.startXMm + u.widthMm / 2,
			cy: u.startYMm + u.lengthMm / 2,
		});
	};

	const renderHandles = (u: StorageUnit | Asset) => {
		if (selectedId !== u.id || tool !== "select") {
			return null;
		}
		const handles: {
			h: ResizeHandle;
			style: React.CSSProperties;
			cursor: string;
		}[] = [
			{ h: "nw", style: { left: -4, top: -4 }, cursor: "nwse-resize" },
			{ h: "ne", style: { right: -4, top: -4 }, cursor: "nesw-resize" },
			{ h: "sw", style: { left: -4, bottom: -4 }, cursor: "nesw-resize" },
			{
				h: "se",
				style: { right: -4, bottom: -4 },
				cursor: "nwse-resize",
			},
			{
				h: "n",
				style: { left: "50%", top: -4, transform: "translateX(-50%)" },
				cursor: "ns-resize",
			},
			{
				h: "s",
				style: {
					left: "50%",
					bottom: -4,
					transform: "translateX(-50%)",
				},
				cursor: "ns-resize",
			},
			{
				h: "w",
				style: { top: "50%", left: -4, transform: "translateY(-50%)" },
				cursor: "ew-resize",
			},
			{
				h: "e",
				style: { top: "50%", right: -4, transform: "translateY(-50%)" },
				cursor: "ew-resize",
			},
		];
		return (
			<>
				{handles.map((hd) => (
					<div
						key={hd.h}
						onMouseDown={(e) => startResize(e, u, hd.h)}
						className="absolute w-2 h-2 bg-primary border border-white rounded-sm z-20"
						style={{ ...hd.style, cursor: hd.cursor }}
					/>
				))}
				{/* rotation handle */}
				<div
					onMouseDown={(e) => startRotate(e, u)}
					title="Rotate (Shift = 15°)"
					className="absolute z-20 w-3 h-3 rounded-full bg-primary border-2 border-white shadow"
					style={{
						left: "50%",
						top: -22,
						transform: "translateX(-50%)",
						cursor: "grab",
					}}
				/>
			</>
		);
	};

	return (
		<div
			ref={scrollRef}
			tabIndex={0}
			role="application"
			aria-label="Warehouse layout canvas"
			className="relative h-full w-full overflow-auto bg-canvas outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
			onKeyDown={handleKeyDown}
			onWheel={handleWheel}
		>
			<div className="pointer-events-none absolute top-3 left-3 z-30 rounded border border-border bg-surface-elevated/90 px-2 py-1 font-mono text-[10px] text-muted-foreground shadow-sm backdrop-blur">
				{floor.name ?? floor.code} · 1 cell = 1 m · snap 0.25 m ·{" "}
				{Math.round(zoom * 100)}%
				{operationsMode ? " · Operations view" : ""}
			</div>
			{operationsMode && (
				<div className="absolute top-3 right-3 z-30 rounded-md border border-border bg-surface-elevated/95 px-2 py-1 text-[10px] shadow-sm pointer-events-none">
					<div
						className="h-2 w-20 rounded-full"
						style={{
							background:
								"linear-gradient(to right, #22c55e, #f59e0b, #ef4444)",
						}}
					/>
				</div>
			)}

			<div
				ref={ref}
				className={cn(
					"relative canvas-grid-meters select-none",
					tool === "select" ? "cursor-default" : "cursor-crosshair",
				)}
				style={
					{
						width: W,
						height: H,
						"--cell": `${cellPx}px`,
					} as React.CSSProperties
				}
				onMouseDown={handleDown}
				onMouseMove={handleMove}
				onMouseUp={handleUp}
			>
				{ordered.map((u: StorageUnit | Asset) => {
					const isSelected = u.id === selectedId;
					const isStorageChild =
						"parentStorageUnitId" in u &&
						Boolean(u.parentStorageUnitId);
					const dimChild =
						isStorageChild &&
						!isSelected &&
						!isAncestorSelected(u as StorageUnit, selectedId);
					const x = (u.startXMm / 1000) * cellPx;
					const y = (u.startYMm / 1000) * cellPx;
					const w = (u.widthMm / 1000) * cellPx;
					const l = (u.lengthMm / 1000) * cellPx;
					const color = (() => {
						if (
							operationsMode &&
							(u.type === "BIN" || u.type === "PALLET")
						) {
							const summary = inventoryByLocationId?.get(u.id);
							const qty = summary?.totalQty ?? 0;
							return heatmapColor(
								computeHeatmapRatio(qty, maxInventoryQty),
							);
						}
						return (
							u.colorHex ??
							(STORAGE_UNIT_COLORS[
								u.type as keyof typeof STORAGE_UNIT_COLORS
							] ||
								ASSET_COLORS[u.type as keyof typeof ASSET_COLORS])
						);
					})();
					const common: React.CSSProperties = {
						position: "absolute",
						left: x,
						top: y,
						width: w,
						height: l,
						opacity: dimChild ? 0.45 : 1,
						transform: u.rotationZDeg
							? `rotate(${u.rotationZDeg}deg)`
							: undefined,
						transformOrigin: "center center",
					};

					const label =
						"name" in u && u.name
							? u.name
							: "code" in u
								? u.code
								: u.type;
					const uType = u.type as string;

					if (uType === "FLOOR") {
						return (
							<div
								key={u.id}
								style={{
									...common,
									backgroundColor: `${color}1f`,
									border: `1.5px dashed ${color}`,
									borderRadius: 4,
								}}
								className={cn(
									"flex items-start justify-start p-1.5",
									tool === "select" &&
										"hover:brightness-110 cursor-move",
									isSelected &&
										"ring-2 ring-offset-2 ring-offset-canvas",
								)}
								onMouseDown={(e) => startMove(e, u)}
							>
								<span
									className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
									style={{
										backgroundColor: color,
										color: "#fff",
									}}
								>
									{label}
								</span>
								{renderHandles(u)}
							</div>
						);
					}

					if (uType === "WALL") {
						return (
							<div
								key={u.id}
								style={{ ...common, backgroundColor: color }}
								className={cn(
									"rounded-xs",
									tool === "select" && "cursor-move",
									isSelected &&
										"ring-2 ring-primary ring-offset-1 ring-offset-canvas",
								)}
								onMouseDown={(e) => startMove(e, u)}
							>
								{renderHandles(u)}
							</div>
						);
					}

					if (uType === "STAIRS") {
						return (
							<div
								key={u.id}
								style={{
									...common,
									background: `repeating-linear-gradient(0deg, ${color} 0 ${cellPx / 2}px, #cbd5e1 ${cellPx / 2}px ${cellPx}px)`,
									borderRadius: 3,
									border: "1px solid #64748b",
								}}
								className={cn(
									"flex items-center justify-center text-[10px] font-mono text-white",
									tool === "select" && "cursor-move",
									isSelected &&
										"ring-2 ring-primary ring-offset-1 ring-offset-canvas",
								)}
								onMouseDown={(e) => startMove(e, u)}
							>
								<span className="px-1 bg-black/50 rounded">
									↑ {label}
								</span>
								{renderHandles(u)}
							</div>
						);
					}

					if (uType === "DOCK_DOOR") {
						return (
							<div
								key={u.id}
								style={{
									...common,
									background: color,
									borderRadius: 2,
									border: "2px dashed #0369a1",
								}}
								className={cn(
									"flex items-center justify-center text-[10px] font-mono text-white",
									tool === "select" && "cursor-move",
									isSelected &&
										"ring-2 ring-primary ring-offset-1 ring-offset-canvas",
								)}
								onMouseDown={(e) => startMove(e, u)}
							>
								<span className="px-1 bg-black/40 rounded">
									⇆ {label}
								</span>
								{renderHandles(u)}
							</div>
						);
					}

					if (uType === "AISLE") {
						return (
							<div
								key={u.id}
								style={{
									...common,
									backgroundColor: `${color}55`,
									border: `1px dashed ${color}`,
								}}
								className={cn(
									"flex items-center justify-center text-[10px] font-mono text-foreground/60",
									tool === "select" && "cursor-move",
									isSelected &&
										"ring-2 ring-primary ring-offset-1 ring-offset-canvas",
								)}
								onMouseDown={(e) => startMove(e, u)}
							>
								{label}
								{renderHandles(u)}
							</div>
						);
					}

					if (uType === "PALLET") {
						return (
							<div
								key={u.id}
								style={{
									...common,
									backgroundColor: `${color}88`,
									border: `2px solid ${color}`,
									borderRadius: 2,
								}}
								className={cn(
									"flex items-center justify-center text-[9px] font-mono text-foreground",
									tool === "select" && "cursor-move",
									isSelected &&
										"ring-2 ring-primary ring-offset-1 ring-offset-canvas",
								)}
								onMouseDown={(e) => startMove(e, u)}
							>
								<span className="px-0.5 bg-black/30 rounded text-white">
									{label}
								</span>
								{renderHandles(u)}
							</div>
						);
					}

					// RACK / SHELF / BIN — solid colored boxes
					return (
						<div
							key={u.id}
							style={{
								...common,
								backgroundColor: color,
							}}
							className={cn(
								"flex items-center justify-center text-[10px] font-mono font-medium text-white rounded-sm shadow-sm relative overflow-hidden",
								tool === "select" && "cursor-move",
								isSelected &&
									"ring-2 ring-primary ring-offset-1 ring-offset-canvas",
							)}
							onMouseDown={(e) => startMove(e, u)}
						>
							<span className="relative z-10 px-1 bg-black/40 rounded">
								{label}
							</span>
							{renderHandles(u)}
						</div>
					);
				})}

				{routePlan && (
					<svg
						className="absolute inset-0 pointer-events-none z-25"
						width={W}
						height={H}
						aria-label="Pick route paths"
						role="img"
					>
						{routePlan.pickers.map((picker) => {
							if (
								highlightPicker &&
								highlightPicker !== "all" &&
								picker.label !== highlightPicker
							) {
								return null;
							}
							const points = picker.stops
								.map((stop) => {
									const xMm = routeCoordToMm(stop.x);
									const zMm = routeCoordToMm(stop.z);
									return `${(xMm / 1000) * cellPx},${(zMm / 1000) * cellPx}`;
								})
								.join(" ");
							if (!points.includes(",")) {
								return null;
							}
							return (
								<polyline
									key={picker.label}
									points={points}
									fill="none"
									stroke={picker.color}
									strokeWidth={3}
									strokeOpacity={
										highlightPicker &&
										highlightPicker !== "all"
											? 1
											: 0.85
									}
									strokeLinejoin="round"
									strokeLinecap="round"
								/>
							);
						})}
					</svg>
				)}

				{previewRect && (
					<div
						className="absolute border-2 border-primary bg-primary/10 pointer-events-none rounded-sm"
						style={{
							left: (previewRect.xMm / 1000) * cellPx,
							top: (previewRect.yMm / 1000) * cellPx,
							width: (previewRect.wMm / 1000) * cellPx,
							height: (previewRect.lMm / 1000) * cellPx,
						}}
					/>
				)}
			</div>
		</div>
	);
}
