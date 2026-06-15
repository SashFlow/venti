// Utility to convert between Warehouse (designer) and Location[] (backend)
import type {
	Asset,
	AssetType,
	StorageUnit,
	StorageUnitStatus,
	StorageUnitType,
	Warehouse,
	WarehouseFloor,
	Zone,
	ZoneType,
} from "./warehouse-types";
import { ZONE_DEFAULT_COLORS } from "./warehouse-types";

type DbLocation = {
	id: string;
	parentLocationId?: string | null;
	code: string;
	name?: string | null;
	type: string;
	x?: unknown;
	y?: unknown;
	z?: unknown;
	width?: unknown;
	height?: unknown;
	depth?: unknown;
	rotationX?: unknown;
	rotationY?: unknown;
	rotationZ?: unknown;
	colorHex?: string | null;
	meshType?: string | null;
	sequence?: number | null;
	barcode?: string | null;
};

type DbAsset = {
	id: string;
	locationId?: string | null;
	name?: string | null;
	type: string;
	x?: unknown;
	y?: unknown;
	z?: unknown;
	width?: unknown;
	height?: unknown;
	depth?: unknown;
	rotationX?: unknown;
	rotationY?: unknown;
	rotationZ?: unknown;
	colorHex?: string | null;
};

const STORAGE_LOCATION_TYPES = new Set([
	"RACK",
	"SHELF",
	"BIN",
	"FLOOR",
	"BLOCK",
	"PALLET",
]);

function num(v: unknown): number {
	if (v == null) {
		return 0;
	}
	return typeof v === "number" ? v : Number(v);
}

/** Seed data uses metres; designer uses millimetres. */
function toMm(v: number): number {
	if (v === 0) {
		return 0;
	}
	if (Math.abs(v) < 500) {
		return v * 1000;
	}
	return v;
}

function mapStorageType(type: string): StorageUnitType {
	if (type === "RACK" || type === "SHELF" || type === "BIN" || type === "FLOOR") {
		return type;
	}
	return "BIN";
}

function inferZoneType(loc: DbLocation): ZoneType {
	const mesh = (loc.meshType ?? "").toUpperCase();
	if (
		mesh === "STORAGE" ||
		mesh === "RECEIVING" ||
		mesh === "SHIPPING" ||
		mesh === "STAGING" ||
		mesh === "RETURNS" ||
		mesh === "QC" ||
		mesh === "QUARANTINE"
	) {
		return mesh as ZoneType;
	}
	const code = loc.code.toUpperCase();
	if (code.includes("IN") || code.includes("RCV")) {
		return "RECEIVING";
	}
	if (code.includes("OUT") || code.includes("SHIP")) {
		return "SHIPPING";
	}
	if (code.includes("QC")) {
		return "QC";
	}
	if (code.includes("RET")) {
		return "RETURNS";
	}
	if (code.includes("STG") || code.includes("STAGE")) {
		return "STAGING";
	}
	if (code.includes("QUAR")) {
		return "QUARANTINE";
	}
	return "STORAGE";
}

function findFloorId(
	loc: DbLocation,
	byId: Map<string, DbLocation>,
): string | null {
	let current: DbLocation | undefined = loc;
	while (current) {
		if (current.type === "FLOOR") {
			return current.id;
		}
		current = current.parentLocationId
			? byId.get(current.parentLocationId)
			: undefined;
	}
	return null;
}

function locationToStorageUnit(loc: DbLocation): StorageUnit {
	const status: StorageUnitStatus = "ACTIVE";
	return {
		id: loc.id,
		parentStorageUnitId: loc.parentLocationId ?? undefined,
		code: loc.code,
		name: loc.name ?? undefined,
		barcode: loc.barcode ?? undefined,
		type: mapStorageType(loc.type),
		status,
		startXMm: toMm(num(loc.x)),
		startYMm: toMm(num(loc.y)),
		startZMm: toMm(num(loc.z)),
		widthMm: toMm(num(loc.width)) || 400,
		lengthMm: toMm(num(loc.depth)) || 400,
		heightMm: toMm(num(loc.height)) || 300,
		rotationXDeg: num(loc.rotationX),
		rotationYDeg: num(loc.rotationY),
		rotationZDeg: num(loc.rotationZ),
		sequence: loc.sequence ?? undefined,
		allowMixedSku: true,
		allowMixedBatch: true,
		allowLooseInventory: true,
		allowPalletInventory: true,
		allowCartonInventory: true,
		isPickable: true,
		isStorable: true,
		isInboundAllowed: true,
		isOutboundAllowed: true,
		isCycleCountEnabled: true,
		isBlocked: false,
		colorHex: loc.colorHex ?? undefined,
	};
}

function assetToDesignerAsset(asset: DbAsset): Asset {
	const assetType = asset.type as AssetType;
	return {
		id: asset.id,
		type: assetType,
		status: "ACTIVE",
		startXMm: toMm(num(asset.x)),
		startYMm: toMm(num(asset.y)),
		startZMm: toMm(num(asset.z)),
		widthMm: toMm(num(asset.width)) || 1000,
		lengthMm: toMm(num(asset.depth)) || 1000,
		heightMm: toMm(num(asset.height)) || 1000,
		rotationXDeg: num(asset.rotationX),
		rotationYDeg: num(asset.rotationY),
		rotationZDeg: num(asset.rotationZ),
		colorHex: asset.colorHex ?? undefined,
	};
}

// Flattens a Warehouse object into an array of Location create inputs
export function warehouseToLocationInputs(warehouse: Warehouse) {
	const locations: any[] = [];
	// Floors
	for (const floor of warehouse.floors) {
		locations.push({
			type: "FLOOR",
			code: floor.code,
			name: floor.name,
			x: floor.originXMm,
			y: floor.originYMm,
			z: floor.elevationMm,
			width: floor.widthMm,
			depth: floor.lengthMm,
			height: floor.heightMm,
			meshType: "FLOOR",
			sequence: floor.floorNumber,
		});
	}
	// Zones
	for (const zone of warehouse.zones) {
		locations.push({
			type: "ZONE",
			code: zone.code,
			name: zone.name,
			colorHex: zone.colorHex,
			meshType: zone.type,
		});
	}
	// StorageUnits
	for (const floor of warehouse.floors) {
		for (const su of floor.storageUnits) {
			locations.push({
				type: su.type,
				code: su.code,
				name: su.name,
				x: su.startXMm,
				y: su.startYMm,
				z: su.startZMm,
				width: su.widthMm,
				depth: su.lengthMm,
				height: su.heightMm,
				rotationX: su.rotationXDeg,
				rotationY: su.rotationYDeg,
				rotationZ: su.rotationZDeg,
				colorHex: su.colorHex,
				meshType: su.type,
			});
		}
	}
	// Assets
	for (const floor of warehouse.floors) {
		for (const asset of floor.assets) {
			locations.push({
				type: asset.type,
				x: asset.startXMm,
				y: asset.startYMm,
				z: asset.startZMm,
				width: asset.widthMm,
				depth: asset.lengthMm,
				height: asset.heightMm,
				rotationX: asset.rotationXDeg,
				rotationY: asset.rotationYDeg,
				rotationZ: asset.rotationZDeg,
				colorHex: asset.colorHex,
				meshType: asset.type,
			});
		}
	}
	return locations;
}

// Rebuilds a Warehouse object from a flat array of Locations (+ optional Assets)
export function locationsToWarehouse(
	locations: DbLocation[],
	meta: { name: string; code: string; timezone: string },
	assets: DbAsset[] = [],
): Warehouse {
	const byId = new Map(locations.map((l) => [l.id, l]));

	const floorLocs = locations
		.filter((l) => l.type === "FLOOR")
		.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

	const floors: WarehouseFloor[] = floorLocs.map((fl, index) => {
		const floorNumber = fl.sequence ?? index + 1;
		return {
			id: fl.id,
			floorNumber,
			code: fl.code,
			name: fl.name ?? undefined,
			status: "ACTIVE",
			widthMm: toMm(num(fl.width)) || undefined,
			lengthMm: toMm(num(fl.depth)) || undefined,
			heightMm: toMm(num(fl.height)) || undefined,
			originXMm: toMm(num(fl.x)),
			originYMm: toMm(num(fl.y)),
			originZMm: toMm(num(fl.z)),
			elevationMm: toMm(num(fl.z)),
			storageUnits: [],
			assets: [],
		};
	});

	const floorById = new Map(floors.map((f) => [f.id, f]));

	for (const loc of locations) {
		if (!STORAGE_LOCATION_TYPES.has(loc.type) || loc.type === "FLOOR") {
			continue;
		}
		const floorId = findFloorId(loc, byId);
		if (!floorId) {
			continue;
		}
		const floor = floorById.get(floorId);
		if (floor) {
			floor.storageUnits.push(locationToStorageUnit(loc));
		}
	}

	for (const asset of assets) {
		const anchor = asset.locationId ? byId.get(asset.locationId) : undefined;
		const floorId = anchor ? findFloorId(anchor, byId) : floorLocs[0]?.id;
		if (!floorId) {
			continue;
		}
		const floor = floorById.get(floorId);
		if (floor) {
			floor.assets.push(assetToDesignerAsset(asset));
		}
	}

	const zones: Zone[] = locations
		.filter((l) => l.type === "ZONE")
		.map((loc) => {
			const zoneType = inferZoneType(loc);
			return {
				id: loc.id,
				code: loc.code,
				name: loc.name ?? loc.code,
				type: zoneType,
				colorHex: loc.colorHex ?? ZONE_DEFAULT_COLORS[zoneType],
			};
		});

	const activeFloorId = floors[0]?.id ?? "";

	return {
		id: "",
		code: meta.code,
		name: meta.name,
		timezone: meta.timezone,
		status: "ACTIVE",
		activeFloorId,
		floors,
		zones,
		handlingUnits: [],
		updatedAt: Date.now(),
	};
}
