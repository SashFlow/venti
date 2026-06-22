import { useCallback, useEffect, useMemo, useState } from "react";
import type {
	Asset,
	AssetType,
	HandlingUnit,
	Selection,
	StorageUnit,
	StorageUnitType,
	Warehouse,
	WarehouseFloor,
	Zone,
	ZoneType,
} from "./warehouse-types";
import {
	ASSET_COLORS,
	DEFAULT_DIMENSIONS_MM,
	STORAGE_UNIT_COLORS,
	ZONE_DEFAULT_COLORS,
} from "./warehouse-types";

function getStorageKey(warehouseId: string) {
	return `warehause:warehouse:v3:${warehouseId}`;
}
const LEGACY_KEY = "warehause:layout:v2";

const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- factories ----------

export function makeFloor(
	partial: Partial<WarehouseFloor> = {},
): WarehouseFloor {
	return {
		id: uid(),
		floorNumber: 1,
		code: "F1",
		name: "Ground Floor",
		status: "ACTIVE",
		widthMm: 60_000,
		lengthMm: 40_000,
		heightMm: 6_000,
		originXMm: 0,
		originYMm: 0,
		originZMm: 0,
		elevationMm: 0,
		storageUnits: [],
		assets: [],
		...partial,
	};
}

export function makeZone(partial: Partial<Zone> = {}): Zone {
	const type = (partial.type ?? "STORAGE") as ZoneType;
	return {
		id: uid(),
		code: `Z-${uid().slice(0, 4).toUpperCase()}`,
		name: "New zone",
		type,
		colorHex: ZONE_DEFAULT_COLORS[type],
		...partial,
	};
}

export function makeStorageUnit(
	type: StorageUnitType,
	partial: Partial<StorageUnit> = {},
): StorageUnit {
	const d = DEFAULT_DIMENSIONS_MM[type];
	return {
		id: uid(),
		code: `${type}-${uid().slice(0, 4).toUpperCase()}`,
		type,
		status: "ACTIVE",
		startXMm: 0,
		startYMm: 0,
		startZMm: 0,
		widthMm: d.widthMm,
		lengthMm: d.lengthMm,
		heightMm: d.heightMm,
		rotationXDeg: 0,
		rotationYDeg: 0,
		rotationZDeg: 0,
		allowMixedSku: false,
		allowMixedBatch: false,
		allowLooseInventory: true,
		allowPalletInventory: true,
		allowCartonInventory: true,
		isPickable:
			type === "BIN" ||
			type === "PALLET" ||
			type === "SHELF" ||
			type === "RACK",
		isStorable: true,
		isInboundAllowed: true,
		isOutboundAllowed: true,
		isCycleCountEnabled: true,
		isBlocked: false,
		colorHex: STORAGE_UNIT_COLORS[type],
		...partial,
	};
}

export function makeAsset(
	type: AssetType,
	partial: Partial<Asset> = {},
): Asset {
	const d = DEFAULT_DIMENSIONS_MM[type];
	return {
		id: uid(),
		status: "ACTIVE",
		startXMm: 0,
		startYMm: 0,
		startZMm: 0,
		widthMm: d.widthMm,
		lengthMm: d.lengthMm,
		heightMm: d.heightMm,
		rotationXDeg: 0,
		rotationYDeg: 0,
		rotationZDeg: 0,
		colorHex: ASSET_COLORS[type],
		...partial,
		type,
	};
}

const SLOT_CHILD_TYPES = new Set<StorageUnitType>(["BIN", "PALLET"]);

function collectDescendantIds(
	units: StorageUnit[],
	rootId: string,
): Set<string> {
	const ids = new Set<string>();
	let added = true;
	while (added) {
		added = false;
		for (const unit of units) {
			if (
				unit.parentStorageUnitId &&
				(unit.parentStorageUnitId === rootId ||
					ids.has(unit.parentStorageUnitId)) &&
				!ids.has(unit.id)
			) {
				ids.add(unit.id);
				added = true;
			}
		}
	}
	return ids;
}

export function generateGridChildren(
	parent: StorageUnit,
	opts: {
		cols: number;
		rows: number;
		childType: "BIN" | "PALLET";
	},
): StorageUnit[] {
	const cols = Math.max(1, Math.floor(opts.cols));
	const rows = Math.max(1, Math.floor(opts.rows));
	const cellW = parent.widthMm / cols;
	const cellL = parent.lengthMm / rows;
	const defaultH = DEFAULT_DIMENSIONS_MM[opts.childType].heightMm;
	const children: StorageUnit[] = [];
	let index = 0;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			index += 1;
			children.push(
				makeStorageUnit(opts.childType, {
					code: `${parent.code}-P${index}`,
					name: `${opts.childType} ${index}`,
					parentStorageUnitId: parent.id,
					zoneId: parent.zoneId,
					startXMm: parent.startXMm + col * cellW,
					startYMm: parent.startYMm + row * cellL,
					startZMm: parent.startZMm,
					widthMm: cellW,
					lengthMm: cellL,
					heightMm: Math.min(
						defaultH,
						parent.heightMm > 0 ? parent.heightMm : defaultH,
					),
					positionIndex: index,
					sequence: index,
					levelIndex: parent.levelIndex,
				}),
			);
		}
	}

	return children;
}

export function makeHandlingUnit(
	partial: Partial<HandlingUnit> = {},
): HandlingUnit {
	return {
		id: uid(),
		code: `HU-${uid().slice(0, 4).toUpperCase()}`,
		type: "PALLET",
		status: "ACTIVE",
		widthMm: 1200,
		lengthMm: 800,
		heightMm: 1500,
		weightKg: 400,
		...partial,
	};
}

// ---------- default warehouse ----------

function defaultWarehouse(): Warehouse {
	const ground = makeFloor({
		floorNumber: 1,
		code: "F1",
		name: "Ground Floor",
	});
	const mezz = makeFloor({
		floorNumber: 2,
		code: "F2",
		name: "Mezzanine",
		elevationMm: 3_000,
		widthMm: 14_000,
		lengthMm: 22_000,
	});

	const zStorage = makeZone({
		code: "STG-A",
		name: "Storage A",
		type: "STORAGE",
	});
	const zRecv = makeZone({
		code: "RCV",
		name: "Receiving",
		type: "RECEIVING",
	});
	const zShip = makeZone({ code: "SHP", name: "Shipping", type: "SHIPPING" });
	const zStg = makeZone({ code: "STG", name: "Staging", type: "STAGING" });

	// perimeter walls (mm), 60×40m building at (2000,2000)
	const walls: Asset[] = [
		makeAsset("WALL", {
			startXMm: 2_000,
			startYMm: 2_000,
			widthMm: 60_000,
			lengthMm: 200,
		}),
		makeAsset("WALL", {
			startXMm: 2_000,
			startYMm: 41_800,
			widthMm: 60_000,
			lengthMm: 200,
		}),
		makeAsset("WALL", {
			startXMm: 2_000,
			startYMm: 2_000,
			widthMm: 200,
			lengthMm: 40_000,
		}),
		makeAsset("WALL", {
			startXMm: 61_800,
			startYMm: 2_000,
			widthMm: 200,
			lengthMm: 40_000,
		}),
	];

	const areas: StorageUnit[] = [
		makeStorageUnit("FLOOR", {
			code: "A-RCV",
			name: "Receiving",
			zoneId: zRecv.id,
			colorHex: zRecv.colorHex,
			startXMm: 2_200,
			startYMm: 2_200,
			widthMm: 14_000,
			lengthMm: 10_000,
		}),
		makeStorageUnit("FLOOR", {
			code: "A-STG",
			name: "Storage A",
			zoneId: zStorage.id,
			colorHex: zStorage.colorHex,
			startXMm: 18_000,
			startYMm: 2_200,
			widthMm: 26_000,
			lengthMm: 22_000,
		}),
		makeStorageUnit("FLOOR", {
			code: "A-SHP",
			name: "Shipping",
			zoneId: zShip.id,
			colorHex: zShip.colorHex,
			startXMm: 46_000,
			startYMm: 2_200,
			widthMm: 12_000,
			lengthMm: 10_000,
		}),
		makeStorageUnit("FLOOR", {
			code: "A-STG2",
			name: "Staging",
			zoneId: zStg.id,
			colorHex: zStg.colorHex,
			startXMm: 2_200,
			startYMm: 26_000,
			widthMm: 56_000,
			lengthMm: 12_000,
		}),
	];

	const racks: StorageUnit[] = [0, 1, 2, 3].map((i) =>
		makeStorageUnit("RACK", {
			code: `R-${i + 1}`,
			name: `Rack ${i + 1}`,
			zoneId: zStorage.id,
			startXMm: 20_000,
			startYMm: 4_000 + i * 5_000,
			widthMm: 22_000,
			lengthMm: 1_000,
			heightMm: 2_500,
			maxPallets: 24,
			maxWeightKg: 4_000,
		}),
	);

	const stairs = makeAsset("STAIRS", {
		startXMm: 16_000,
		startYMm: 10_000,
		widthMm: 1_200,
		lengthMm: 3_000,
		heightMm: 3_000,
	});

	ground.storageUnits = [...areas, ...racks];
	ground.assets = [...walls, stairs];

	// sample handling units on first rack
	const sampleHU: HandlingUnit[] = [0, 1, 2].map((i) =>
		makeHandlingUnit({
			code: `PLT-${100 + i}`,
			currentStorageUnitId: racks[0].id,
			type: "PALLET",
		}),
	);

	return {
		id: uid(),
		code: "WH-001",
		name: "Untitled Warehouse",
		timezone: "UTC",
		status: "ACTIVE",
		activeFloorId: ground.id,
		floors: [ground, mezz],
		zones: [zStorage, zRecv, zShip, zStg],
		handlingUnits: sampleHU,
		updatedAt: Date.now(),
	};
}

// ---------- legacy migration ----------

function migrateLegacy(raw: string): Warehouse | null {
	try {
		const old = JSON.parse(raw);
		if (!old?.elements) {
			return null;
		}
		const ground = makeFloor({
			floorNumber: 1,
			code: "F1",
			name: "Ground Floor",
		});
		const zones: Zone[] = [];
		const huList: HandlingUnit[] = [];
		const floors: WarehouseFloor[] = [ground];

		for (const e of old.elements) {
			if (e.type === "mezzanine") {
				floors.push(
					makeFloor({
						floorNumber: floors.length + 1,
						code: `F${floors.length + 1}`,
						name: e.label || "Mezzanine",
						elevationMm: (e.elevation ?? 3) * 1000,
						widthMm: e.w * 1000,
						lengthMm: e.h * 1000,
						originXMm: e.x * 1000,
						originYMm: e.y * 1000,
					}),
				);
				continue;
			}
			if (e.type === "zone") {
				const zType = (e.kind || "storage").toUpperCase() as ZoneType;
				let z = zones.find((zz) => zz.type === zType);
				if (!z) {
					z = makeZone({ type: zType, name: e.label, code: zType });
					zones.push(z);
				}
				ground.storageUnits.push(
					makeStorageUnit("FLOOR", {
						code: e.label,
						name: e.label,
						zoneId: z.id,
						colorHex: z.colorHex,
						startXMm: e.x * 1000,
						startYMm: e.y * 1000,
						widthMm: e.w * 1000,
						lengthMm: e.h * 1000,
					}),
				);
				continue;
			}
			if (e.type === "wall") {
				ground.assets.push(
					makeAsset("WALL", {
						startXMm: e.x * 1000,
						startYMm: e.y * 1000,
						widthMm: e.w * 1000,
						lengthMm: e.h * 1000,
						heightMm: (e.height ?? 3) * 1000,
					}),
				);
				continue;
			}
			if (e.type === "rack") {
				ground.storageUnits.push(
					makeStorageUnit("RACK", {
						code: e.label,
						name: e.label,
						startXMm: e.x * 1000,
						startYMm: e.y * 1000,
						widthMm: e.w * 1000,
						lengthMm: e.h * 1000,
						heightMm:
							(e.shelfHeight ?? 0.5) * (e.levels ?? 4) * 1000,
						levelIndex: e.levels,
					}),
				);
				continue;
			}
			if (e.type === "stairs") {
				ground.assets.push(
					makeAsset("STAIRS", {
						startXMm: e.x * 1000,
						startYMm: e.y * 1000,
						widthMm: e.w * 1000,
						lengthMm: e.h * 1000,
						heightMm: (e.rise ?? 3) * 1000,
					}),
				);
			}
		}

		return {
			id: uid(),
			code: "WH-001",
			name: old.name || "Migrated Warehouse",
			timezone: "UTC",
			status: "ACTIVE",
			activeFloorId: ground.id,
			floors,
			zones,
			handlingUnits: huList,
			updatedAt: Date.now(),
		};
	} catch {
		return null;
	}
}

export function loadWarehouse(warehouseId: string): Warehouse {
	try {
		const raw = localStorage.getItem(getStorageKey(warehouseId));
		if (raw) {
			return JSON.parse(raw);
		}
		const legacy = localStorage.getItem(LEGACY_KEY);
		if (legacy) {
			const migrated = migrateLegacy(legacy);
			if (migrated) {
				return migrated;
			}
		}
	} catch {}
	return defaultWarehouse();
}

export function saveWarehouse(warehouseId: string, w: Warehouse) {
	localStorage.setItem(getStorageKey(warehouseId), JSON.stringify(w));
}

// ---------- hook ----------

export function useWarehouse(warehouseId: string) {
	const [warehouse, setWarehouse] = useState<Warehouse>(() =>
		loadWarehouse(warehouseId),
	);
	const [selection, setSelection] = useState<Selection | null>(null);

	useEffect(() => {
		saveWarehouse(warehouseId, warehouse);
	}, [warehouse, warehouseId]);

	// Replace the entire warehouse state (e.g., after loading from backend)
	const initFromWarehouse = useCallback((w: Warehouse) => {
		setWarehouse(w);
	}, []);

	const activeFloor = useMemo(
		() =>
			warehouse.floors.find((f) => f.id === warehouse.activeFloorId) ??
			warehouse.floors[0],
		[warehouse],
	);

	const setActiveFloor = useCallback((id: string) => {
		setWarehouse((w) => ({ ...w, activeFloorId: id }));
		setSelection(null);
	}, []);

	const patchWarehouse = useCallback((patch: Partial<Warehouse>) => {
		setWarehouse((w) => ({ ...w, ...patch, updatedAt: Date.now() }));
	}, []);

	// --- floors ---
	const addFloor = useCallback((partial: Partial<WarehouseFloor> = {}) => {
		setWarehouse((w) => {
			const nextNum =
				Math.max(0, ...w.floors.map((f) => f.floorNumber)) + 1;
			const f = makeFloor({
				floorNumber: nextNum,
				code: `F${nextNum}`,
				name: partial.name ?? `Floor ${nextNum}`,
				elevationMm: nextNum > 1 ? 4_000 * (nextNum - 1) : 0,
				...partial,
			});
			return {
				...w,
				floors: [...w.floors, f],
				activeFloorId: f.id,
				updatedAt: Date.now(),
			};
		});
	}, []);

	const updateFloor = useCallback(
		(id: string, patch: Partial<WarehouseFloor>) => {
			setWarehouse((w) => ({
				...w,
				updatedAt: Date.now(),
				floors: w.floors.map((f) =>
					f.id === id ? { ...f, ...patch } : f,
				),
			}));
		},
		[],
	);

	const removeFloor = useCallback((id: string) => {
		setWarehouse((w) => {
			if (w.floors.length <= 1) {
				return w;
			}
			const floors = w.floors.filter((f) => f.id !== id);
			return {
				...w,
				floors,
				activeFloorId: floors[0].id,
				updatedAt: Date.now(),
			};
		});
	}, []);

	// Add a single storage unit to the active floor
	const addStorageUnit = useCallback((unit: StorageUnit) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			floors: w.floors.map((f) =>
				f.id === w.activeFloorId
					? { ...f, storageUnits: [...f.storageUnits, unit] }
					: f,
			),
		}));
	}, []);

	const addStorageUnitsTo = useCallback(
		(floorId: string, units: StorageUnit[]) => {
			setWarehouse((w) => ({
				...w,
				updatedAt: Date.now(),
				floors: w.floors.map((f) =>
					f.id === floorId
						? { ...f, storageUnits: [...f.storageUnits, ...units] }
						: f,
				),
			}));
		},
		[],
	);

	const updateStorageUnit = useCallback(
		(id: string, patch: Partial<StorageUnit>) => {
			setWarehouse((w) => ({
				...w,
				updatedAt: Date.now(),
				floors: w.floors.map((f) => ({
					...f,
					storageUnits: f.storageUnits.map((u) =>
						u.id === id ? { ...u, ...patch } : u,
					),
				})),
			}));
		},
		[],
	);

	const removeStorageUnit = useCallback((id: string) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			floors: w.floors.map((f) => {
				const toRemove = collectDescendantIds(f.storageUnits, id);
				toRemove.add(id);
				return {
					...f,
					storageUnits: f.storageUnits.filter(
						(u) => !toRemove.has(u.id),
					),
				};
			}),
			handlingUnits: w.handlingUnits.filter(
				(h) => h.currentStorageUnitId !== id,
			),
		}));
		setSelection((s) => (s?.id === id ? null : s));
	}, []);

	const addAsset = useCallback((asset: Asset) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			floors: w.floors.map((f) =>
				f.id === w.activeFloorId
					? { ...f, assets: [...f.assets, asset] }
					: f,
			),
		}));
	}, []);

	const updateAsset = useCallback((id: string, patch: Partial<Asset>) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			floors: w.floors.map((f) => ({
				...f,
				assets: f.assets.map((a) =>
					a.id === id ? { ...a, ...patch } : a,
				),
			})),
		}));
	}, []);

	const removeAsset = useCallback((id: string) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			floors: w.floors.map((f) => ({
				...f,
				assets: f.assets.filter((a) => a.id !== id),
			})),
		}));
		setSelection((s) => (s?.id === id ? null : s));
	}, []);

	const updatePlacement = useCallback(
		(id: string, patch: Partial<StorageUnit> | Partial<Asset>) => {
			setWarehouse((w) => {
				let found = false;
				const floors = w.floors.map((f) => {
					const hasStorage = f.storageUnits.some((u) => u.id === id);
					const hasAsset = f.assets.some((a) => a.id === id);
					if (!hasStorage && !hasAsset) {
						return f;
					}
					found = true;
					return {
						...f,
						storageUnits: hasStorage
							? f.storageUnits.map((u) =>
									u.id === id
										? { ...u, ...patch }
										: u,
								)
							: f.storageUnits,
						assets: hasAsset
							? f.assets.map((a) =>
									a.id === id ? { ...a, ...patch } : a,
								)
							: f.assets,
					};
				});
				return found
					? { ...w, floors, updatedAt: Date.now() }
					: w;
			});
		},
		[],
	);

	// --- zones ---
	const addZone = useCallback((partial: Partial<Zone> = {}) => {
		const z = makeZone(partial);
		setWarehouse((w) => ({
			...w,
			zones: [...w.zones, z],
			updatedAt: Date.now(),
		}));
		return z.id;
	}, []);

	const updateZone = useCallback((id: string, patch: Partial<Zone>) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			zones: w.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
		}));
	}, []);

	const removeZone = useCallback((id: string) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			zones: w.zones.filter((z) => z.id !== id),
			floors: w.floors.map((f) => ({
				...f,
				storageUnits: f.storageUnits.map((u) =>
					u.zoneId === id ? { ...u, zoneId: undefined } : u,
				),
			})),
		}));
	}, []);

	// --- handling units ---
	const addHandlingUnit = useCallback(
		(partial: Partial<HandlingUnit> = {}) => {
			const h = makeHandlingUnit(partial);
			setWarehouse((w) => ({
				...w,
				handlingUnits: [...w.handlingUnits, h],
				updatedAt: Date.now(),
			}));
			return h.id;
		},
		[],
	);

	const updateHandlingUnit = useCallback(
		(id: string, patch: Partial<HandlingUnit>) => {
			setWarehouse((w) => ({
				...w,
				updatedAt: Date.now(),
				handlingUnits: w.handlingUnits.map((h) =>
					h.id === id ? { ...h, ...patch } : h,
				),
			}));
		},
		[],
	);

	const removeHandlingUnit = useCallback((id: string) => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			handlingUnits: w.handlingUnits.filter((h) => h.id !== id),
		}));
		setSelection((s) => (s?.id === id ? null : s));
	}, []);

	// --- rack helpers ---
	const generateShelvesForRack = useCallback(
		(rackId: string, levels: number, shelfHeightMm: number) => {
			setWarehouse((w) => {
				return {
					...w,
					updatedAt: Date.now(),
					floors: w.floors.map((f) => {
						const rack = f.storageUnits.find(
							(u) => u.id === rackId,
						);
						if (!rack || rack.type !== "RACK") {
							return f;
						}
						const descendantIds = collectDescendantIds(
							f.storageUnits,
							rackId,
						);
						const others = f.storageUnits.filter(
							(u) => !descendantIds.has(u.id),
						);
						const levelCount = Math.max(1, Math.min(12, levels));
						const shelfHeight = Math.max(100, shelfHeightMm);
						const newShelves: StorageUnit[] = [];
						for (let i = 0; i < levelCount; i++) {
							newShelves.push(
								makeStorageUnit("SHELF", {
									code: `${rack.code}-L${i + 1}`,
									name: `Level ${i + 1}`,
									parentStorageUnitId: rackId,
									zoneId: rack.zoneId,
									startXMm: rack.startXMm,
									startYMm: rack.startYMm,
									startZMm: rack.startZMm + i * shelfHeight,
									widthMm: rack.widthMm,
									lengthMm: rack.lengthMm,
									heightMm: 50,
									levelIndex: i + 1,
									sequence: i + 1,
								}),
							);
						}
						const updatedRack: StorageUnit = {
							...rack,
							metadata: {
								...rack.metadata,
								layout: {
									...(typeof rack.metadata?.layout ===
									"object"
										? (rack.metadata.layout as Record<
												string,
												unknown
											>)
										: {}),
									levelCount,
									shelfHeightMm: shelfHeight,
								},
							},
						};
						return {
							...f,
							storageUnits: [
								...others.map((u) =>
									u.id === rackId ? updatedRack : u,
								),
								...newShelves,
							],
						};
					}),
				};
			});
		},
		[],
	);

	const generateBinsForShelf = useCallback(
		(shelfId: string, cols: number, rows: number) => {
			setWarehouse((w) => ({
				...w,
				updatedAt: Date.now(),
				floors: w.floors.map((f) => {
					const shelf = f.storageUnits.find((u) => u.id === shelfId);
					if (!shelf || shelf.type !== "SHELF") {
						return f;
					}
					const others = f.storageUnits.filter(
						(u) =>
							u.parentStorageUnitId !== shelfId ||
							!SLOT_CHILD_TYPES.has(u.type),
					);
					const bins = generateGridChildren(shelf, {
						cols,
						rows,
						childType: "BIN",
					});
					return {
						...f,
						storageUnits: [...others, ...bins],
					};
				}),
			}));
		},
		[],
	);

	const generateBinsForRack = useCallback(
		(rackId: string, cols: number, rows: number) => {
			setWarehouse((w) => {
				const active = w.floors.find((f) => f.id === w.activeFloorId);
				if (!active) {
					return w;
				}
				const rack = active.storageUnits.find((u) => u.id === rackId);
				if (!rack || rack.type !== "RACK") {
					return w;
				}
				const shelves = active.storageUnits.filter(
					(u) =>
						u.parentStorageUnitId === rackId && u.type === "SHELF",
				);
				if (shelves.length === 0) {
					return w;
				}
				let nextUnits = active.storageUnits;
				for (const shelf of shelves) {
					nextUnits = nextUnits.filter(
						(u) =>
							u.parentStorageUnitId !== shelf.id ||
							!SLOT_CHILD_TYPES.has(u.type),
					);
					nextUnits = [
						...nextUnits,
						...generateGridChildren(shelf, {
							cols,
							rows,
							childType: "BIN",
						}),
					];
				}
				const updatedRack: StorageUnit = {
					...rack,
					metadata: {
						...rack.metadata,
						layout: {
							...(typeof rack.metadata?.layout === "object"
								? (rack.metadata.layout as Record<
										string,
										unknown
									>)
								: {}),
							binsPerShelf: {
								cols: Math.max(1, cols),
								rows: Math.max(1, rows),
							},
						},
					},
				};
				return {
					...w,
					updatedAt: Date.now(),
					floors: w.floors.map((f) =>
						f.id === w.activeFloorId
							? {
									...f,
									storageUnits: nextUnits.map((u) =>
										u.id === rackId ? updatedRack : u,
									),
								}
							: f,
					),
				};
			});
		},
		[],
	);

	const generatePalletGridForArea = useCallback(
		(areaId: string, cols: number, rows: number) => {
			setWarehouse((w) => ({
				...w,
				updatedAt: Date.now(),
				floors: w.floors.map((f) => {
					const area = f.storageUnits.find((u) => u.id === areaId);
					if (!area || area.type !== "FLOOR") {
						return f;
					}
					const others = f.storageUnits.filter(
						(u) =>
							u.parentStorageUnitId !== areaId ||
							u.type !== "PALLET",
					);
					const slots = generateGridChildren(area, {
						cols,
						rows,
						childType: "PALLET",
					});
					const updatedArea: StorageUnit = {
						...area,
						metadata: {
							...area.metadata,
							layout: {
								...(typeof area.metadata?.layout === "object"
									? (area.metadata.layout as Record<
											string,
											unknown
										>)
									: {}),
								palletGrid: {
									cols: Math.max(1, cols),
									rows: Math.max(1, rows),
								},
							},
						},
					};
					return {
						...f,
						storageUnits: [
							...others.map((u) =>
								u.id === areaId ? updatedArea : u,
							),
							...slots,
						],
					};
				}),
			}));
		},
		[],
	);

	const reset = useCallback(() => {
		const fresh = defaultWarehouse();
		setWarehouse(fresh);
		setSelection(null);
	}, []);

	const clearActiveFloor = useCallback(() => {
		setWarehouse((w) => ({
			...w,
			updatedAt: Date.now(),
			floors: w.floors.map((f) =>
				f.id === w.activeFloorId ? { ...f, storageUnits: [] } : f,
			),
		}));
		setSelection(null);
	}, []);

	return {
		warehouse,
		activeFloor,
		selection,
		setSelection,
		setActiveFloor,
		patchWarehouse,
		addFloor,
		updateFloor,
		removeFloor,
		addStorageUnit,
		addStorageUnitsTo,
		updateStorageUnit,
		removeStorageUnit,
		addAsset,
		updateAsset,
		removeAsset,
		updatePlacement,
		addZone,
		updateZone,
		removeZone,
		addHandlingUnit,
		updateHandlingUnit,
		removeHandlingUnit,
		generateShelvesForRack,
		generateBinsForShelf,
		generateBinsForRack,
		generatePalletGridForArea,
		reset,
		clearActiveFloor,
		initFromWarehouse,
	};
}

export { uid };

// ---------- bounding box (across all floors) ----------

export interface BBox {
	minXMm: number;
	minYMm: number;
	minZMm: number;
	maxXMm: number;
	maxYMm: number;
	maxZMm: number;
}

export function computeBoundingBox(warehouse: Warehouse): BBox {
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	const minZ = 0;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;
	let maxZ = 0;
	let any = false;
	for (const f of warehouse.floors) {
		for (const u of f.storageUnits) {
			any = true;
			const x = f.originXMm + u.startXMm;
			const y = f.originYMm + u.startYMm;
			const z = f.elevationMm + u.startZMm;
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + u.widthMm);
			maxY = Math.max(maxY, y + u.lengthMm);
			maxZ = Math.max(maxZ, z + u.heightMm);
		}
		// include floor slab footprint if it has dims
		if (f.widthMm && f.lengthMm) {
			any = true;
			minX = Math.min(minX, f.originXMm);
			minY = Math.min(minY, f.originYMm);
			maxX = Math.max(maxX, f.originXMm + f.widthMm);
			maxY = Math.max(maxY, f.originYMm + f.lengthMm);
			maxZ = Math.max(maxZ, f.elevationMm + (f.heightMm ?? 100));
		}
	}
	if (!any) {
		return {
			minXMm: 0,
			minYMm: 0,
			minZMm: 0,
			maxXMm: 10_000,
			maxYMm: 10_000,
			maxZMm: 3_000,
		};
	}
	return {
		minXMm: minX,
		minYMm: minY,
		minZMm: minZ,
		maxXMm: maxX,
		maxYMm: maxY,
		maxZMm: Math.max(maxZ, 500),
	};
}
