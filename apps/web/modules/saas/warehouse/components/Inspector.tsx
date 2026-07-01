import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Layers, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
	Asset,
	HandlingUnit,
	StorageUnit,
	StorageUnitStatus,
	StorageUnitType,
	Warehouse,
} from "../lib/warehouse-types";
import {
	ASSET_COLORS,
	getRackLayoutMetadata,
	STORAGE_UNIT_COLORS,
} from "../lib/warehouse-types";
import { Tip } from "./Tip";

interface Props {
	warehouse: Warehouse;
	storage?: StorageUnit;
	asset?: Asset;
	handling?: HandlingUnit;
	onUpdateStorage: (id: string, patch: Partial<StorageUnit>) => void;
	onRemoveStorage: (id: string) => void;
	onUpdateAsset?: (id: string, patch: Partial<Asset>) => void;
	onRemoveAsset?: (id: string) => void;
	onUpdateHandling: (id: string, patch: Partial<HandlingUnit>) => void;
	onRemoveHandling: (id: string) => void;
	onGenerateShelves: (
		rackId: string,
		levels: number,
		shelfHeightMm: number,
	) => void;
	onGenerateBinsForRack?: (
		rackId: string,
		cols: number,
		rows: number,
	) => void;
	onGeneratePalletGridForArea?: (
		areaId: string,
		cols: number,
		rows: number,
	) => void;
}

const numField = (
	label: string,
	value: number | undefined,
	onChange: (v: number) => void,
	opts?: { min?: number; step?: number; suffix?: string },
) => (
	<div className="space-y-1">
		<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
			{label}
			{opts?.suffix ? ` (${opts.suffix})` : ""}
		</Label>
		<Input
			type="number"
			min={opts?.min ?? 0}
			step={opts?.step ?? 1}
			value={value ?? 0}
			onChange={(e) =>
				onChange(Math.max(opts?.min ?? 0, Number(e.target.value)))
			}
			className="h-8"
		/>
	</div>
);

const textField = (
	label: string,
	value: string | undefined,
	onChange: (v: string) => void,
) => (
	<div className="space-y-1">
		<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
			{label}
		</Label>
		<Input
			value={value ?? ""}
			onChange={(e) => onChange(e.target.value)}
			className="h-8"
		/>
	</div>
);

const flagRow = (
	label: string,
	checked: boolean,
	onChange: (v: boolean) => void,
) => (
	<div className="flex items-center justify-between py-1">
		<Label className="text-xs">{label}</Label>
		<Switch checked={checked} onCheckedChange={onChange} />
	</div>
);

export default function Inspector({
	warehouse,
	storage,
	asset,
	handling,
	onUpdateStorage,
	onRemoveStorage,
	onUpdateAsset,
	onRemoveAsset,
	onUpdateHandling,
	onRemoveHandling,
	onGenerateShelves,
	onGenerateBinsForRack,
	onGeneratePalletGridForArea,
}: Props) {
	if (handling)
		return (
			<HandlingInspector
				hu={handling}
				warehouse={warehouse}
				onUpdate={onUpdateHandling}
				onRemove={onRemoveHandling}
			/>
		);
	if (asset)
		return (
			<AssetInspector
				asset={asset}
				onUpdate={onUpdateAsset}
				onRemove={onRemoveAsset}
			/>
		);
	if (storage)
		return (
			<StorageInspector
				u={storage}
				warehouse={warehouse}
				onUpdate={onUpdateStorage}
				onRemove={onRemoveStorage}
				onGenerateShelves={onGenerateShelves}
				onGenerateBinsForRack={onGenerateBinsForRack}
				onGeneratePalletGridForArea={onGeneratePalletGridForArea}
			/>
		);
	return (
		<div className="p-4 text-sm text-muted-foreground">
			<p className="font-medium text-foreground mb-1">Nothing selected</p>
			<p>
				Pick the <span className="font-mono text-xs">Select</span> tool,
				click a storage unit on the canvas. Drag handles to resize, the
				top circle to rotate (Shift = 15°).
			</p>
		</div>
	);
}

function AssetInspector({
	asset,
	onUpdate,
	onRemove,
}: {
	asset: Asset;
	onUpdate?: (id: string, patch: Partial<Asset>) => void;
	onRemove?: (id: string) => void;
}) {
	const update = (patch: Partial<Asset>) => onUpdate?.(asset.id, patch);

	return (
		<div className="p-4 space-y-4 text-sm">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-[11px] uppercase tracking-wider text-muted-foreground">
						Building asset
					</div>
					<div className="font-semibold flex items-center gap-2">
						<span
							className="inline-block w-2.5 h-2.5 rounded-sm"
							style={{
								background:
									asset.colorHex ?? ASSET_COLORS[asset.type],
							}}
						/>
						{asset.type.replace("_", " ")}
					</div>
				</div>
				{onRemove && (
					<Tip label="Delete this building asset">
						<Button
							size="icon"
							variant="ghost"
							onClick={() => onRemove(asset.id)}
							aria-label="Delete"
						>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</Tip>
				)}
			</div>

			{onUpdate && (
				<div className="space-y-3">
					<div className="grid grid-cols-3 gap-2">
						{numField(
							"Start X",
							asset.startXMm,
							(v) => update({ startXMm: v }),
							{ step: 100, suffix: "mm" },
						)}
						{numField(
							"Start Y",
							asset.startYMm,
							(v) => update({ startYMm: v }),
							{ step: 100, suffix: "mm" },
						)}
						{numField(
							"Start Z",
							asset.startZMm,
							(v) => update({ startZMm: v }),
							{ step: 100, suffix: "mm" },
						)}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{numField(
							"Width",
							asset.widthMm,
							(v) => update({ widthMm: Math.max(50, v) }),
							{ min: 50, step: 100, suffix: "mm" },
						)}
						{numField(
							"Length",
							asset.lengthMm,
							(v) => update({ lengthMm: Math.max(50, v) }),
							{ min: 50, step: 100, suffix: "mm" },
						)}
						{numField(
							"Height",
							asset.heightMm,
							(v) => update({ heightMm: Math.max(50, v) }),
							{ min: 50, step: 100, suffix: "mm" },
						)}
					</div>
					{numField(
						"Rotation Z",
						asset.rotationZDeg,
						(v) => update({ rotationZDeg: v }),
						{ step: 5, suffix: "°" },
					)}
				</div>
			)}
		</div>
	);
}

function StorageInspector({
	u,
	warehouse,
	onUpdate,
	onRemove,
	onGenerateShelves,
	onGenerateBinsForRack,
	onGeneratePalletGridForArea,
}: {
	u: StorageUnit;
	warehouse: Warehouse;
	onUpdate: (id: string, patch: Partial<StorageUnit>) => void;
	onRemove: (id: string) => void;
	onGenerateShelves: (
		rackId: string,
		levels: number,
		shelfHeightMm: number,
	) => void;
	onGenerateBinsForRack?: (
		rackId: string,
		cols: number,
		rows: number,
	) => void;
	onGeneratePalletGridForArea?: (
		areaId: string,
		cols: number,
		rows: number,
	) => void;
}) {
	const update = (p: Partial<StorageUnit>) => onUpdate(u.id, p);
	const zones = warehouse.zones;
	const allUnits = useMemo(
		() => warehouse.floors.flatMap((f) => f.storageUnits),
		[warehouse.floors],
	);
	const rackLayout = getRackLayoutMetadata(u);
	const areaLayout =
		u.metadata?.layout &&
		typeof u.metadata.layout === "object" &&
		!Array.isArray(u.metadata.layout)
			? (u.metadata.layout as {
					palletGrid?: { cols?: number; rows?: number };
				})
			: {};
	const shelfCount = allUnits.filter(
		(unit) => unit.parentStorageUnitId === u.id && unit.type === "SHELF",
	).length;
	const palletCount = allUnits.filter(
		(unit) => unit.parentStorageUnitId === u.id && unit.type === "PALLET",
	).length;
	const binCount = allUnits.filter((unit) => {
		if (unit.type !== "BIN" || !unit.parentStorageUnitId) {
			return false;
		}
		const shelf = allUnits.find((s) => s.id === unit.parentStorageUnitId);
		return shelf?.parentStorageUnitId === u.id;
	}).length;

	const [levels, setLevels] = useState(rackLayout.levelCount ?? 4);
	const [shelfHeightMm, setShelfHeightMm] = useState(
		rackLayout.shelfHeightMm ?? 500,
	);
	const [binCols, setBinCols] = useState(
		rackLayout.binsPerShelf?.cols ?? 5,
	);
	const [binRows, setBinRows] = useState(
		rackLayout.binsPerShelf?.rows ?? 2,
	);
	const [palletCols, setPalletCols] = useState(
		areaLayout.palletGrid?.cols ?? 3,
	);
	const [palletRows, setPalletRows] = useState(
		areaLayout.palletGrid?.rows ?? 4,
	);

	useEffect(() => {
		const layout = getRackLayoutMetadata(u);
		const shelves = allUnits.filter(
			(unit) =>
				unit.parentStorageUnitId === u.id && unit.type === "SHELF",
		).length;
		setLevels(layout.levelCount ?? (shelves || 4));
		setShelfHeightMm(layout.shelfHeightMm ?? 500);
		setBinCols(layout.binsPerShelf?.cols ?? 5);
		setBinRows(layout.binsPerShelf?.rows ?? 2);
		const areaMeta =
			u.metadata?.layout &&
			typeof u.metadata.layout === "object" &&
			!Array.isArray(u.metadata.layout)
				? (u.metadata.layout as {
						palletGrid?: { cols?: number; rows?: number };
					})
				: {};
		setPalletCols(areaMeta.palletGrid?.cols ?? 3);
		setPalletRows(areaMeta.palletGrid?.rows ?? 4);
	}, [u.id, u.metadata, allUnits, u]);

	return (
		<div className="p-4 space-y-4 text-sm">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-[11px] uppercase tracking-wider text-muted-foreground">
						Storage unit
					</div>
					<div className="font-semibold">
						<span
							className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5"
							style={{
								background:
									u.colorHex ?? STORAGE_UNIT_COLORS[u.type],
							}}
						/>
						{u.type}
					</div>
				</div>
				<Tip label="Delete this storage unit">
					<Button
						size="icon"
						variant="ghost"
						onClick={() => onRemove(u.id)}
						aria-label="Delete"
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</Tip>
			</div>

			<Tabs defaultValue="identity" className="flex flex-col">
				<TabsList className="grid grid-cols-5 h-8">
					<TabsTrigger value="identity" className="text-[10px]">
						ID
					</TabsTrigger>
					<TabsTrigger value="geometry" className="text-[10px]">
						Geo
					</TabsTrigger>
					<TabsTrigger value="capacity" className="text-[10px]">
						Cap
					</TabsTrigger>
					<TabsTrigger value="rules" className="text-[10px]">
						Rules
					</TabsTrigger>
					<TabsTrigger value="visual" className="text-[10px]">
						Visual
					</TabsTrigger>
				</TabsList>

				<TabsContent value="identity" className="space-y-3 pt-3">
					{textField("Code", u.code, (v) => update({ code: v }))}
					{textField("Name", u.name, (v) => update({ name: v }))}
					{textField("Barcode", u.barcode, (v) =>
						update({ barcode: v }),
					)}
					{textField("QR code", u.qrCode, (v) =>
						update({ qrCode: v }),
					)}

					<div className="space-y-1">
						<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
							Type
						</Label>
						<div className="grid grid-cols-3 gap-1">
							{(
								Object.keys(
									STORAGE_UNIT_COLORS,
								) as StorageUnitType[]
							).map((t) => (
								<button
									key={t}
									onClick={() =>
										update({
											type: t,
											colorHex: STORAGE_UNIT_COLORS[t],
										})
									}
									className={`text-[10px] py-1 rounded border transition-colors ${
										u.type === t
											? "bg-primary text-primary-foreground border-primary"
											: "bg-surface hover:bg-accent border-border"
									}`}
								>
									{t}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1">
						<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
							Status
						</Label>
						<div className="grid grid-cols-4 gap-1">
							{(
								[
									"ACTIVE",
									"INACTIVE",
									"BLOCKED",
									"MAINTENANCE",
								] as StorageUnitStatus[]
							).map((s) => (
								<button
									key={s}
									onClick={() => update({ status: s })}
									className={`text-[10px] py-1 rounded border ${
										u.status === s
											? "bg-primary text-primary-foreground border-primary"
											: "bg-surface hover:bg-accent border-border"
									}`}
								>
									{s.slice(0, 4)}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1">
						<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
							Zone
						</Label>
						<select
							className="w-full h-8 rounded border border-border bg-surface px-2 text-xs"
							value={u.zoneId ?? ""}
							onChange={(e) => {
								const id = e.target.value || undefined;
								const z = zones.find((zz) => zz.id === id);
								update({
									zoneId: id,
									colorHex: z ? z.colorHex : u.colorHex,
								});
							}}
						>
							<option value="">— none —</option>
							{zones.map((z) => (
								<option key={z.id} value={z.id}>
									{z.code} · {z.name}
								</option>
							))}
						</select>
					</div>
				</TabsContent>

				<TabsContent value="geometry" className="space-y-3 pt-3">
					<div className="grid grid-cols-3 gap-2">
						{numField(
							"Start X",
							u.startXMm,
							(v) => update({ startXMm: v }),
							{ step: 100, suffix: "mm" },
						)}
						{numField(
							"Start Y",
							u.startYMm,
							(v) => update({ startYMm: v }),
							{ step: 100, suffix: "mm" },
						)}
						{numField(
							"Start Z",
							u.startZMm,
							(v) => update({ startZMm: v }),
							{ step: 100, suffix: "mm" },
						)}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{numField(
							"Width",
							u.widthMm,
							(v) => update({ widthMm: Math.max(50, v) }),
							{ min: 50, step: 100, suffix: "mm" },
						)}
						{numField(
							"Length",
							u.lengthMm,
							(v) => update({ lengthMm: Math.max(50, v) }),
							{ min: 50, step: 100, suffix: "mm" },
						)}
						{numField(
							"Height",
							u.heightMm,
							(v) => update({ heightMm: Math.max(50, v) }),
							{ min: 50, step: 100, suffix: "mm" },
						)}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{numField(
							"Rot X",
							u.rotationXDeg,
							(v) => update({ rotationXDeg: v }),
							{ step: 5, suffix: "°" },
						)}
						{numField(
							"Rot Y",
							u.rotationYDeg,
							(v) => update({ rotationYDeg: v }),
							{ step: 5, suffix: "°" },
						)}
						{numField(
							"Rot Z",
							u.rotationZDeg,
							(v) => update({ rotationZDeg: v }),
							{ step: 5, suffix: "°" },
						)}
					</div>

					{u.type === "RACK" && (
						<div className="space-y-3 border-t border-border pt-3">
							<div className="text-[11px] uppercase tracking-wider text-muted-foreground">
								Rack levels
							</div>
							{shelfCount > 0 && (
								<p className="text-[11px] text-muted-foreground">
									{shelfCount} shelf
									{shelfCount === 1 ? "" : "ves"}
									{binCount > 0
										? ` · ${binCount} bins (${binCols}×${binRows} per shelf)`
										: ""}
								</p>
							)}
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
										Levels
									</Label>
									<Input
										type="number"
										min={1}
										max={12}
										value={levels}
										onChange={(e) =>
											setLevels(
												Math.max(
													1,
													Math.min(
														12,
														Number(e.target.value),
													),
												),
											)
										}
										className="h-8"
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
										Shelf height (mm)
									</Label>
									<Input
										type="number"
										min={100}
										step={50}
										value={shelfHeightMm}
										onChange={(e) =>
											setShelfHeightMm(
												Math.max(
													100,
													Number(e.target.value),
												),
											)
										}
										className="h-8"
									/>
								</div>
							</div>
							<Button
								size="sm"
								variant="secondary"
								className="w-full gap-1.5"
								onClick={() =>
									onGenerateShelves(
										u.id,
										levels,
										shelfHeightMm,
									)
								}
							>
								<Layers className="h-3.5 w-3.5" />
								Build shelves
							</Button>
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
										Bin cols
									</Label>
									<Input
										type="number"
										min={1}
										max={24}
										value={binCols}
										onChange={(e) =>
											setBinCols(
												Math.max(
													1,
													Number(e.target.value),
												),
											)
										}
										className="h-8"
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
										Bin rows
									</Label>
									<Input
										type="number"
										min={1}
										max={24}
										value={binRows}
										onChange={(e) =>
											setBinRows(
												Math.max(
													1,
													Number(e.target.value),
												),
											)
										}
										className="h-8"
									/>
								</div>
							</div>
							<Button
								size="sm"
								variant="outline"
								className="w-full"
								disabled={!onGenerateBinsForRack || shelfCount === 0}
								onClick={() =>
									onGenerateBinsForRack?.(
										u.id,
										binCols,
										binRows,
									)
								}
							>
								Fill all shelves with bins
							</Button>
						</div>
					)}

					{u.type === "FLOOR" && (
						<div className="space-y-3 border-t border-border pt-3">
							<div className="text-[11px] uppercase tracking-wider text-muted-foreground">
								Pallet grid
							</div>
							{palletCount > 0 && (
								<p className="text-[11px] text-muted-foreground">
									{palletCount} pallet slot
									{palletCount === 1 ? "" : "s"} ({palletCols}
									×{palletRows})
								</p>
							)}
							<div className="grid grid-cols-2 gap-2">
								<div className="space-y-1">
									<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
										Cols
									</Label>
									<Input
										type="number"
										min={1}
										max={24}
										value={palletCols}
										onChange={(e) =>
											setPalletCols(
												Math.max(
													1,
													Number(e.target.value),
												),
											)
										}
										className="h-8"
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
										Rows
									</Label>
									<Input
										type="number"
										min={1}
										max={24}
										value={palletRows}
										onChange={(e) =>
											setPalletRows(
												Math.max(
													1,
													Number(e.target.value),
												),
											)
										}
										className="h-8"
									/>
								</div>
							</div>
							<Button
								size="sm"
								variant="outline"
								className="w-full"
								disabled={!onGeneratePalletGridForArea}
								onClick={() =>
									onGeneratePalletGridForArea?.(
										u.id,
										palletCols,
										palletRows,
									)
								}
							>
								Generate pallet slots
							</Button>
						</div>
					)}
				</TabsContent>

				<TabsContent value="capacity" className="space-y-3 pt-3">
					<div className="grid grid-cols-2 gap-2">
						{numField(
							"Max weight",
							u.maxWeightKg,
							(v) => update({ maxWeightKg: v }),
							{ step: 50, suffix: "kg" },
						)}
						{numField(
							"Max volume",
							u.maxVolumeM3,
							(v) => update({ maxVolumeM3: v }),
							{ step: 0.5, suffix: "m³" },
						)}
						{numField("Max pallets", u.maxPallets, (v) =>
							update({ maxPallets: v }),
						)}
						{numField("Max units", u.maxUnits, (v) =>
							update({ maxUnits: v }),
						)}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{numField("Level idx", u.levelIndex, (v) =>
							update({ levelIndex: v }),
						)}
						{numField("Position", u.positionIndex, (v) =>
							update({ positionIndex: v }),
						)}
						{numField("Sequence", u.sequence, (v) =>
							update({ sequence: v }),
						)}
					</div>
				</TabsContent>

				<TabsContent value="rules" className="space-y-1 pt-3">
					{flagRow("Allow mixed SKU", u.allowMixedSku, (v) =>
						update({ allowMixedSku: v }),
					)}
					{flagRow("Allow mixed batch", u.allowMixedBatch, (v) =>
						update({ allowMixedBatch: v }),
					)}
					{flagRow("Allow loose", u.allowLooseInventory, (v) =>
						update({ allowLooseInventory: v }),
					)}
					{flagRow("Allow pallet", u.allowPalletInventory, (v) =>
						update({ allowPalletInventory: v }),
					)}
					{flagRow("Allow carton", u.allowCartonInventory, (v) =>
						update({ allowCartonInventory: v }),
					)}
					<div className="border-t border-border my-2" />
					{flagRow("Pickable", u.isPickable, (v) =>
						update({ isPickable: v }),
					)}
					{flagRow("Storable", u.isStorable, (v) =>
						update({ isStorable: v }),
					)}
					{flagRow("Inbound allowed", u.isInboundAllowed, (v) =>
						update({ isInboundAllowed: v }),
					)}
					{flagRow("Outbound allowed", u.isOutboundAllowed, (v) =>
						update({ isOutboundAllowed: v }),
					)}
					{flagRow("Cycle count", u.isCycleCountEnabled, (v) =>
						update({ isCycleCountEnabled: v }),
					)}
					{flagRow("Blocked", u.isBlocked, (v) =>
						update({ isBlocked: v }),
					)}
				</TabsContent>

				<TabsContent value="visual" className="space-y-3 pt-3">
					<div className="space-y-1">
						<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
							Color
						</Label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={
									u.colorHex ?? STORAGE_UNIT_COLORS[u.type]
								}
								onChange={(e) =>
									update({ colorHex: e.target.value })
								}
								className="h-8 w-12 rounded border border-border"
							/>
							<Input
								value={u.colorHex ?? ""}
								onChange={(e) =>
									update({ colorHex: e.target.value })
								}
								className="h-8 flex-1 font-mono text-xs"
							/>
						</div>
					</div>
					<div className="space-y-1">
						<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
							Label color
						</Label>
						<Input
							value={u.labelColorHex ?? ""}
							onChange={(e) =>
								update({ labelColorHex: e.target.value })
							}
							className="h-8 font-mono text-xs"
						/>
					</div>
					{textField("Icon", u.icon, (v) => update({ icon: v }))}
				</TabsContent>
			</Tabs>
		</div>
	);
}

function HandlingInspector({
	hu,
	warehouse,
	onUpdate,
	onRemove,
}: {
	hu: HandlingUnit;
	warehouse: Warehouse;
	onUpdate: (id: string, patch: Partial<HandlingUnit>) => void;
	onRemove: (id: string) => void;
}) {
	const update = (p: Partial<HandlingUnit>) => onUpdate(hu.id, p);
	const allStorage = warehouse.floors.flatMap((f) => f.storageUnits);
	return (
		<div className="p-4 space-y-4 text-sm">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-[11px] uppercase tracking-wider text-muted-foreground">
						Handling unit
					</div>
					<div className="font-semibold">{hu.type}</div>
				</div>
				<Tip label="Delete this handling unit">
					<Button
						size="icon"
						variant="ghost"
						onClick={() => onRemove(hu.id)}
						aria-label="Delete"
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</Tip>
			</div>
			{textField("Code", hu.code, (v) => update({ code: v }))}
			{textField("Barcode", hu.barcode, (v) => update({ barcode: v }))}
			<div className="space-y-1">
				<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
					Type
				</Label>
				<div className="grid grid-cols-4 gap-1">
					{(["PALLET", "BIN", "MIX", "CONTAINER"] as const).map(
						(t) => (
							<button
								key={t}
								onClick={() => update({ type: t })}
								className={`text-[10px] py-1 rounded border ${
									hu.type === t
										? "bg-primary text-primary-foreground border-primary"
										: "bg-surface hover:bg-accent border-border"
								}`}
							>
								{t}
							</button>
						),
					)}
				</div>
			</div>
			<div className="space-y-1">
				<Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
					Current storage unit
				</Label>
				<select
					className="w-full h-8 rounded border border-border bg-surface px-2 text-xs"
					value={hu.currentStorageUnitId ?? ""}
					onChange={(e) =>
						update({
							currentStorageUnitId: e.target.value || undefined,
						})
					}
				>
					<option value="">— unassigned —</option>
					{allStorage.map((u) => (
						<option key={u.id} value={u.id}>
							{u.code} ({u.type})
						</option>
					))}
				</select>
			</div>
			<div className="grid grid-cols-2 gap-2">
				{numField("Width", hu.widthMm, (v) => update({ widthMm: v }), {
					step: 50,
					suffix: "mm",
				})}
				{numField(
					"Length",
					hu.lengthMm,
					(v) => update({ lengthMm: v }),
					{ step: 50, suffix: "mm" },
				)}
				{numField(
					"Height",
					hu.heightMm,
					(v) => update({ heightMm: v }),
					{ step: 50, suffix: "mm" },
				)}
				{numField(
					"Weight",
					hu.weightKg,
					(v) => update({ weightKg: v }),
					{ step: 10, suffix: "kg" },
				)}
			</div>
		</div>
	);
}
