console.log("Top of file");

import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { db } from "../client";

// Constants for Generation
const NUM_YEARS = 2;
const START_DATE = new Date("2021-01-01T00:00:00Z");
const NUM_CUSTOMERS = 100;
const NUM_SUPPLIERS = 20;
const BATCH_SIZE = 50; // Smaller batch size to prevent query too large

const ORG_NAME = "Daikin";

export async function layoutAndSimulation() {
	console.log("Starting Layout and 5-Year Simulation...");
	const org = await db.organization.findFirst({ where: { name: ORG_NAME } });
	if (!org) {
		throw new Error(
			"Organization not found. Please run create-setup.ts first.",
		);
	}

	const warehouses = await db.warehouse.findMany({
		where: { organizationId: org.id },
	});

	if (warehouses.length !== 5) {
		console.warn(`Found ${warehouses.length} warehouses, expected 5.`);
	}

	const skus = await db.sKU.findMany({
		include: { product: true },
	});
	if (skus.length === 0) {
		throw new Error("No SKUs found. Please run products.ts first.");
	}

	let supplierIds: string[] = [];
	let customerIds: string[] = [];

	// Only cleanup if we are forcing it or it failed halfway
	const checkSupplier = await db.supplier.findFirst();
	if (checkSupplier) {
		console.log("Master Data already generated. Skipping cleanup...");
		supplierIds = (
			await db.supplier.findMany({ select: { id: true } })
		).map((s) => s.id);
		customerIds = (
			await db.customer.findMany({ select: { id: true } })
		).map((c) => c.id);
	} else {
		// 1. GENERATE MASTER DATA
		console.log("Generating Suppliers & Customers...");
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
					isWholesaler: faker.datatype.boolean(),
					createdAt: faker.date.past({ years: 10 }),
					CustomerLocation: {
						create: {
							organization: { connect: { id: org.id } },
							name: "Main Branch",
							isDefault: true,
							notes: faker.lorem.words(3),
							address: {
								create: {
									addressLine1:
										faker.location.streetAddress(),
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

	// 2. GENERATE WAREHOUSE LAYOUT
	console.log("Cleaning up existing locations and transactions...");

	// Delete data safely in correct constraint order
	await db.inventoryTransaction.deleteMany();
	await db.inventoryBalance.deleteMany();
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

	console.log("Generating Warehouse Layouts...");
	const locationCache = new Map<
		string,
		{
			inbound: string[];
			outbound: string[];
			bins: string[];
			pallets: string[];
			blocks: string[];
		}
	>();

	for (const wh of warehouses) {
		console.log(`Building layout for ${wh.name}...`);
		const whCache = {
			inbound: [],
			outbound: [],
			bins: [],
			pallets: [],
			blocks: [],
		} as any;

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
					depth: 100, // meters
					x: 0,
					y: floorNum === 1 ? 0 : 10,
					z: 0,
					colorHex: "#cccccc",
				},
			});

			// Stairs between floors (Placed on Floor 1 technically, but conceptually connecting)
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

			// Walls encapsulation
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
				// Zones
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
				whCache.inbound.push(inboundZone.id);

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
				whCache.outbound.push(outboundZone.id);

				const qcZone = await db.location.create({
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

				// Dock Doors
				for (let d = 1; d <= 3; d++) {
					await db.asset.create({
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
				}
			}

			// Storage Zones (Blocks & Racks)
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

			// Blocks (Grid / Island for ground storage)
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
				whCache.blocks.push(block.id);
			}

			// Aisles & Racks
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

				// 3 Levels (Shelves)
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

					// Bins or Pallets
					for (let pos = 1; pos <= 5; pos++) {
						if (lvl === 1) {
							// Ground level shelf can hold Pallets
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
							whCache.pallets.push(palletLoc.id);
						} else {
							// Upper levels have Bins
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
							whCache.bins.push(binLoc.id);
						}
					}
				}
			}
		}
		locationCache.set(wh.id, whCache);
	}

	// 3. SIMULATE 5 YEARS OF ACTIVITY
	console.log("Simulating 5 Years of Transactions in Batches...");
	const current = new Date(START_DATE);
	const end = new Date(
		START_DATE.getTime() + NUM_YEARS * 365 * 24 * 60 * 60 * 1000,
	);

	let simulatedDays = 0;

	// In-memory ledger to ensure we only pick what we have
	const inventoryLedger: Record<
		string,
		Record<string, { qty: number; locs: string[] }>
	> = {};
	for (const wh of warehouses) inventoryLedger[wh.id] = {};

	// Helper to update the in-memory ledger
	function updateLedger(
		whId: string,
		skuId: string,
		locId: string,
		qtyDelta: number,
	) {
		const whLedger = inventoryLedger[whId];
		if (!whLedger[skuId]) {
			whLedger[skuId] = { qty: 0, locs: [] };
		}
		whLedger[skuId].qty += qtyDelta;
		if (qtyDelta > 0) {
			if (!whLedger[skuId].locs.includes(locId)) {
				whLedger[skuId].locs.push(locId);
			}
		} else if (qtyDelta <= 0 && whLedger[skuId].qty <= 0) {
			// Remove location if qty is zero or less
			whLedger[skuId].locs = whLedger[skuId].locs.filter(
				(l) => l !== locId,
			);
		}
	}

	// Array to accumulate transactions for bulk insert
	let txBuffer: any[] = [];
	let balanceUpdates: Record<string, any> = {};

	let poBuffer: any[] = [];
	let asnBuffer: any[] = [];
	let recBuffer: any[] = [];
	let poItemBuffer: any[] = [];
	let asnItemBuffer: any[] = [];
	let soBuffer: any[] = [];
	let soItemBuffer: any[] = [];
	let shipBuffer: any[] = [];
	let taskBuffer: any[] = [];
	let lotBuffer: any[] = [];
	let retOrderBuffer: any[] = [];
	let retItemBuffer: any[] = [];
	let retInspBuffer: any[] = [];

	// Cache all inventory balances for each warehouse at the start of the simulation
	const warehouseBalanceCache: Record<string, Record<string, any>> = {};
	for (const wh of warehouses) {
		warehouseBalanceCache[wh.id] = {};
	}

	// Helper to flush buffers
	const flushBalances = async (prisma: any = db) => {
		if (poBuffer.length) {
			await prisma.purchaseOrder.createMany({ data: poBuffer });
			poBuffer = [];
		}
		if (asnBuffer.length) {
			await prisma.advancedShippingNotice.createMany({ data: asnBuffer });
			asnBuffer = [];
		}
		if (recBuffer.length) {
			await prisma.receivingOrder.createMany({ data: recBuffer });
			recBuffer = [];
		}
		if (poItemBuffer.length) {
			await prisma.purchaseOrderItem.createMany({ data: poItemBuffer });
			poItemBuffer = [];
		}
		if (asnItemBuffer.length) {
			await prisma.aSNItem.createMany({ data: asnItemBuffer });
			asnItemBuffer = [];
		}
		if (lotBuffer.length) {
			await prisma.inventoryLot.createMany({ data: lotBuffer });
			lotBuffer = [];
		}

		if (txBuffer.length) {
			await prisma.inventoryTransaction.createMany({ data: txBuffer });
			txBuffer = [];
		}

		if (soBuffer.length) {
			await prisma.salesOrder.createMany({ data: soBuffer });
			soBuffer = [];
		}
		if (soItemBuffer.length) {
			await prisma.salesOrderItem.createMany({ data: soItemBuffer });
			soItemBuffer = [];
		}
		if (shipBuffer.length) {
			await prisma.shipment.createMany({ data: shipBuffer });
			shipBuffer = [];
		}

		if (retOrderBuffer.length) {
			await prisma.returnOrder.createMany({ data: retOrderBuffer });
			retOrderBuffer = [];
		}
		if (retItemBuffer.length) {
			await prisma.returnOrderItem.createMany({ data: retItemBuffer });
			retItemBuffer = [];
		}
		if (retInspBuffer.length) {
			await prisma.returnInspection.createMany({ data: retInspBuffer });
			retInspBuffer = [];
		}

		if (taskBuffer.length) {
			await prisma.warehouseTask.createMany({ data: taskBuffer });
			taskBuffer = [];
		}

		// Batch upsert for inventory balances
		const updates = Object.values(balanceUpdates);
		if (updates.length > 0) {
			// Group updates by unique key for batch processing
			const upserts = updates.map((u) =>
				prisma.inventoryBalance.upsert({
					where: {
						locationId_skuId_lotId_state: {
							locationId: u.locationId,
							skuId: u.skuId,
							lotId: u.lotId ?? "",
							state: "AVAILABLE",
						},
					},
					update: {
						quantityAvailable: { increment: u.qty },
						updatedAt: u.current,
					},
					create: {
						warehouseId: u.warehouseId,
						locationId: u.locationId,
						skuId: u.skuId,
						lotId: u.lotId ?? null,
						state: "AVAILABLE",
						quantityAvailable: u.qty,
						updatedAt: u.current,
					},
				}),
			);
			// Run all upserts in parallel batches
			const BATCH_UPSERT_SIZE = 50;
			for (let i = 0; i < upserts.length; i += BATCH_UPSERT_SIZE) {
				await Promise.all(upserts.slice(i, i + BATCH_UPSERT_SIZE));
			}
			balanceUpdates = {};
		}
	};

	while (current < end) {
		const isLogDay = simulatedDays % 10 === 0;
		if (isLogDay) {
			console.log(
				`Processing Day ${simulatedDays} - Date: ${current.toISOString().split("T")[0]}`,
			);
		}

		await db.$transaction(
			async (prisma) => {
				for (const wh of warehouses) {
					const cache = locationCache.get(wh.id)!;
					const whLedger = inventoryLedger[wh.id];
					const balanceCache = warehouseBalanceCache[wh.id];

					// === INBOUND (Daily) ===
					const numReceipts = faker.number.int({ min: 1, max: 3 });
					for (let i = 0; i < numReceipts; i++) {
						const supplierId =
							faker.helpers.arrayElement(supplierIds);

						const poId = createId();
						poBuffer.push({
							id: poId,
							warehouseId: wh.id,
							supplierId,
							poNumber: `PO-${faker.string.alphanumeric(8).toUpperCase()}`,
							status: "RECEIVED",
							expectedAt: faker.date.soon({
								refDate: current,
								days: 5,
							}),
							createdAt: current,
						});

						const asnId = createId();
						asnBuffer.push({
							id: asnId,
							warehouseId: wh.id,
							supplierId,
							purchaseOrderId: poId,
							asnNumber: `ASN-${faker.string.alphanumeric(8).toUpperCase()}`,
							status: "COMPLETED",
							expectedArrival: current,
							pallets: faker.number.int({ min: 1, max: 5 }),
							cartons: faker.number.int({ min: 10, max: 50 }),
							createdAt: current,
						});

						recBuffer.push({
							id: createId(),
							warehouseId: wh.id,
							purchaseOrderId: poId,
							asnId: asnId,
							status: "COMPLETED",
							receivedAt: current,
							createdAt: current,
						});

						// Receive random SKUs
						const numLines = faker.number.int({ min: 2, max: 5 });
						for (let l = 0; l < numLines; l++) {
							const sku = faker.helpers.arrayElement(skus);
							const qty = faker.number.int({ min: 20, max: 100 });

							poItemBuffer.push({
								id: createId(),
								purchaseOrderId: poId,
								skuId: sku.id,
								orderedQty: qty,
								receivedQty: qty,
								unitPrice: sku.unitPrice,
							});
							asnItemBuffer.push({
								id: createId(),
								asnId: asnId,
								skuId: sku.id,
								expectedQty: qty,
								receivedQty: qty,
								lotNumber: sku.product.isBatchTracked
									? `BATCH-${faker.string.alphanumeric(6)}`
									: undefined,
							});

							// Putaway to random storage (bin or pallet)
							const storageLoc = faker.helpers.arrayElement([
								...cache.bins,
								...cache.pallets,
								...cache.blocks,
							]);

							// Create Lot if Batch Tracked
							let lotId = null;
							if (sku.product.isBatchTracked) {
								lotId = createId();
								lotBuffer.push({
									id: lotId,
									skuId: sku.id,
									lotNumber: `BATCH-${faker.string.alphanumeric(6)}`,
									manufactureDate: current,
									expiryDate: faker.date.soon({
										refDate: current,
										days: 365,
									}),
									qcStatus: "PASSED",
								});
							}

							// Update Balance
							const balKey = `${storageLoc}_${sku.id}_${lotId}`;

							// Update persistent balance cache
							if (!warehouseBalanceCache[wh.id][balKey]) {
								warehouseBalanceCache[wh.id][balKey] = {
									warehouseId: wh.id,
									locationId: storageLoc,
									skuId: sku.id,
									lotId: lotId,
									state: "AVAILABLE",
									quantityAvailable: 0,
								};
							}
							warehouseBalanceCache[wh.id][
								balKey
							].quantityAvailable += qty;

							if (!balanceUpdates[balKey]) {
								balanceUpdates[balKey] = {
									warehouseId: wh.id,
									locationId: storageLoc,
									skuId: sku.id,
									lotId,
									qty: 0,
									current,
								};
							}
							balanceUpdates[balKey].qty += qty;
							// Update in-memory ledger for inbound
							updateLedger(wh.id, sku.id, storageLoc, qty);

							// Transactions (Receive -> Putaway)
							txBuffer.push(
								{
									id: createId(),
									warehouseId: wh.id,
									skuId: sku.id,
									lotId: lotId,
									fromLocationId: null,
									toLocationId: cache.inbound[0],
									quantity: qty,
									transactionType: "RECEIVE" as any,
									createdAt: current,
								},
								{
									id: createId(),
									warehouseId: wh.id,
									skuId: sku.id,
									lotId: lotId,
									fromLocationId: cache.inbound[0],
									toLocationId: storageLoc,
									quantity: qty,
									transactionType: "PUTAWAY" as any,
									createdAt: current,
								},
							);

							if (txBuffer.length > 500) {
								await flushBalances(prisma);
							}
						}

						// === OUTBOUND (Daily) ===
						const numOrders = faker.number.int({ min: 1, max: 4 });
						for (let i = 0; i < numOrders; i++) {
							const availableSkus = Object.keys(whLedger).filter(
								(k) => whLedger[k].qty > 10,
							);
							if (availableSkus.length === 0) continue; // nothing to sell

							const customerId =
								faker.helpers.arrayElement(customerIds);
							const soId = createId();
							soBuffer.push({
								id: soId,
								warehouseId: wh.id,
								customerId,
								orderNumber: `SO-${faker.string.alphanumeric(8).toUpperCase()}`,
								status: "SHIPPED",
								orderedAt: current,
							});

							shipBuffer.push({
								id: createId(),
								warehouseId: wh.id,
								salesOrderId: soId,
								shipmentNumber: `SHIP-${faker.string.alphanumeric(8).toUpperCase()}`,
								trackingNumber: faker.string.alphanumeric(12),
								carrier: faker.helpers.arrayElement([
									"FedEx",
									"UPS",
									"DHL",
									"BlueDart",
								]),
								dockDoorId: `Dock Door ${faker.number.int({ min: 1, max: 3 })}`,
								scheduledAt: current,
								shippedAt: current,
								status: "SHIPPED",
							});

							const lines = faker.number.int({ min: 1, max: 3 });
							let hasLines = false;
							for (let l = 0; l < lines; l++) {
								const skuId =
									faker.helpers.arrayElement(availableSkus);
								if (whLedger[skuId].qty < 1) continue;

								const qty = faker.number.int({
									min: 1,
									max: Math.min(10, whLedger[skuId].qty),
								});

								soItemBuffer.push({
									id: createId(),
									salesOrderId: soId,
									skuId: skuId,
									orderedQty: qty,
									allocatedQty: qty,
									pickedQty: qty,
								});
								hasLines = true;

								const pickLoc = faker.helpers.arrayElement(
									whLedger[skuId].locs,
								);

								taskBuffer.push({
									id: createId(),
									warehouseId: wh.id,
									type: "PICK",
									status: "COMPLETED",
									priority: "NORMAL",
									fromLocationId: pickLoc,
									toLocationId: cache.outbound[0],
									skuId: skuId,
									quantity: qty,
									createdAt: current,
									startedAt: current,
									completedAt: current,
								});

								// Reduce Balance (Assuming FIFO for lot id, ignoring for now by taking first available or updating blindly - prisma doesn't allow decrement easily without exact lot. Let's do raw update for simplicity in simulation)
								// To be perfectly accurate, we'd find the exact InventoryBalance record. Let's find one.

								// Use balance cache instead of DB read
								let foundBal = null;
								for (const key in balanceCache) {
									const bal = balanceCache[key];
									if (
										bal.locationId === pickLoc &&
										bal.skuId === skuId &&
										bal.state === "AVAILABLE" &&
										bal.quantityAvailable >= qty
									) {
										foundBal = bal;
										break;
									}
								}

								if (foundBal) {
									// Decrease Balance
									const balKey = `${pickLoc}_${skuId}_${foundBal.lotId}`;
									if (!balanceUpdates[balKey]) {
										balanceUpdates[balKey] = {
											warehouseId: wh.id,
											locationId: pickLoc,
											skuId: skuId,
											lotId: foundBal.lotId,
											qty: 0,
											current,
										};
									}
									balanceUpdates[balKey].qty -= qty;
									// Update in-memory ledger for outbound
									updateLedger(wh.id, skuId, pickLoc, -qty);
									// Update balance cache in-memory
									foundBal.quantityAvailable -= qty;

									txBuffer.push(
										{
											id: createId(),
											warehouseId: wh.id,
											skuId: skuId,
											lotId: foundBal.lotId,
											fromLocationId: pickLoc,
											toLocationId: cache.outbound[0],
											quantity: qty,
											transactionType: "PICK" as any,
											createdAt: current,
											referenceType: "SO",
											referenceId: soId,
										},
										{
											id: createId(),
											warehouseId: wh.id,
											skuId: skuId,
											lotId: foundBal.lotId,
											fromLocationId: cache.outbound[0],
											toLocationId: null,
											quantity: qty,
											transactionType: "SHIP" as any,
											createdAt: current,
										},
									);

									if (txBuffer.length > 500) {
										await flushBalances(prisma);
									}
								}

								if (txBuffer.length > 500) {
									await flushBalances(prisma);
								}

								// === REVERSE LOGISTICS ===
								// 5% chance this shipped order generates a return some days later
								if (
									hasLines &&
									faker.number.int({ min: 1, max: 100 }) <= 5
								) {
									// We'll schedule this for +5 days by directly creating the past return
									const returnDate = new Date(
										current.getTime() +
											5 * 24 * 60 * 60 * 1000,
									);
									if (returnDate < end) {
										const retOrderId = createId();
										retOrderBuffer.push({
											id: retOrderId,
											warehouseId: wh.id,
											customerId,
											salesOrderId: soId,
											returnNumber: `RMA-${faker.string.alphanumeric(8).toUpperCase()}`,
											reason: faker.helpers.arrayElement([
												"Defective",
												"Wrong Item",
												"Changed Mind",
											]),
											status: "COMPLETED",
											createdAt: returnDate,
										});

										// Just take one item from the SO to return
										const soItem = soItemBuffer.find(
											(i) => i.salesOrderId === soId,
										);
										if (soItem) {
											retItemBuffer.push({
												id: createId(),
												returnOrderId: retOrderId,
												skuId: soItem.skuId,
												quantity: 1,
												disposition:
													faker.helpers.arrayElement([
														"RESTOCK",
														"SCRAP",
														"REFURBISH",
														"RETURN_TO_VENDOR",
													]),
											});

											retInspBuffer.push({
												id: createId(),
												returnOrderId: retOrderId,
												result: faker.helpers.arrayElement(
													["PASSED", "FAILED"],
												),
												createdAt: returnDate,
											});

											txBuffer.push({
												id: createId(),
												warehouseId: wh.id,
												skuId: soItem.skuId,
												lotId: null,
												fromLocationId: null,
												toLocationId: cache.inbound[0],
												quantity: 1,
												transactionType: "RETURN",
												createdAt: returnDate,
												referenceType: "RMA",
												referenceId: retOrderId,
											});
											if (txBuffer.length > 500) {
												await flushBalances(prisma);
											}
										}
									}
								}
							} // closes for (let l = 0; l < lines; l++)
						} // closes for (let i = 0; i < numOrders; i++)

						// === TRANSFERS (Daily replenishments) ===
						if (faker.number.int({ min: 1, max: 10 }) > 7) {
							const availableSkus = Object.keys(whLedger).filter(
								(k) => whLedger[k].qty > 50,
							);
							if (availableSkus.length > 0) {
								const skuId =
									faker.helpers.arrayElement(availableSkus);
								const fromLoc = faker.helpers.arrayElement(
									whLedger[skuId].locs,
								);
								const toLoc = faker.helpers.arrayElement([
									...cache.bins,
									...cache.pallets,
								]);
								const moveQty = faker.number.int({
									min: 5,
									max: 20,
								});

								// Use balance cache instead of DB read
								let foundBal = null;
								for (const key in balanceCache) {
									const bal = balanceCache[key];
									if (
										bal.locationId === fromLoc &&
										bal.skuId === skuId &&
										bal.state === "AVAILABLE" &&
										bal.quantityAvailable >= moveQty
									) {
										foundBal = bal;
										break;
									}
								}

								if (foundBal) {
									const balKeyFrom = `${fromLoc}_${skuId}_${foundBal.lotId}`;
									if (!balanceUpdates[balKeyFrom]) {
										balanceUpdates[balKeyFrom] = {
											warehouseId: wh.id,
											locationId: fromLoc,
											skuId: skuId,
											lotId: foundBal.lotId,
											qty: 0,
											current,
										};
									}
									balanceUpdates[balKeyFrom].qty -= moveQty;

									// Update in-memory ledger for transfer (from)
									updateLedger(
										wh.id,
										skuId,
										fromLoc,
										-moveQty,
									);
									// Update balance cache in-memory
									foundBal.quantityAvailable -= moveQty;

									const balKeyTo = `${toLoc}_${skuId}_${foundBal.lotId}`;
									if (!balanceUpdates[balKeyTo]) {
										balanceUpdates[balKeyTo] = {
											warehouseId: wh.id,
											locationId: toLoc,
											skuId: skuId,
											lotId: foundBal.lotId,
											qty: 0,
											current,
										};
									}
									balanceUpdates[balKeyTo].qty += moveQty;
									// Update in-memory ledger for transfer (to)
									updateLedger(wh.id, skuId, toLoc, moveQty);

									taskBuffer.push({
										id: createId(),
										warehouseId: wh.id,
										type: "REPLENISHMENT",
										status: "COMPLETED",
										priority: "HIGH",
										fromLocationId: fromLoc,
										toLocationId: toLoc,
										skuId: skuId,
										quantity: moveQty,
										createdAt: current,
										startedAt: current,
										completedAt: current,
									});

									txBuffer.push({
										id: createId(),
										warehouseId: wh.id,
										skuId: skuId,
										lotId: foundBal.lotId,
										fromLocationId: fromLoc,
										toLocationId: toLoc,
										quantity: moveQty,
										transactionType: "MOVE",
										createdAt: current,
									});
									if (txBuffer.length > 500) {
										await flushBalances(prisma);
									}
								}
							}
						} // closes if (faker.number.int > 7)
					} // closes for (let i = 0; i < numOrders; i++)
				} // closes for (const wh of warehouses)

				current.setDate(current.getDate() + 1);
				simulatedDays++;

				if (simulatedDays % 10 === 0)
					console.log(
						`  -> [3/4] Flushing ${txBuffer.length} transactions and balances to DB...`,
					);
				if (txBuffer.length > 0) {
					await flushBalances(prisma);
				}

				// === VERIFICATION ===
				if (simulatedDays % 10 === 0)
					console.log("  -> [4/4] Verifying ledger integrity...");
				// Verify that the total inventory matches our ledger for this warehouse
				for (const wh of warehouses) {
					const whLedger = inventoryLedger[wh.id];
					const balances = await prisma.inventoryBalance.findMany({
						where: { warehouseId: wh.id, state: "AVAILABLE" },
					});

					const dbTotals: Record<string, number> = {};
					for (const b of balances) {
						dbTotals[b.skuId] =
							(dbTotals[b.skuId] || 0) +
							Number(b.quantityAvailable);
					}

					for (const skuId in whLedger) {
						const ledgerQty = whLedger[skuId].qty;
						const dbQty = dbTotals[skuId] || 0;
						if (ledgerQty !== dbQty) {
							throw new Error(
								`Data Integrity Error: WH ${wh.id} SKU ${skuId} ledger says ${ledgerQty}, DB says ${dbQty}`,
							);
						}
					}
				}
			},
			{ timeout: 120000 },
		); // closes db.$transaction
	} // closes while loop

	console.log("1-Year Simulation Complete!");
} // closes layoutAndSimulation function

layoutAndSimulation();
