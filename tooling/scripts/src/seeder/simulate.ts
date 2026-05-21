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
		"uom",
		"sku_category",
		"sku",
		"supplier",
		"customer",
		"warehouse",
		"warehouse_floor",
		"zone",
		"storage_unit",
		"inventory_item",
		"inventory_movement",
		"purchase_order",
		"purchase_order_line",
		"receipt",
		"receipt_line",
		"sales_order",
		"sales_order_line",
		"wave",
		"wave_line",
		"shipment",
		"shipment_line",
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

	exporter.writeRow("purchase_order", {
		id: poId,
		organizationId: state.orgId,
		warehouseId: wh.id,
		supplierId,
		poNumber: `PO-${generateId().slice(0, 8)}`,
		status: "FULLY_RECEIVED",
		expectedDate: currentDate,
		createdAt: currentDate,
		updatedAt: currentDate,
	});

	exporter.writeRow("receipt", {
		id: receiptId,
		warehouseId: wh.id,
		purchaseOrderId: poId,
		receiptNumber: `RCP-${generateId().slice(0, 8)}`,
		status: "COMPLETED",
		receivedAt: currentDate,
		createdAt: currentDate,
		updatedAt: currentDate,
	});

	// Pick 1-5 SKUs to receive
	const numLines = faker.number.int({ min: 1, max: 5 });
	for (let l = 0; l < numLines; l++) {
		const sku = faker.helpers.arrayElement(state.skus);
		const polId = generateId();
		const qty = faker.number.int({ min: 10, max: 100 });

		exporter.writeRow("purchase_order_line", {
			id: polId,
			purchaseOrderId: poId,
			lineNumber: l + 1,
			skuId: sku.id,
			orderedQty: qty,
			receivedQty: qty,
			status: "FULLY_RECEIVED",
			createdAt: currentDate,
			updatedAt: currentDate,
		});

		const rclId = generateId();
		exporter.writeRow("receipt_line", {
			id: rclId,
			receiptId: receiptId,
			purchaseOrderLineId: polId,
			skuId: sku.id,
			receivedQty: qty,
			acceptedQty: qty,
			rejectedQty: 0,
			createdAt: currentDate,
			updatedAt: currentDate,
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

		exporter.writeRow("inventory_item", {
			id: invId,
			warehouseId: wh.id,
			skuId: sku.id,
			currentStorageUnitId: locId,
			serialNumber,
			batchNumber,
			quantity: qty,
			status: "AVAILABLE",
			createdAt: currentDate,
			updatedAt: currentDate,
		});

		exporter.writeRow("inventory_movement", {
			id: generateId(),
			warehouseId: wh.id,
			inventoryItemId: invId,
			transactionType: "RECEIVED",
			status: "COMPLETED",
			toStorageUnitId: wh.inboundLocations[0],
			quantity: qty,
			createdAt: currentDate,
			updatedAt: currentDate,
		});

		exporter.writeRow("inventory_movement", {
			id: generateId(),
			warehouseId: wh.id,
			inventoryItemId: invId,
			transactionType: "PUTAWAY",
			status: "COMPLETED",
			fromStorageUnitId: wh.inboundLocations[0],
			toStorageUnitId: locId,
			quantity: qty,
			createdAt: currentDate,
			updatedAt: currentDate,
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
	const waveId = generateId();
	const shipmentId = generateId();

	exporter.writeRow("sales_order", {
		id: soId,
		organizationId: state.orgId,
		warehouseId: wh.id,
		customerId,
		orderNumber: `SO-${generateId().slice(0, 8)}`,
		status: "FULLY_SHIPPED",
		createdAt: currentDate,
		updatedAt: currentDate,
	});

	exporter.writeRow("wave", {
		id: waveId,
		warehouseId: wh.id,
		waveNumber: `WV-${generateId().slice(0, 8)}`,
		type: "SINGLE_ORDER",
		status: "COMPLETED",
		createdAt: currentDate,
		updatedAt: currentDate,
	});

	exporter.writeRow("shipment", {
		id: shipmentId,
		warehouseId: wh.id,
		salesOrderId: soId,
		shipmentNumber: `SHP-${generateId().slice(0, 8)}`,
		status: "DISPATCHED",
		dispatchedAt: currentDate,
		createdAt: currentDate,
		updatedAt: currentDate,
	});

	// Pick lines
	const numLines = faker.number.int({ min: 1, max: 3 });
	let lineIdx = 1;

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
		exporter.writeRow("sales_order_line", {
			id: solId,
			salesOrderId: soId,
			lineNumber: lineIdx++,
			skuId: skuId,
			orderedQty: qty,
			allocatedQty: qty,
			pickedQty: qty,
			shippedQty: qty,
			status: "FULLY_SHIPPED",
			createdAt: currentDate,
			updatedAt: currentDate,
		});

		const wvlId = generateId();
		exporter.writeRow("wave_line", {
			id: wvlId,
			waveId,
			salesOrderLineId: solId,
			qtyToPick: qty,
			qtyPicked: qty,
			createdAt: currentDate,
			updatedAt: currentDate,
		});

		const shplId = generateId();
		exporter.writeRow("shipment_line", {
			id: shplId,
			shipmentId,
			salesOrderLineId: solId,
			skuId,
			shippedQty: qty,
			createdAt: currentDate,
			updatedAt: currentDate,
		});

		// Update state
		inventory[wh.id][skuId].qty -= qty;

		// Simulate dummy Inventory Movement (to represent the pick & ship)
		const invId = inventory[wh.id][skuId].invId;
		exporter.writeRow("inventory_movement", {
			id: generateId(),
			warehouseId: wh.id,
			inventoryItemId: invId,
			transactionType: "PICK",
			status: "COMPLETED",
			quantity: qty,
			createdAt: currentDate,
			updatedAt: currentDate,
		});

		exporter.writeRow("inventory_movement", {
			id: generateId(),
			warehouseId: wh.id,
			inventoryItemId: invId,
			transactionType: "SHIP",
			status: "COMPLETED",
			quantity: qty,
			createdAt: currentDate,
			updatedAt: currentDate,
		});
	}
}

main().catch(console.error);
