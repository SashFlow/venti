import { faker } from "@faker-js/faker";
import { CONFIG } from "./config";
import { CsvExporter } from "./export";
import { generateMasterData, type State } from "./master-data";
import { generateId } from "./utils";

// Inventory state: warehouseId -> skuId -> qty
type InventoryLedger = Record<
	string,
	Record<string, { qty: number; invId: string }>
>;

async function main() {
	console.log("Initializing CSV Exporter...");
	const exporter = new CsvExporter();

	const tables = [
		"organization",
		"user",
		"UnitOfMeasure",
		"Product",
		"SKU",
		"Supplier",
		"Customer",
		"Warehouse",
		"Location",
		"InventoryLot",
		"InventorySerial",
		"InventoryBalance",
		"InventoryTransaction",
		"PurchaseOrder",
		"PurchaseOrderItem",
		"AdvancedShippingNotice",
		"ASNItem",
		"ReceivingOrder",
		"SalesOrder",
		"SalesOrderItem",
		"Shipment",
	];

	tables.forEach((t) => exporter.initTable(t));

	console.log("Generating Master Data...");
	const state = generateMasterData(exporter);

	const inventory: InventoryLedger = {};
	for (const wh of state.warehouses) {
		inventory[wh.id] = {};
	}

	const startDate = CONFIG.START_DATE;
	const endDate = CONFIG.END_DATE;
	const totalDays = Math.floor(
		(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
	);

	console.log(
		`Starting Simulation for ${totalDays} days across ${CONFIG.NUM_WAREHOUSES} warehouses...`,
	);

	let simulatedOrders = 0;
	let simulatedReceipts = 0;

	for (let day = 0; day <= totalDays; day++) {
		const currentDate = new Date(
			startDate.getTime() + day * 24 * 60 * 60 * 1000,
		);

		// Provide a simple log every 30 simulated days
		if (day % 30 === 0) {
			console.log(
				`Simulating Day ${day}/${totalDays} (${currentDate.toISOString().split("T")[0]})`,
			);
		}

		// 1. INBOUND: Simulate Receipts to stock the warehouses
		// To maintain stock, we inject large purchase orders
		const dailyReceipts =
			Math.floor(CONFIG.RECEIPTS_PER_DAY / CONFIG.NUM_WAREHOUSES) + 1;

		for (const wh of state.warehouses) {
			for (let r = 0; r < dailyReceipts; r++) {
				simulateInbound(currentDate, wh, state, exporter, inventory);
				simulatedReceipts++;
			}
		}

		// 2. OUTBOUND: Simulate Sales Orders
		const dailyOrdersPerWh =
			Math.floor(CONFIG.ORDERS_PER_DAY / CONFIG.NUM_WAREHOUSES) + 1;

		for (const wh of state.warehouses) {
			for (let o = 0; o < dailyOrdersPerWh; o++) {
				simulateOutbound(currentDate, wh, state, exporter, inventory);
				simulatedOrders++;
			}
		}
	}

	console.log("Closing Streams...");
	exporter.closeAll();
	console.log(
		`Simulation Complete. Total POs: ${simulatedReceipts}, Total SOs: ${simulatedOrders}. Data dumped to ${CONFIG.OUTPUT_DIR}`,
	);
}

function simulateInbound(
	currentDate: Date,
	wh: State["warehouses"][0],
	state: State,
	exporter: CsvExporter,
	inventory: InventoryLedger,
) {
	const supplierId = faker.helpers.arrayElement(state.suppliers);
	const poId = generateId();
	const receiptId = generateId();

	exporter.writeRow("PurchaseOrder", {
		id: poId,
		createdAt: currentDate,
		warehouseId: wh.id,
		supplierId,
		poNumber: `PO-${generateId().slice(0, 8)}`,
		status: "RECEIVED",
	});

	exporter.writeRow("AdvancedShippingNotice", {
		id: receiptId,
		createdAt: currentDate,
		warehouseId: wh.id,
		supplierId,
		purchaseOrderId: poId,
		asnNumber: `ASN-${generateId().slice(0, 8)}`,
		status: "COMPLETED",
	});

	exporter.writeRow("ReceivingOrder", {
		id: generateId(),
		createdAt: currentDate,
		warehouseId: wh.id,
		purchaseOrderId: poId,
		asnId: receiptId,
		status: "COMPLETED",
	});

	// Pick 1-5 SKUs to receive
	const numLines = faker.number.int({ min: 1, max: 5 });
	for (let l = 0; l < numLines; l++) {
		const sku = faker.helpers.arrayElement(state.skus);
		const polId = generateId();
		const qty = faker.number.int({ min: 10, max: 100 });

		exporter.writeRow("PurchaseOrderItem", {
			id: polId,
			purchaseOrderId: poId,
			skuId: sku.id,
			orderedQty: qty,
			receivedQty: qty,
		});

		const rclId = generateId();
		exporter.writeRow("ASNItem", {
			id: rclId,
			asnId: receiptId,
			skuId: sku.id,
			expectedQty: qty,
			receivedQty: qty,
		});

		// Create Inventory Items and Movements
		// Determine storage location based on SKU type
		let locId = "";
		if (sku.serialTracking) {
			locId = faker.helpers.arrayElement(wh.pickingBins);
		} else if (sku.batchTracking) {
			locId = faker.helpers.arrayElement(wh.pickingBins);
		} else {
			locId = faker.helpers.arrayElement(wh.bulkLocations);
		}

		// In a real system, you might create multiple InventoryItems (e.g. per serial). We simplify by grouping.
		const invId = generateId();
		const batchNumber = sku.batchTracking
			? `BATCH-${generateId().slice(0, 6)}`
			: null;
		const serialNumber = sku.serialTracking
			? `SN-${generateId().slice(0, 8)}`
			: null;

		let lotId: string | null = null;

		if (sku.batchTracking && batchNumber) {
			lotId = generateId();
			exporter.writeRow("InventoryLot", {
				id: lotId,
				skuId: sku.id,
				lotNumber: batchNumber,
				qcStatus: "PASSED",
			});
		}

		if (sku.serialTracking && serialNumber) {
			exporter.writeRow("InventorySerial", {
				id: generateId(),
				skuId: sku.id,
				serialNumber: serialNumber,
				locationId: locId,
				status: "AVAILABLE",
			});
		}

		exporter.writeRow("InventoryBalance", {
			id: invId,
			warehouseId: wh.id,
			locationId: locId,
			skuId: sku.id,
			lotId: lotId,
			state: "AVAILABLE",
			quantityAvailable: qty,
			updatedAt: currentDate,
		});

		exporter.writeRow("InventoryTransaction", {
			id: generateId(),
			createdAt: currentDate,
			warehouseId: wh.id,
			skuId: sku.id,
			lotId: lotId,
			fromLocationId: null,
			toLocationId: wh.inboundLocations[0],
			quantity: qty,
			transactionType: "RECEIVE",
		});

		exporter.writeRow("InventoryTransaction", {
			id: generateId(),
			createdAt: currentDate,
			warehouseId: wh.id,
			skuId: sku.id,
			lotId: lotId,
			fromLocationId: wh.inboundLocations[0],
			toLocationId: locId,
			quantity: qty,
			transactionType: "PUTAWAY",
		});

		// Update state
		if (!inventory[wh.id][sku.id]) {
			inventory[wh.id][sku.id] = { qty: 0, invId: invId };
		}
		inventory[wh.id][sku.id].qty += qty;
	}
}

function simulateOutbound(
	currentDate: Date,
	wh: State["warehouses"][0],
	state: State,
	exporter: CsvExporter,
	inventory: InventoryLedger,
) {
	const customerId = faker.helpers.arrayElement(state.customers);
	const soId = generateId();

	exporter.writeRow("SalesOrder", {
		id: soId,
		orderedAt: currentDate,
		warehouseId: wh.id,
		customerId,
		orderNumber: `SO-${generateId().slice(0, 8)}`,
		status: "SHIPPED",
	});

	exporter.writeRow("Shipment", {
		id: generateId(),
		warehouseId: wh.id,
		salesOrderId: soId,
		shipmentNumber: `SHIP-${generateId().slice(0, 8)}`,
		trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
		carrier: faker.company.name(),
		dockDoorId: `DOCK-${faker.number.int({ min: 1, max: 10 })}`,
		scheduledAt: currentDate,
		notes: "Seeded shipment",
		shippedAt: currentDate,
		status: "SHIPPED",
	});

	// Pick lines
	const numLines = faker.number.int({ min: 1, max: 3 });
	const lineIdx = 1;

	// Get available SKUs in this warehouse
	const availableSkus = Object.keys(inventory[wh.id]).filter(
		(skuId) => inventory[wh.id][skuId].qty > 0,
	);
	if (availableSkus.length === 0) return;

	for (let l = 0; l < numLines; l++) {
		const skuId = faker.helpers.arrayElement(availableSkus);
		const availableQty = inventory[wh.id][skuId].qty;
		if (availableQty <= 0) continue;

		const qty = Math.min(
			faker.number.int({ min: 1, max: 5 }),
			availableQty,
		);

		const solId = generateId();
		exporter.writeRow("SalesOrderItem", {
			id: solId,
			salesOrderId: soId,
			skuId: skuId,
			orderedQty: qty,
			allocatedQty: qty,
		});

		// Update state
		inventory[wh.id][skuId].qty -= qty;

		// Simulate dummy Inventory Movement (to represent the pick & ship)
		const invId = inventory[wh.id][skuId].invId;
		exporter.writeRow("InventoryTransaction", {
			id: generateId(),
			createdAt: currentDate,
			warehouseId: wh.id,
			skuId: skuId,
			lotId: null,
			fromLocationId: null,
			toLocationId: null,
			quantity: qty,
			transactionType: "PICK",
		});

		exporter.writeRow("InventoryTransaction", {
			id: generateId(),
			createdAt: currentDate,
			warehouseId: wh.id,
			skuId: skuId,
			lotId: null,
			fromLocationId: null,
			toLocationId: null,
			quantity: qty,
			transactionType: "SHIP",
		});
	}
}

main().catch(console.error);
