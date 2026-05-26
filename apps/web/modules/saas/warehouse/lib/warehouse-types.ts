// Schema-aligned types for the warehouse layout designer.
// Mirrors the Prisma models: Warehouse → WarehouseFloor → StorageUnit (recursive)
// + Zone (logical) + HandlingUnit (placed inside a StorageUnit).
// All physical dimensions are stored in millimetres (numbers, Decimal-compatible).
// The editor converts to/from meters for display (1 m = 1000 mm = 24 px).

export type WarehouseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type FloorStatus = "ACTIVE" | "INACTIVE";

export type ZoneType =
	| "STORAGE"
	| "RECEIVING"
	| "SHIPPING"
	| "STAGING"
	| "RETURNS"
	| "QC"
	| "QUARANTINE";

export type AssetType = "AISLE" | "DOCK_DOOR" | "WALL" | "STAIRS";

export type StorageUnitType = "RACK" | "SHELF" | "BIN" | "FLOOR";

export type StorageUnitStatus =
	| "ACTIVE"
	| "INACTIVE"
	| "BLOCKED"
	| "MAINTENANCE";

export type HandlingUnitType = "PALLET" | "BIN" | "MIX" | "CONTAINER";
export type HandlingUnitStatus = "ACTIVE" | "IN_TRANSIT" | "EMPTY" | "DAMAGED";

export interface Warehouse {
	id: string;
	code: string;
	name: string;
	description?: string;
	timezone: string;
	status: WarehouseStatus;
	activeFloorId: string; // editor state
	floors: WarehouseFloor[];
	zones: Zone[];
	handlingUnits: HandlingUnit[];
	updatedAt: number;
}

export interface Asset {
	id: string;
	type: AssetType;
	status: StorageUnitStatus;

	startXMm: number;
	startYMm: number;
	startZMm: number;

	// Dimensions in mm.
	widthMm: number;
	lengthMm: number;
	heightMm: number;

	// Rotation in degrees.
	rotationXDeg: number;
	rotationYDeg: number;
	rotationZDeg: number;

	// Visualization
	colorHex?: string;
	labelColorHex?: string;
	icon?: string;

	metadata?: Record<string, unknown>;
}

export interface WarehouseFloor {
	id: string;
	floorNumber: number;
	code: string;
	name?: string;
	status: FloorStatus;
	widthMm?: number;
	lengthMm?: number;
	heightMm?: number;
	originXMm: number;
	originYMm: number;
	originZMm: number;
	elevationMm: number; // 0 for ground floor; >0 for mezzanines / upper floors
	storageUnits: StorageUnit[];
	assets: Asset[];
	metadata?: Record<string, unknown>;
}

export interface Zone {
	id: string;
	code: string;
	name: string;
	description?: string;
	type: ZoneType;
	colorHex: string;
	metadata?: Record<string, unknown>;
}

export interface StorageUnit {
	id: string;
	parentStorageUnitId?: string;
	zoneId?: string;
	code: string;
	name?: string;
	barcode?: string;
	qrCode?: string;
	type: StorageUnitType;
	status: StorageUnitStatus;

	// 3D positioning — floor-local, in mm.
	startXMm: number;
	startYMm: number;
	startZMm: number;

	// Dimensions in mm.
	widthMm: number;
	lengthMm: number;
	heightMm: number;

	// Rotation in degrees.
	rotationXDeg: number;
	rotationYDeg: number;
	rotationZDeg: number;

	// Capacity
	maxWeightKg?: number;
	maxVolumeM3?: number;
	maxPallets?: number;
	maxUnits?: number;

	// Hierarchy helpers
	levelIndex?: number;
	positionIndex?: number;
	sequence?: number;

	// Rules
	allowMixedSku: boolean;
	allowMixedBatch: boolean;
	allowLooseInventory: boolean;
	allowPalletInventory: boolean;
	allowCartonInventory: boolean;

	// Flags
	isPickable: boolean;
	isStorable: boolean;
	isInboundAllowed: boolean;
	isOutboundAllowed: boolean;
	isCycleCountEnabled: boolean;
	isBlocked: boolean;

	// Visualization
	colorHex?: string;
	labelColorHex?: string;
	icon?: string;

	metadata?: Record<string, unknown>;
}

export interface HandlingUnit {
	id: string;
	code: string;
	barcode?: string;
	type: HandlingUnitType;
	status: HandlingUnitStatus;
	currentStorageUnitId?: string;
	parentHandlingUnitId?: string;
	widthMm?: number;
	lengthMm?: number;
	heightMm?: number;
	weightKg?: number;
	metadata?: Record<string, unknown>;
}

// ---------- editor-only types ----------

export type SelectionKind = "storage" | "handling" | "zone" | "floor";
export interface Selection {
	kind: SelectionKind;
	id: string;
}

export type Tool =
	| "select"
	| "WALL"
	| "AREA"
	| "RACK"
	| "SHELF"
	| "BIN"
	| "AISLE"
	| "DOCK_DOOR"
	| "STAIRS";

export type ViewMode = "2d" | "3d" | "iso";

// ---------- visual tokens ----------

export const ZONE_DEFAULT_COLORS: Record<ZoneType, string> = {
	STORAGE: "#5b5bf0",
	SHIPPING: "#2dc7b3",
	RECEIVING: "#f5a524",
	STAGING: "#a855f7",
	RETURNS: "#ef4444",
	QUARANTINE: "#f97316",
	QC: "#338151",
};

export const STORAGE_UNIT_COLORS: Record<StorageUnitType, string> = {
	RACK: "#475569",
	SHELF: "#94a3b8",
	BIN: "#f59e0b",
	FLOOR: "#a3a3a3",
};

export const ASSET_COLORS: Record<AssetType, string> = {
	AISLE: "#cbd5e1",
	DOCK_DOOR: "#0ea5e9",
	WALL: "#3a3f4b",
	STAIRS: "#94a3b8",
};

export const HANDLING_UNIT_COLORS: Record<HandlingUnitType, string> = {
	PALLET: "#d97706",
	BIN: "#a16207",
	MIX: "#0d9488",
	CONTAINER: "#1d4ed8",
};

// ---------- helpers ----------

export const M_TO_MM = 1000;
export const PX_PER_M = 24; // canvas: 1 metre = 24 px
export const PX_PER_MM = PX_PER_M / M_TO_MM;

export const mmToM = (mm: number) => mm / M_TO_MM;
export const mToMm = (m: number) => m * M_TO_MM;
export const mmToPx = (mm: number) => mm * PX_PER_MM;
export const pxToMm = (px: number) => px / PX_PER_MM;

/** Default dimensions per storage unit type, in mm. */
export const DEFAULT_DIMENSIONS_MM: Record<
	StorageUnitType | AssetType,
	{ widthMm: number; lengthMm: number; heightMm: number }
> = {
	WALL: { widthMm: 1000, lengthMm: 1000, heightMm: 4000 },
	FLOOR: { widthMm: 5000, lengthMm: 5000, heightMm: 50 },
	RACK: { widthMm: 6000, lengthMm: 1000, heightMm: 2500 },
	SHELF: { widthMm: 1200, lengthMm: 600, heightMm: 50 },
	BIN: { widthMm: 400, lengthMm: 400, heightMm: 300 },
	AISLE: { widthMm: 3000, lengthMm: 10000, heightMm: 50 },
	DOCK_DOOR: { widthMm: 3000, lengthMm: 500, heightMm: 3500 },
	STAIRS: { widthMm: 1200, lengthMm: 3000, heightMm: 3000 },
};
