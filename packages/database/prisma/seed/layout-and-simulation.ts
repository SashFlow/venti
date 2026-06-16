import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { ensureAutopilotRules } from "../../services/autopilot-service";
import { db } from "../client";
import { CONFIG, getHistoricalSimulationDates } from "./config";
import { seedDemoSnapshot } from "./demo-snapshot";

/** Prisma interactive-transaction client (subset of the full client). */
type DbTx = Omit<
	typeof db,
	"$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

const NUM_CUSTOMERS = CONFIG.NUM_CUSTOMERS;
const NUM_SUPPLIERS = CONFIG.NUM_SUPPLIERS;
const FLUSH_TX_THRESHOLD = CONFIG.FLUSH_TX_THRESHOLD;
const ORG_NAME = CONFIG.ORG_NAME;

type InboundScenario = "RECEIVED" | "PARTIAL" | "OPEN";
type OutboundScenario = "SHIPPED" | "ALLOCATED" | "PICKING" | "SKIP";
type ReturnLifecycle = "COMPLETED" | "INSPECTING" | "RECEIVED";
type TaskRunStatus = "COMPLETED" | "PENDING" | "ASSIGNED";

function pickInboundScenario(): InboundScenario {
	const roll = faker.number.int({ min: 1, max: 100 });
	if (roll <= 70) return "RECEIVED";
	if (roll <= 90) return "PARTIAL";
	return "OPEN";
}

function pickOutboundScenario(): OutboundScenario {
	const roll = faker.number.int({ min: 1, max: 100 });
	if (roll <= 60) return "SHIPPED";
	if (roll <= 85) return "ALLOCATED";
	if (roll <= 95) return "PICKING";
	return "SKIP";
}

function pickReturnLifecycle(): ReturnLifecycle {
	const roll = faker.number.int({ min: 1, max: 100 });
	if (roll <= 50) return "COMPLETED";
	if (roll <= 80) return "INSPECTING";
	return "RECEIVED";
}

function pickTaskStatus(): TaskRunStatus {
	const roll = faker.number.int({ min: 1, max: 100 });
	if (roll <= 70) return "COMPLETED";
	if (roll <= 90) return "PENDING";
	return "ASSIGNED";
}

function pickStorageBin(
	layout: WarehouseLayout,
	preferred?: string,
): string {
	if (preferred && layout.bins.includes(preferred)) {
		return preferred;
	}
	return faker.helpers.arrayElement([...layout.bins, ...layout.pallets]);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SkuWithProduct = Awaited<
	ReturnType<
		typeof db.sKU.findMany<{ include: { product: true } }>
	>
>[number];

type WarehouseLayout = {
	inbound: string[];
	outbound: string[];
	bins: string[];
	pallets: string[];
	blocks: string[];
	dockDoors: string[];
};

type BalanceEntry = {
	warehouseId: string;
	locationId: string;
	skuId: string;
	lotId: string | null;
	state: "AVAILABLE";
	quantityAvailable: number;
};

type SerialEntry = {
	id: string;
	skuId: string;
	serialNumber: string;
	locationId: string;
	status: "AVAILABLE" | "OUTBOUND";
};

type BalanceDelta = {
	warehouseId: string;
	locationId: string;
	skuId: string;
	lotId: string | null;
	qty: number;
	current: Date;
};

type PendingReturn = {
	executeAt: Date;
	warehouseId: string;
	customerId: string;
	salesOrderId: string;
	skuId: string;
	quantity: number;
	lotId: string | null;
	disposition: "RESTOCK" | "SCRAP" | "REFURBISH" | "RETURN_TO_VENDOR";
	serialIds: string[];
};

type LocationQty = {
	locId: string;
	lotId: string | null;
	qty: number;
};

// ---------------------------------------------------------------------------
// Inventory helpers
// ---------------------------------------------------------------------------

/** Stable cache/DB key; empty string represents a null lotId. */
function balanceKey(
	locationId: string,
	skuId: string,
	lotId: string | null,
): string {
	return `${locationId}:${skuId}:${lotId ?? ""}`;
}

class WarehouseInventory {
	readonly warehouseId: string;
	private balances = new Map<string, BalanceEntry>();
	private serials = new Map<string, SerialEntry>();

	constructor(warehouseId: string) {
		this.warehouseId = warehouseId;
	}

	getBalance(
		locationId: string,
		skuId: string,
		lotId: string | null,
	): BalanceEntry | undefined {
		return this.balances.get(balanceKey(locationId, skuId, lotId));
	}

	getSkuTotals(): Record<string, number> {
		const totals: Record<string, number> = {};
		for (const bal of this.balances.values()) {
			if (bal.state === "AVAILABLE" && bal.quantityAvailable > 0) {
				totals[bal.skuId] =
					(totals[bal.skuId] ?? 0) + bal.quantityAvailable;
			}
		}
		return totals;
	}

	getSkuLocations(skuId: string): LocationQty[] {
		const locs: LocationQty[] = [];
		for (const bal of this.balances.values()) {
			if (
				bal.skuId === skuId &&
				bal.state === "AVAILABLE" &&
				bal.quantityAvailable > 0
			) {
				locs.push({
					locId: bal.locationId,
					lotId: bal.lotId,
					qty: bal.quantityAvailable,
				});
			}
		}
		return locs;
	}

	addQuantity(
		locationId: string,
		skuId: string,
		lotId: string | null,
		qty: number,
	): void {
		if (qty <= 0) return;
		const key = balanceKey(locationId, skuId, lotId);
		const existing = this.balances.get(key);
		if (existing) {
			existing.quantityAvailable += qty;
		} else {
			this.balances.set(key, {
				warehouseId: this.warehouseId,
				locationId,
				skuId,
				lotId,
				state: "AVAILABLE",
				quantityAvailable: qty,
			});
		}
	}

	removeQuantity(
		locationId: string,
		skuId: string,
		lotId: string | null,
		qty: number,
	): boolean {
		if (qty <= 0) return false;
		const key = balanceKey(locationId, skuId, lotId);
		const bal = this.balances.get(key);
		if (!bal || bal.quantityAvailable < qty) return false;
		bal.quantityAvailable -= qty;
		if (bal.quantityAvailable === 0) {
			this.balances.delete(key);
		}
		return true;
	}

	registerSerial(
		id: string,
		skuId: string,
		serialNumber: string,
		locationId: string,
	): void {
		this.serials.set(id, {
			id,
			skuId,
			serialNumber,
			locationId,
			status: "AVAILABLE",
		});
	}

	consumeSerials(
		skuId: string,
		locationId: string,
		count: number,
	): string[] {
		const consumed: string[] = [];
		for (const [id, serial] of this.serials) {
			if (consumed.length >= count) break;
			if (
				serial.skuId === skuId &&
				serial.locationId === locationId &&
				serial.status === "AVAILABLE"
			) {
				serial.status = "OUTBOUND";
				serial.locationId = "";
				consumed.push(id);
			}
		}
		return consumed;
	}

	restockSerials(serialIds: string[], locationId: string): void {
		for (const id of serialIds) {
			const serial = this.serials.get(id);
			if (!serial) continue;
			serial.status = "AVAILABLE";
			serial.locationId = locationId;
		}
	}

	moveSerials(
		skuId: string,
		fromLocationId: string,
		toLocationId: string,
		count: number,
	): string[] {
		const moved: string[] = [];
		for (const [id, serial] of this.serials) {
			if (moved.length >= count) break;
			if (
				serial.skuId === skuId &&
				serial.locationId === fromLocationId &&
				serial.status === "AVAILABLE"
			) {
				serial.locationId = toLocationId;
				moved.push(id);
			}
		}
		return moved;
	}

	getSerial(id: string): SerialEntry | undefined {
		return this.serials.get(id);
	}

	assertNonNegative(): void {
		for (const bal of this.balances.values()) {
			if (bal.quantityAvailable < 0) {
				throw new Error(
					`Negative balance: WH ${this.warehouseId} SKU ${bal.skuId} @ ${bal.locationId} = ${bal.quantityAvailable}`,
				);
			}
		}
	}

	allBalances(): BalanceEntry[] {
		return [...this.balances.values()];
	}
}

// ---------------------------------------------------------------------------
// Simulation buffers
// ---------------------------------------------------------------------------

class SimulationBuffers {
	po: any[] = [];
	asn: any[] = [];
	receiving: any[] = [];
	poItems: any[] = [];
	asnItems: any[] = [];
	lots: any[] = [];
	serials: any[] = [];
	tx: any[] = [];
	so: any[] = [];
	soItems: any[] = [];
	shipments: any[] = [];
	tasks: any[] = [];
	returnOrders: any[] = [];
	returnItems: any[] = [];
	returnInspections: any[] = [];
	balanceDeltas = new Map<string, BalanceDelta>();
	/** Serial records whose location/status changed since last flush. */
	dirtySerialIds = new Set<string>();

	trackBalanceDelta(
		warehouseId: string,
		locationId: string,
		skuId: string,
		lotId: string | null,
		qty: number,
		current: Date,
	): void {
		const key = balanceKey(locationId, skuId, lotId);
		const existing = this.balanceDeltas.get(key);
		if (existing) {
			existing.qty += qty;
		} else {
			this.balanceDeltas.set(key, {
				warehouseId,
				locationId,
				skuId,
				lotId,
				qty,
				current,
			});
		}
	}

	maybeFlush(prisma: DbTx, force = false): Promise<void> {
		if (force || this.tx.length >= FLUSH_TX_THRESHOLD) {
			return this.flush(prisma);
		}
		return Promise.resolve();
	}

	async flush(prisma: DbTx): Promise<void> {
		if (this.po.length) {
			await prisma.purchaseOrder.createMany({ data: this.po });
			this.po = [];
		}
		if (this.asn.length) {
			await prisma.advancedShippingNotice.createMany({ data: this.asn });
			this.asn = [];
		}
		if (this.receiving.length) {
			await prisma.receivingOrder.createMany({ data: this.receiving });
			this.receiving = [];
		}
		if (this.poItems.length) {
			await prisma.purchaseOrderItem.createMany({ data: this.poItems });
			this.poItems = [];
		}
		if (this.asnItems.length) {
			await prisma.aSNItem.createMany({ data: this.asnItems });
			this.asnItems = [];
		}
		if (this.lots.length) {
			await prisma.inventoryLot.createMany({ data: this.lots });
			this.lots = [];
		}
		if (this.serials.length) {
			await prisma.inventorySerial.createMany({ data: this.serials });
			this.serials = [];
		}
		if (this.tx.length) {
			await prisma.inventoryTransaction.createMany({ data: this.tx });
			this.tx = [];
		}
		if (this.so.length) {
			await prisma.salesOrder.createMany({ data: this.so });
			this.so = [];
		}
		if (this.soItems.length) {
			await prisma.salesOrderItem.createMany({ data: this.soItems });
			this.soItems = [];
		}
		if (this.shipments.length) {
			await prisma.shipment.createMany({ data: this.shipments });
			this.shipments = [];
		}
		if (this.returnOrders.length) {
			await prisma.returnOrder.createMany({ data: this.returnOrders });
			this.returnOrders = [];
		}
		if (this.returnItems.length) {
			await prisma.returnOrderItem.createMany({ data: this.returnItems });
			this.returnItems = [];
		}
		if (this.returnInspections.length) {
			await prisma.returnInspection.createMany({
				data: this.returnInspections,
			});
			this.returnInspections = [];
		}
		if (this.tasks.length) {
			await prisma.warehouseTask.createMany({ data: this.tasks });
			this.tasks = [];
		}

		const deltas = [...this.balanceDeltas.values()].filter((d) => d.qty !== 0);
		if (deltas.length) {
			for (const d of deltas) {
				await applyBalanceDelta(prisma, d);
			}
			this.balanceDeltas.clear();
		}
	}

	async flushSerialUpdates(
		prisma: DbTx,
		inventories: Map<string, WarehouseInventory>,
	): Promise<void> {
		if (!this.dirtySerialIds.size) return;
		const ids = [...this.dirtySerialIds];
		this.dirtySerialIds.clear();
		for (const id of ids) {
			for (const inv of inventories.values()) {
				const serial = inv.getSerial(id);
				if (!serial) continue;
				await prisma.inventorySerial.update({
					where: { id },
					data: {
						locationId:
							serial.status === "AVAILABLE"
								? serial.locationId
								: null,
						status: serial.status,
					},
				});
				break;
			}
		}
	}

	markSerialsDirty(ids: string[]): void {
		for (const id of ids) this.dirtySerialIds.add(id);
	}
}

/** Apply a net quantity change to one balance row (handles nullable lotId). */
async function applyBalanceDelta(
	prisma: DbTx,
	d: BalanceDelta,
): Promise<void> {
	if (d.lotId) {
		await prisma.inventoryBalance.upsert({
			where: {
				locationId_skuId_lotId_state: {
					locationId: d.locationId,
					skuId: d.skuId,
					lotId: d.lotId,
					state: "AVAILABLE",
				},
			},
			update: {
				quantityAvailable: { increment: d.qty },
				updatedAt: d.current,
			},
			create: {
				warehouseId: d.warehouseId,
				locationId: d.locationId,
				skuId: d.skuId,
				lotId: d.lotId,
				state: "AVAILABLE",
				quantityAvailable: Math.max(0, d.qty),
				updatedAt: d.current,
			},
		});
		return;
	}

	const existing = await prisma.inventoryBalance.findFirst({
		where: {
			locationId: d.locationId,
			skuId: d.skuId,
			lotId: null,
			state: "AVAILABLE",
		},
	});

	if (existing) {
		await prisma.inventoryBalance.update({
			where: { id: existing.id },
			data: {
				quantityAvailable: { increment: d.qty },
				updatedAt: d.current,
			},
		});
	} else if (d.qty > 0) {
		await prisma.inventoryBalance.create({
			data: {
				warehouseId: d.warehouseId,
				locationId: d.locationId,
				skuId: d.skuId,
				lotId: null,
				state: "AVAILABLE",
				quantityAvailable: d.qty,
				updatedAt: d.current,
			},
		});
	}
}

// ---------------------------------------------------------------------------
// Layout generation
// ---------------------------------------------------------------------------

async function buildWarehouseLayouts(
	warehouses: { id: string; name: string; code: string }[],
): Promise<Map<string, WarehouseLayout>> {
	const locationCache = new Map<string, WarehouseLayout>();

	for (const wh of warehouses) {
		console.log(`Building layout for ${wh.name}...`);
		const layout: WarehouseLayout = {
			inbound: [],
			outbound: [],
			bins: [],
			pallets: [],
			blocks: [],
			dockDoors: [],
		};

		for (let floorNum = 1; floorNum <= 2; floorNum++) {
			const floor = await db.location.create({
				data: {
					warehouseId: wh.id,
					code: `FL-${floorNum}-${wh.code}`,
					name: `Floor ${floorNum}`,
					type: "FLOOR",
					isPickable: false,
					isReceivable: false,
					isReservable: false,
					width: 100,
					height: 10,
					depth: 100,
					x: 0,
					y: floorNum === 1 ? 0 : 10,
					z: 0,
					colorHex: "#cccccc",
				},
			});

			if (floorNum === 1) {
				await db.asset.create({
					data: {
						warehouseId: wh.id,
						locationId: floor.id,
						name: "Main Stairs",
						type: "STAIRS",
						x: 50,
						y: 0,
						z: 50,
						width: 2,
						height: 10,
						depth: 4,
						colorHex: "#333333",
					},
				});
			}

			await db.asset.create({
				data: {
					warehouseId: wh.id,
					locationId: floor.id,
					name: `North Wall F${floorNum}`,
					type: "WALL",
					x: 0,
					y: floorNum === 1 ? 0 : 10,
					z: 0,
					width: 100,
					height: 10,
					depth: 1,
					colorHex: "#444444",
				},
			});

			if (floorNum === 1) {
				const inboundZone = await db.location.create({
					data: {
						warehouseId: wh.id,
						parentLocationId: floor.id,
						code: `Z-IN-${wh.code}`,
						name: "Inbound Staging",
						type: "ZONE",
						isReceivable: true,
						isPickable: false,
						x: 5,
						y: 0,
						z: 5,
						width: 20,
						height: 0,
						depth: 20,
						colorHex: "#00ff00",
					},
				});
				layout.inbound.push(inboundZone.id);

				const outboundZone = await db.location.create({
					data: {
						warehouseId: wh.id,
						parentLocationId: floor.id,
						code: `Z-OUT-${wh.code}`,
						name: "Outbound Staging",
						type: "ZONE",
						isReceivable: false,
						isPickable: true,
						x: 75,
						y: 0,
						z: 5,
						width: 20,
						height: 0,
						depth: 20,
						colorHex: "#ff0000",
					},
				});
				layout.outbound.push(outboundZone.id);

				await db.location.create({
					data: {
						warehouseId: wh.id,
						parentLocationId: floor.id,
						code: `Z-QC-${wh.code}`,
						name: "Quality Control",
						type: "ZONE",
						isQuarantine: true,
						isPickable: false,
						x: 40,
						y: 0,
						z: 5,
						width: 15,
						height: 0,
						depth: 10,
						colorHex: "#ffff00",
					},
				});

				for (let d = 1; d <= 3; d++) {
					const dock = await db.asset.create({
						data: {
							warehouseId: wh.id,
							locationId: floor.id,
							name: `Dock Door ${d}`,
							type: "DOCK_DOOR",
							x: d * 10,
							y: 0,
							z: 0,
							width: 3,
							height: 4,
							depth: 0.5,
							colorHex: "#0000ff",
						},
					});
					layout.dockDoors.push(dock.id);
				}
			}

			const storageZone = await db.location.create({
				data: {
					warehouseId: wh.id,
					parentLocationId: floor.id,
					code: `Z-STR-${floorNum}-${wh.code}`,
					name: `Storage F${floorNum}`,
					type: "ZONE",
					isReceivable: false,
					isPickable: true,
					x: 10,
					y: floorNum === 1 ? 0 : 10,
					z: 30,
					width: 80,
					height: 0,
					depth: 60,
					colorHex: "#0000ff",
				},
			});

			for (let b = 1; b <= 2; b++) {
				const block = await db.location.create({
					data: {
						warehouseId: wh.id,
						parentLocationId: storageZone.id,
						code: `BLK-${floorNum}-${b}-${wh.code}`,
						name: `Block ${b}`,
						type: "BLOCK",
						isPickable: true,
						isReceivable: true,
						x: 15 + b * 10,
						y: floorNum === 1 ? 0 : 10,
						z: 40,
						width: 5,
						height: 0,
						depth: 10,
						colorHex: "#888888",
					},
				});
				layout.blocks.push(block.id);
			}

			for (let a = 1; a <= 2; a++) {
				await db.asset.create({
					data: {
						warehouseId: wh.id,
						locationId: storageZone.id,
						name: `Aisle ${a}`,
						type: "AISLE",
						x: 40 + a * 15,
						y: floorNum === 1 ? 0 : 10,
						z: 35,
						width: 2,
						height: 0,
						depth: 50,
						colorHex: "#dddddd",
					},
				});

				const rack = await db.location.create({
					data: {
						warehouseId: wh.id,
						parentLocationId: storageZone.id,
						code: `RCK-${floorNum}-${a}-${wh.code}`,
						name: `Rack ${a}`,
						type: "RACK",
						isPickable: false,
						isReceivable: false,
						x: 42 + a * 15,
						y: floorNum === 1 ? 0 : 10,
						z: 35,
						width: 1,
						height: 3,
						depth: 50,
						colorHex: "#994400",
					},
				});

				for (let lvl = 1; lvl <= 3; lvl++) {
					const shelf = await db.location.create({
						data: {
							warehouseId: wh.id,
							parentLocationId: rack.id,
							code: `SHF-${floorNum}-${a}-L${lvl}-${wh.code}`,
							name: `Shelf L${lvl}`,
							type: "SHELF",
							sequence: lvl,
							x: 42 + a * 15,
							y: (floorNum === 1 ? 0 : 10) + (lvl - 1),
							z: 35,
							width: 1,
							height: 0.1,
							depth: 50,
							colorHex: "#aaaaaa",
						},
					});

					for (let pos = 1; pos <= 5; pos++) {
						if (lvl === 1) {
							const palletLoc = await db.location.create({
								data: {
									warehouseId: wh.id,
									parentLocationId: shelf.id,
									code: `PAL-${floorNum}-${a}-L${lvl}-P${pos}-${wh.code}`,
									type: "PALLET",
									barcode: `P${floorNum}${a}${lvl}${pos}${wh.code.replace("-", "")}`,
									isPickable: true,
									isReceivable: true,
									capacityWeight: 1000,
									x: 42 + a * 15,
									y: (floorNum === 1 ? 0 : 10) + (lvl - 1),
									z: 35 + pos * 2,
									width: 1,
									height: 1,
									depth: 1,
								},
							});
							layout.pallets.push(palletLoc.id);
						} else {
							const binLoc = await db.location.create({
								data: {
									warehouseId: wh.id,
									parentLocationId: shelf.id,
									code: `BIN-${floorNum}-${a}-L${lvl}-P${pos}-${wh.code}`,
									type: "BIN",
									barcode: `B${floorNum}${a}${lvl}${pos}${wh.code.replace("-", "")}`,
									isPickable: true,
									isReceivable: true,
									capacityVolume: 100,
									x: 42 + a * 15,
									y: (floorNum === 1 ? 0 : 10) + (lvl - 1),
									z: 35 + pos * 2,
									width: 1,
									height: 0.5,
									depth: 1,
								},
							});
							layout.bins.push(binLoc.id);
						}
					}
				}
			}
		}

		locationCache.set(wh.id, layout);
	}

	return locationCache;
}

function pickStorageLocation(
	layout: WarehouseLayout,
	sku: SkuWithProduct,
): string {
	if (sku.product.isSerialTracked) {
		return faker.helpers.arrayElement([...layout.bins, ...layout.pallets]);
	}
	if (sku.product.isBatchTracked) {
		return faker.helpers.arrayElement([
			...layout.bins,
			...layout.pallets,
			...layout.blocks,
		]);
	}
	return faker.helpers.arrayElement([
		...layout.bins,
		...layout.pallets,
		...layout.blocks,
	]);
}

function receiveQuantity(sku: SkuWithProduct): number {
	if (sku.product.isSerialTracked) {
		return faker.number.int({ min: 1, max: 5 });
	}
	return faker.number.int({ min: 20, max: 100 });
}

// ---------------------------------------------------------------------------
// Simulation steps
// ---------------------------------------------------------------------------

async function simulateInboundReceipt(
	whId: string,
	layout: WarehouseLayout,
	supplierIds: string[],
	skus: SkuWithProduct[],
	inventory: WarehouseInventory,
	buffers: SimulationBuffers,
	current: Date,
): Promise<void> {
	const scenario = pickInboundScenario();
	const supplierId = faker.helpers.arrayElement(supplierIds);
	const poId = createId();
	const asnId = createId();
	const recId = createId();
	const inboundLoc = layout.inbound[0];

	const poStatus =
		scenario === "OPEN"
			? faker.helpers.arrayElement(["APPROVED", "IN_TRANSIT"] as const)
			: scenario === "PARTIAL"
				? "PARTIAL"
				: "RECEIVED";

	buffers.po.push({
		id: poId,
		warehouseId: whId,
		supplierId,
		poNumber: `PO-${faker.string.alphanumeric(8).toUpperCase()}`,
		status: poStatus,
		expectedAt: faker.date.soon({ refDate: current, days: 5 }),
		createdAt: current,
	});

	if (scenario !== "OPEN") {
		buffers.asn.push({
			id: asnId,
			warehouseId: whId,
			supplierId,
			purchaseOrderId: poId,
			asnNumber: `ASN-${faker.string.alphanumeric(8).toUpperCase()}`,
			status: scenario === "RECEIVED" ? "COMPLETED" : "RECEIVING",
			expectedArrival: current,
			pallets: faker.number.int({ min: 1, max: 5 }),
			cartons: faker.number.int({ min: 10, max: 50 }),
			createdAt: current,
		});
		buffers.receiving.push({
			id: recId,
			warehouseId: whId,
			purchaseOrderId: poId,
			asnId,
			status: scenario === "RECEIVED" ? "COMPLETED" : "RECEIVING",
			receivedAt: scenario === "RECEIVED" ? current : null,
			createdAt: current,
		});
	} else {
		buffers.asn.push({
			id: asnId,
			warehouseId: whId,
			supplierId,
			purchaseOrderId: poId,
			asnNumber: `ASN-${faker.string.alphanumeric(8).toUpperCase()}`,
			status: "IN_TRANSIT",
			expectedArrival: faker.date.soon({ refDate: current, days: 3 }),
			pallets: faker.number.int({ min: 1, max: 3 }),
			cartons: faker.number.int({ min: 5, max: 20 }),
			createdAt: current,
		});
	}

	const numLines = faker.number.int({ min: 2, max: 5 });
	for (let l = 0; l < numLines; l++) {
		const sku = faker.helpers.arrayElement(skus);
		const qty = receiveQuantity(sku);
		const receiveRatio =
			scenario === "OPEN"
				? 0
				: scenario === "PARTIAL"
					? faker.number.float({ min: 0.3, max: 0.7 })
					: 1;
		const receivedQty =
			receiveRatio === 0 ? 0 : Math.max(1, Math.floor(qty * receiveRatio));

		if (receivedQty <= 0) {
			buffers.poItems.push({
				id: createId(),
				purchaseOrderId: poId,
				skuId: sku.id,
				orderedQty: qty,
				receivedQty: 0,
				unitPrice: sku.unitPrice,
			});
			buffers.asnItems.push({
				id: createId(),
				asnId,
				skuId: sku.id,
				expectedQty: qty,
				receivedQty: 0,
			});
			continue;
		}

		const storageLoc = pickStorageLocation(layout, sku);
		let lotId: string | null = null;
		let lotNumber: string | undefined;

		if (sku.product.isBatchTracked) {
			lotId = createId();
			lotNumber = `BATCH-${faker.string.alphanumeric(6).toUpperCase()}`;
			buffers.lots.push({
				id: lotId,
				skuId: sku.id,
				lotNumber,
				manufactureDate: current,
				expiryDate: faker.date.soon({ refDate: current, days: 365 }),
				qcStatus: "PASSED",
			});
		}

		buffers.poItems.push({
			id: createId(),
			purchaseOrderId: poId,
			skuId: sku.id,
			orderedQty: qty,
			receivedQty: receivedQty,
			unitPrice: sku.unitPrice,
		});
		buffers.asnItems.push({
			id: createId(),
			asnId,
			skuId: sku.id,
			expectedQty: qty,
			receivedQty: receivedQty,
			lotNumber,
		});

		if (sku.product.isSerialTracked) {
			for (let u = 0; u < receivedQty; u++) {
				const serialId = createId();
				const serialNumber = `SN-${faker.string.alphanumeric(10).toUpperCase()}`;
				buffers.serials.push({
					id: serialId,
					skuId: sku.id,
					serialNumber,
					locationId: storageLoc,
					status: "AVAILABLE",
				});
				inventory.registerSerial(
					serialId,
					sku.id,
					serialNumber,
					storageLoc,
				);
				inventory.addQuantity(storageLoc, sku.id, null, 1);
				buffers.trackBalanceDelta(
					whId,
					storageLoc,
					sku.id,
					null,
					1,
					current,
				);
				buffers.tx.push(
					{
						id: createId(),
						warehouseId: whId,
						skuId: sku.id,
						lotId: null,
						fromLocationId: null,
						toLocationId: inboundLoc,
						quantity: 1,
						transactionType: "RECEIVE",
						createdAt: current,
					},
					{
						id: createId(),
						warehouseId: whId,
						skuId: sku.id,
						lotId: null,
						fromLocationId: inboundLoc,
						toLocationId: storageLoc,
						quantity: 1,
						transactionType: "PUTAWAY",
						createdAt: current,
					},
				);
			}
		} else {
			inventory.addQuantity(storageLoc, sku.id, lotId, receivedQty);
			buffers.trackBalanceDelta(
				whId,
				storageLoc,
				sku.id,
				lotId,
				receivedQty,
				current,
			);
			buffers.tx.push(
				{
					id: createId(),
					warehouseId: whId,
					skuId: sku.id,
					lotId,
					fromLocationId: null,
					toLocationId: inboundLoc,
					quantity: receivedQty,
					transactionType: "RECEIVE",
					createdAt: current,
				},
				{
					id: createId(),
					warehouseId: whId,
					skuId: sku.id,
					lotId,
					fromLocationId: inboundLoc,
					toLocationId: storageLoc,
					quantity: receivedQty,
					transactionType: "PUTAWAY",
					createdAt: current,
				},
			);
		}
	}
}

type ShippedLine = {
	skuId: string;
	quantity: number;
	lotId: string | null;
	serialIds: string[];
};

async function simulateOutboundOrder(
	whId: string,
	layout: WarehouseLayout,
	customerIds: string[],
	skuMap: Map<string, SkuWithProduct>,
	inventory: WarehouseInventory,
	buffers: SimulationBuffers,
	pendingReturns: PendingReturn[],
	current: Date,
	simulationEnd: Date,
): Promise<void> {
	const scenario = pickOutboundScenario();
	if (scenario === "SKIP") return;

	const skuTotals = inventory.getSkuTotals();
	const availableSkus = Object.keys(skuTotals).filter((id) => {
		const sku = skuMap.get(id);
		const minStock = sku?.product.isSerialTracked ? 1 : 10;
		return skuTotals[id] >= minStock;
	});
	if (availableSkus.length === 0) return;

	const customerId = faker.helpers.arrayElement(customerIds);
	const soId = createId();
	const dockDoorId =
		layout.dockDoors.length > 0
			? faker.helpers.arrayElement(layout.dockDoors)
			: null;

	const soStatus =
		scenario === "ALLOCATED"
			? "ALLOCATED"
			: scenario === "PICKING"
				? "PICKING"
				: "SHIPPED";

	buffers.so.push({
		id: soId,
		warehouseId: whId,
		customerId,
		orderNumber: `SO-${faker.string.alphanumeric(8).toUpperCase()}`,
		status: soStatus,
		orderedAt: current,
	});

	if (scenario === "SHIPPED") {
		buffers.shipments.push({
			id: createId(),
			warehouseId: whId,
			salesOrderId: soId,
			shipmentNumber: `SHIP-${faker.string.alphanumeric(8).toUpperCase()}`,
			trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
			carrier: faker.helpers.arrayElement([
				"FedEx",
				"UPS",
				"DHL",
				"BlueDart",
			]),
			dockDoorId,
			scheduledAt: current,
			shippedAt: current,
			status: "SHIPPED",
		});
	}

	const numLines = faker.number.int({ min: 1, max: 3 });
	const shippedLines: ShippedLine[] = [];
	let linesAdded = 0;

	for (let l = 0; l < numLines; l++) {
		const skuId = faker.helpers.arrayElement(availableSkus);
		const sku = skuMap.get(skuId)!;
		const liveTotals = inventory.getSkuTotals();
		if (!liveTotals[skuId] || liveTotals[skuId] < 1) continue;

		const isSerial = sku.product.isSerialTracked;
		const maxPick = isSerial ? 1 : Math.min(10, liveTotals[skuId]);
		const qty = isSerial ? 1 : faker.number.int({ min: 1, max: maxPick });

		if (scenario === "ALLOCATED") {
			buffers.soItems.push({
				id: createId(),
				salesOrderId: soId,
				skuId,
				orderedQty: qty,
				allocatedQty: qty,
				pickedQty: 0,
			});
			linesAdded++;
			continue;
		}

		const validLocs = inventory
			.getSkuLocations(skuId)
			.filter((loc) => loc.qty >= qty);
		if (validLocs.length === 0) continue;

		const selected = faker.helpers.arrayElement(validLocs);
		const pickLoc = selected.locId;
		const lotId = selected.lotId;

		const pickedQty =
			scenario === "PICKING"
				? Math.max(1, Math.floor(qty * faker.number.float({ min: 0.3, max: 0.7 })))
				: qty;

		if (!inventory.removeQuantity(pickLoc, skuId, lotId, pickedQty)) continue;

		buffers.trackBalanceDelta(whId, pickLoc, skuId, lotId, -pickedQty, current);

		let serialIds: string[] = [];
		if (isSerial) {
			serialIds = inventory.consumeSerials(skuId, pickLoc, pickedQty);
			if (serialIds.length < pickedQty) {
				inventory.addQuantity(pickLoc, skuId, lotId, pickedQty);
				buffers.trackBalanceDelta(
					whId,
					pickLoc,
					skuId,
					lotId,
					pickedQty,
					current,
				);
				continue;
			}
			buffers.markSerialsDirty(serialIds);
		}

		buffers.soItems.push({
			id: createId(),
			salesOrderId: soId,
			skuId,
			orderedQty: qty,
			allocatedQty: qty,
			pickedQty: scenario === "SHIPPED" ? qty : pickedQty,
		});
		linesAdded++;

		const taskStatus = pickTaskStatus();
		buffers.tasks.push({
			id: createId(),
			warehouseId: whId,
			type: "PICK",
			status: taskStatus,
			priority: "NORMAL",
			fromLocationId: pickLoc,
			toLocationId: layout.outbound[0],
			skuId,
			quantity: pickedQty,
			createdAt: current,
			startedAt:
				taskStatus === "COMPLETED" || taskStatus === "ASSIGNED"
					? current
					: null,
			completedAt: taskStatus === "COMPLETED" ? current : null,
		});

		buffers.tx.push({
			id: createId(),
			warehouseId: whId,
			skuId,
			lotId,
			fromLocationId: pickLoc,
			toLocationId: layout.outbound[0],
			quantity: pickedQty,
			transactionType: "PICK",
			createdAt: current,
			referenceType: "SO",
			referenceId: soId,
		});

		if (scenario === "SHIPPED") {
			buffers.tx.push({
				id: createId(),
				warehouseId: whId,
				skuId,
				lotId,
				fromLocationId: layout.outbound[0],
				toLocationId: null,
				quantity: pickedQty,
				transactionType: "SHIP",
				createdAt: current,
			});
			shippedLines.push({ skuId, quantity: pickedQty, lotId, serialIds });

			if (faker.number.int({ min: 1, max: 100 }) <= 5) {
				const returnDate = new Date(
					current.getTime() + 5 * 24 * 60 * 60 * 1000,
				);
				if (returnDate < simulationEnd) {
					pendingReturns.push({
						executeAt: returnDate,
						warehouseId: whId,
						customerId,
						salesOrderId: soId,
						skuId,
						quantity: pickedQty,
						lotId,
						disposition: faker.helpers.arrayElement([
							"RESTOCK",
							"SCRAP",
							"REFURBISH",
							"RETURN_TO_VENDOR",
						]),
						serialIds: [...serialIds],
					});
				}
			}
		}
	}

	if (linesAdded === 0) {
		buffers.so.pop();
		if (scenario === "SHIPPED") buffers.shipments.pop();
	}
}

async function simulateTransfer(
	whId: string,
	layout: WarehouseLayout,
	skuMap: Map<string, SkuWithProduct>,
	inventory: WarehouseInventory,
	buffers: SimulationBuffers,
	current: Date,
): Promise<void> {
	const skuTotals = inventory.getSkuTotals();
	const availableSkus = Object.keys(skuTotals).filter((id) => {
		const sku = skuMap.get(id);
		if (sku?.product.isSerialTracked) return skuTotals[id] >= 1;
		return skuTotals[id] > 50;
	});
	if (availableSkus.length === 0) return;

	const skuId = faker.helpers.arrayElement(availableSkus);
	const sku = skuMap.get(skuId)!;
	const isSerial = sku.product.isSerialTracked;
	const minAtLoc = isSerial ? 1 : 5;

	const validLocs = inventory
		.getSkuLocations(skuId)
		.filter((loc) => loc.qty >= minAtLoc);
	if (validLocs.length === 0) return;

	const selected = faker.helpers.arrayElement(validLocs);
	const fromLoc = selected.locId;
	const lotId = selected.lotId;

	const storageOptions = [...layout.bins, ...layout.pallets].filter(
		(id) => id !== fromLoc,
	);
	if (storageOptions.length === 0) return;
	const toLoc = faker.helpers.arrayElement(storageOptions);

	const moveQty = isSerial
		? 1
		: faker.number.int({
				min: 5,
				max: Math.min(20, selected.qty),
			});

	if (!inventory.removeQuantity(fromLoc, skuId, lotId, moveQty)) return;

	buffers.trackBalanceDelta(whId, fromLoc, skuId, lotId, -moveQty, current);
	inventory.addQuantity(toLoc, skuId, lotId, moveQty);
	buffers.trackBalanceDelta(whId, toLoc, skuId, lotId, moveQty, current);

	if (isSerial) {
		const movedSerials = inventory.moveSerials(
			skuId,
			fromLoc,
			toLoc,
			moveQty,
		);
		if (movedSerials.length < moveQty) {
			inventory.addQuantity(fromLoc, skuId, lotId, moveQty);
			buffers.trackBalanceDelta(
				whId,
				fromLoc,
				skuId,
				lotId,
				moveQty,
				current,
			);
			inventory.removeQuantity(toLoc, skuId, lotId, moveQty);
			buffers.trackBalanceDelta(
				whId,
				toLoc,
				skuId,
				lotId,
				-moveQty,
				current,
			);
			return;
		}
		buffers.markSerialsDirty(movedSerials);
	}

	const transferTaskStatus = pickTaskStatus();
	buffers.tasks.push({
		id: createId(),
		warehouseId: whId,
		type: faker.number.int({ min: 1, max: 10 }) > 7 ? "MOVE" : "REPLENISHMENT",
		status: transferTaskStatus,
		priority: "HIGH",
		fromLocationId: fromLoc,
		toLocationId: toLoc,
		skuId,
		quantity: moveQty,
		createdAt: current,
		startedAt:
			transferTaskStatus === "COMPLETED" || transferTaskStatus === "ASSIGNED"
				? current
				: null,
		completedAt: transferTaskStatus === "COMPLETED" ? current : null,
	});

	buffers.tx.push({
		id: createId(),
		warehouseId: whId,
		skuId,
		lotId,
		fromLocationId: fromLoc,
		toLocationId: toLoc,
		quantity: moveQty,
		transactionType: "MOVE",
		createdAt: current,
	});
}

function processPendingReturns(
	locationCache: Map<string, WarehouseLayout>,
	skuMap: Map<string, SkuWithProduct>,
	inventories: Map<string, WarehouseInventory>,
	buffers: SimulationBuffers,
	pendingReturns: PendingReturn[],
	current: Date,
): void {
	const due = pendingReturns.filter((r) => r.executeAt <= current);
	const remaining = pendingReturns.filter((r) => r.executeAt > current);
	pendingReturns.length = 0;
	pendingReturns.push(...remaining);

	for (const ret of due) {
		const layout = locationCache.get(ret.warehouseId);
		const inventory = inventories.get(ret.warehouseId);
		if (!inventory || !layout) continue;

		const lifecycle = pickReturnLifecycle();
		const inboundLoc = layout.inbound[0];
		const restockLoc = pickStorageBin(layout);
		const retOrderId = createId();

		const returnStatus =
			lifecycle === "COMPLETED"
				? "COMPLETED"
				: lifecycle === "INSPECTING"
					? "INSPECTING"
					: "RECEIVED";

		buffers.returnOrders.push({
			id: retOrderId,
			warehouseId: ret.warehouseId,
			customerId: ret.customerId,
			salesOrderId: ret.salesOrderId,
			returnNumber: `RMA-${faker.string.alphanumeric(8).toUpperCase()}`,
			reason: faker.helpers.arrayElement([
				"Defective",
				"Wrong Item",
				"Changed Mind",
			]),
			status: returnStatus,
			createdAt: ret.executeAt,
		});

		buffers.returnItems.push({
			id: createId(),
			returnOrderId: retOrderId,
			skuId: ret.skuId,
			quantity: ret.quantity,
			disposition: lifecycle === "COMPLETED" ? ret.disposition : null,
		});

		if (lifecycle !== "RECEIVED") {
			buffers.returnInspections.push({
				id: createId(),
				returnOrderId: retOrderId,
				result: faker.helpers.arrayElement(["PASSED", "FAILED"]),
				createdAt: ret.executeAt,
			});
		}

		buffers.tx.push({
			id: createId(),
			warehouseId: ret.warehouseId,
			skuId: ret.skuId,
			lotId: ret.lotId,
			fromLocationId: null,
			toLocationId: inboundLoc,
			quantity: ret.quantity,
			transactionType: "RETURN",
			createdAt: ret.executeAt,
			referenceType: "RMA",
			referenceId: retOrderId,
		});

		if (
			lifecycle === "COMPLETED" &&
			ret.disposition === "RESTOCK"
		) {
			const sku = skuMap.get(ret.skuId);

			inventory.addQuantity(
				restockLoc,
				ret.skuId,
				ret.lotId,
				ret.quantity,
			);
			buffers.trackBalanceDelta(
				ret.warehouseId,
				restockLoc,
				ret.skuId,
				ret.lotId,
				ret.quantity,
				ret.executeAt,
			);

			if (sku?.product.isSerialTracked && ret.serialIds.length) {
				inventory.restockSerials(ret.serialIds, restockLoc);
				buffers.markSerialsDirty(ret.serialIds);
			}
		}
	}
}

async function verifyInventoryIntegrity(
	prisma: DbTx,
	inventories: Map<string, WarehouseInventory>,
): Promise<void> {
	for (const [whId, inventory] of inventories) {
		inventory.assertNonNegative();

		const dbBalances = await prisma.inventoryBalance.findMany({
			where: { warehouseId: whId, state: "AVAILABLE" },
		});

		for (const b of dbBalances) {
			if (Number(b.quantityAvailable) < 0) {
				throw new Error(
					`DB negative balance: WH ${whId} SKU ${b.skuId} @ ${b.locationId} = ${b.quantityAvailable}`,
				);
			}
		}

		const dbTotals: Record<string, number> = {};
		for (const b of dbBalances) {
			dbTotals[b.skuId] =
				(dbTotals[b.skuId] ?? 0) + Number(b.quantityAvailable);
		}

		const cacheTotals = inventory.getSkuTotals();
		const allSkuIds = new Set([
			...Object.keys(dbTotals),
			...Object.keys(cacheTotals),
		]);

		for (const skuId of allSkuIds) {
			const cacheQty = cacheTotals[skuId] ?? 0;
			const dbQty = dbTotals[skuId] ?? 0;
			if (cacheQty !== dbQty) {
				throw new Error(
					`Integrity mismatch: WH ${whId} SKU ${skuId} cache=${cacheQty} db=${dbQty}`,
				);
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function layoutAndSimulation() {
	console.log("Starting Layout and 2-Year Simulation...");
	const org = await db.organization.findFirst({ where: { name: ORG_NAME } });
	if (!org) {
		throw new Error(
			"Organization not found. Please run create-setup.ts first.",
		);
	}

	await ensureAutopilotRules(org.id);
	console.log("Autopilot rules ensured for organization.");

	const warehouses = await db.warehouse.findMany({
		where: { organizationId: org.id },
	});
	if (warehouses.length !== 5) {
		console.warn(`Found ${warehouses.length} warehouses, expected 5.`);
	}

	const skus = await db.sKU.findMany({ include: { product: true } });
	if (skus.length === 0) {
		throw new Error("No SKUs found. Please run products.ts first.");
	}
	const skuMap = new Map(skus.map((s) => [s.id, s]));

	console.log("Cleaning up existing locations and transactions...");
	await db.pickWaveLine.deleteMany();
	await db.pickWaveSalesOrder.deleteMany();
	await db.pickWave.deleteMany();
	await db.transferOrderItem.deleteMany();
	await db.transferOrder.deleteMany();
	await db.inventoryTransaction.deleteMany();
	await db.inventoryBalance.deleteMany();
	await db.inventorySerial.deleteMany();
	await db.inventoryLot.deleteMany();
	await db.warehouseTask.deleteMany();
	await db.receivingOrder.deleteMany();
	await db.aSNItem.deleteMany();
	await db.advancedShippingNotice.deleteMany();
	await db.purchaseOrderItem.deleteMany();
	await db.purchaseOrder.deleteMany();
	await db.shipment.deleteMany();
	await db.salesOrderItem.deleteMany();
	await db.salesOrder.deleteMany();
	await db.returnOrderItem.deleteMany();
	await db.returnInspection.deleteMany();
	await db.returnOrder.deleteMany();
	await db.asset.deleteMany();
	await db.location.deleteMany();

	let supplierIds: string[] = [];
	let customerIds: string[] = [];

	const checkSupplierCount = await db.supplier.count();
	const checkCustomerCount = await db.customer.count();

	if (
		checkSupplierCount >= NUM_SUPPLIERS &&
		checkCustomerCount >= NUM_CUSTOMERS
	) {
		console.log("Master data already present. Skipping supplier/customer creation.");
		supplierIds = (
			await db.supplier.findMany({ select: { id: true } })
		).map((s) => s.id);
		customerIds = (
			await db.customer.findMany({ select: { id: true } })
		).map((c) => c.id);
	} else {
		console.log("Regenerating suppliers and customers...");
		await db.customer.deleteMany();
		await db.supplier.deleteMany();

		for (let i = 0; i < NUM_SUPPLIERS; i++) {
			const s = await db.supplier.create({
				data: {
					organizationId: org.id,
					name: `${faker.company.name()} - SUP${i}`,
					email: faker.internet.email(),
					phone: faker.phone.number(),
					createdAt: faker.date.past({ years: 10 }),
				},
			});
			supplierIds.push(s.id);
		}

		for (let i = 0; i < NUM_CUSTOMERS; i++) {
			const c = await db.customer.create({
				data: {
					organizationId: org.id,
					name: `${faker.company.name()} - CUST${i}`,
					email: faker.internet.email(),
					phone: faker.phone.number(),
					notes: faker.lorem.sentences(2),
					type: faker.helpers.arrayElement(["RETAIL", "WHOLESALE"]),
					createdAt: faker.date.past({ years: 10 }),
					CustomerLocation: {
						create: {
							organization: { connect: { id: org.id } },
							name: "Main Branch",
							isDefault: true,
							notes: faker.lorem.words(3),
							address: {
								create: {
									addressLine1: faker.location.streetAddress(),
									addressLine2:
										faker.location.secondaryAddress(),
									city: faker.location.city(),
									state: faker.location.state(),
									zip: faker.location.zipCode(),
									country: faker.location.country(),
								},
							},
						},
					},
				},
			});
			customerIds.push(c.id);
		}
	}

	console.log("Generating warehouse layouts...");
	const locationCache = await buildWarehouseLayouts(warehouses);

	const inventories = new Map<string, WarehouseInventory>();
	for (const wh of warehouses) {
		inventories.set(wh.id, new WarehouseInventory(wh.id));
	}

	const buffers = new SimulationBuffers();
	const pendingReturns: PendingReturn[] = [];

	const { start: historicalStart, end: historicalEnd } =
		getHistoricalSimulationDates();
	const current = new Date(historicalStart);

	if (CONFIG.SKIP_HISTORICAL) {
		console.log("SKIP_HISTORICAL=true — skipping historical loop.");
	} else {
		console.log(
			`Simulating ${CONFIG.HISTORICAL_YEARS} years (${historicalStart.toISOString().slice(0, 10)} → ${historicalEnd.toISOString().slice(0, 10)})...`,
		);
		let simulatedDays = 0;

		while (current < historicalEnd) {
			if (simulatedDays % 10 === 0) {
				console.log(
					`Day ${simulatedDays} — ${current.toISOString().split("T")[0]}`,
				);
			}

			await db.$transaction(
				async (prisma) => {
					processPendingReturns(
						locationCache,
						skuMap,
						inventories,
						buffers,
						pendingReturns,
						current,
					);

					for (const wh of warehouses) {
						const layout = locationCache.get(wh.id)!;
						const inventory = inventories.get(wh.id)!;

						const numReceipts = faker.number.int({ min: 1, max: 3 });
						for (let r = 0; r < numReceipts; r++) {
							await simulateInboundReceipt(
								wh.id,
								layout,
								supplierIds,
								skus,
								inventory,
								buffers,
								current,
							);
							await buffers.maybeFlush(prisma);
						}

						const numOrders = faker.number.int({ min: 1, max: 4 });
						for (let o = 0; o < numOrders; o++) {
							await simulateOutboundOrder(
								wh.id,
								layout,
								customerIds,
								skuMap,
								inventory,
								buffers,
								pendingReturns,
								current,
								historicalEnd,
							);
							await buffers.maybeFlush(prisma);
						}

						if (faker.number.int({ min: 1, max: 10 }) > 7) {
							await simulateTransfer(
								wh.id,
								layout,
								skuMap,
								inventory,
								buffers,
								current,
							);
							await buffers.maybeFlush(prisma);
						}

						inventory.assertNonNegative();
					}

					current.setDate(current.getDate() + 1);
					simulatedDays++;

					await buffers.flush(prisma);
					await buffers.flushSerialUpdates(prisma, inventories);

					if (simulatedDays % 10 === 0) {
						await verifyInventoryIntegrity(prisma, inventories);
					}
				},
				{ timeout: 120_000 },
			);
		}

		console.log(`${CONFIG.HISTORICAL_YEARS}-year simulation complete.`);
	}

	console.log("Seeding demo snapshot for golden-path POC...");
	await seedDemoSnapshot({ organizationId: org.id });
	console.log("Layout and simulation complete.");
}

layoutAndSimulation().catch((err) => {
	console.error("Simulation failed:", err);
	process.exit(1);
});
