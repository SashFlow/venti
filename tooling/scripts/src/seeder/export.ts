import fs from "fs";
import path from "path";
import { CONFIG } from "./config";

export class CsvExporter {
	private dir: string;
	private streams: Map<string, fs.WriteStream> = new Map();

	constructor(dir: string = CONFIG.OUTPUT_DIR) {
		this.dir = dir;
		if (!fs.existsSync(this.dir)) {
			fs.mkdirSync(this.dir, { recursive: true });
		}
	}

	// Define headers for each table
	private getHeaders(table: string): string[] {
		switch (table) {
			case "organization":
				return ["id", "name", "slug", "createdAt"];
			case "user":
				return [
					"id",
					"name",
					"email",
					"emailVerified",
					"createdAt",
					"updatedAt",
				];
			case "uom":
				return [
					"id",
					"organizationId",
					"code",
					"name",
					"abbreviation",
					"isBase",
					"precision",
					"createdAt",
					"updatedAt",
				];
			case "sku_category":
				return [
					"id",
					"organizationId",
					"name",
					"createdAt",
					"updatedAt",
				];
			case "sku":
				return [
					"id",
					"organizationId",
					"skuCode",
					"name",
					"lifecycle",
					"categoryId",
					"uomId",
					"serialTracking",
					"batchTracking",
					"createdAt",
					"updatedAt",
				];
			case "supplier":
				return [
					"id",
					"organizationId",
					"code",
					"name",
					"createdAt",
					"updatedAt",
				];
			case "customer":
				return [
					"id",
					"organizationId",
					"name",
					"createdAt",
					"updatedAt",
				];

			case "warehouse":
				return [
					"id",
					"organizationId",
					"code",
					"name",
					"status",
					"createdAt",
					"updatedAt",
				];
			case "warehouse_floor":
				return [
					"id",
					"warehouseId",
					"floorNumber",
					"code",
					"status",
					"widthMm",
					"lengthMm",
					"createdAt",
					"updatedAt",
				];
			case "zone":
				return [
					"id",
					"warehouseId",
					"code",
					"name",
					"type",
					"createdAt",
					"updatedAt",
				];
			case "storage_unit":
				return [
					"id",
					"warehouseId",
					"floorId",
					"zoneId",
					"parentStorageUnitId",
					"code",
					"type",
					"status",
					"levelIndex",
					"positionIndex",
					"createdAt",
					"updatedAt",
				];

			case "inventory_item":
				return [
					"id",
					"warehouseId",
					"skuId",
					"currentStorageUnitId",
					"currentHandlingUnitId",
					"serialNumber",
					"batchNumber",
					"quantity",
					"status",
					"createdAt",
					"updatedAt",
				];
			case "inventory_movement":
				return [
					"id",
					"warehouseId",
					"inventoryItemId",
					"transactionType",
					"status",
					"fromStorageUnitId",
					"toStorageUnitId",
					"quantity",
					"createdAt",
					"updatedAt",
				];

			case "purchase_order":
				return [
					"id",
					"organizationId",
					"warehouseId",
					"supplierId",
					"poNumber",
					"status",
					"expectedDate",
					"createdAt",
					"updatedAt",
				];
			case "purchase_order_line":
				return [
					"id",
					"purchaseOrderId",
					"lineNumber",
					"skuId",
					"orderedQty",
					"receivedQty",
					"status",
					"createdAt",
					"updatedAt",
				];
			case "receipt":
				return [
					"id",
					"warehouseId",
					"purchaseOrderId",
					"receiptNumber",
					"status",
					"receivedAt",
					"createdAt",
					"updatedAt",
				];
			case "receipt_line":
				return [
					"id",
					"receiptId",
					"purchaseOrderLineId",
					"skuId",
					"receivedQty",
					"acceptedQty",
					"rejectedQty",
					"createdAt",
					"updatedAt",
				];

			case "sales_order":
				return [
					"id",
					"organizationId",
					"warehouseId",
					"customerId",
					"orderNumber",
					"status",
					"createdAt",
					"updatedAt",
				];
			case "sales_order_line":
				return [
					"id",
					"salesOrderId",
					"lineNumber",
					"skuId",
					"orderedQty",
					"allocatedQty",
					"pickedQty",
					"shippedQty",
					"status",
					"createdAt",
					"updatedAt",
				];
			case "wave":
				return [
					"id",
					"warehouseId",
					"waveNumber",
					"type",
					"status",
					"createdAt",
					"updatedAt",
				];
			case "wave_line":
				return [
					"id",
					"waveId",
					"salesOrderLineId",
					"qtyToPick",
					"qtyPicked",
					"createdAt",
					"updatedAt",
				];
			case "shipment":
				return [
					"id",
					"warehouseId",
					"salesOrderId",
					"shipmentNumber",
					"status",
					"dispatchedAt",
					"createdAt",
					"updatedAt",
				];
			case "shipment_line":
				return [
					"id",
					"shipmentId",
					"salesOrderLineId",
					"skuId",
					"shippedQty",
					"createdAt",
					"updatedAt",
				];

			default:
				return ["id"];
		}
	}

	public initTable(table: string) {
		const filePath = path.join(this.dir, `${table}.csv`);
		const stream = fs.createWriteStream(filePath, { flags: "w" });
		const headers = this.getHeaders(table);
		stream.write(headers.join(",") + "\n");
		this.streams.set(table, stream);
	}

	public writeRow(table: string, row: Record<string, any>) {
		const stream = this.streams.get(table);
		if (!stream) {
			throw new Error(`Stream not initialized for table: ${table}`);
		}

		const headers = this.getHeaders(table);
		const values = headers.map((header) => {
			const val = row[header];
			if (val === null || val === undefined) return "";
			if (val instanceof Date) return val.toISOString();
			if (typeof val === "string") {
				// Escape quotes and commas
				if (
					val.includes(",") ||
					val.includes('"') ||
					val.includes("\n")
				) {
					return `"${val.replace(/"/g, '""')}"`;
				}
				return val;
			}
			return val.toString();
		});

		stream.write(values.join(",") + "\n");
	}

	public closeAll() {
		for (const stream of this.streams.values()) {
			stream.end();
		}
	}
}
