import fs from "fs";
import path from "path";
import { CONFIG } from "./config";
import type { SeedTable } from "./tables";

export class CsvExporter {
	private dir: string;
	private streams: Map<string, fs.WriteStream> = new Map();

	constructor(dir: string = CONFIG.OUTPUT_DIR) {
		this.dir = dir;
		if (!fs.existsSync(this.dir)) {
			fs.mkdirSync(this.dir, { recursive: true });
		}
	}

	private getHeaders(table: SeedTable | string): string[] {
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
			case "address":
				return [
					"id",
					"addressLine1",
					"addressLine2",
					"city",
					"state",
					"zip",
					"country",
					"createdAt",
					"updatedAt",
				];
			case "Product":
				return [
					"id",
					"createdAt",
					"updatedAt",
					"organizationId",
					"name",
					"isBatchTracked",
					"isSerialTracked",
					"isPerishable",
				];
			case "SKU":
				return [
					"id",
					"createdAt",
					"updatedAt",
					"productId",
					"code",
					"organizationId",
				];
			case "Supplier":
				return ["id", "organizationId", "name", "type", "createdAt"];
			case "Customer":
				return [
					"id",
					"organizationId",
					"name",
					"type",
					"createdAt",
				];
			case "Warehouse":
				return [
					"id",
					"createdAt",
					"updatedAt",
					"organizationId",
					"code",
					"name",
					"timezone",
					"addressId",
					"sameReturn",
					"status",
				];
			case "Location":
				return [
					"id",
					"createdAt",
					"updatedAt",
					"warehouseId",
					"parentLocationId",
					"code",
					"name",
					"type",
					"isPickable",
					"isReceivable",
					"isReservable",
					"isQuarantine",
					"x",
					"y",
					"z",
					"width",
					"height",
					"depth",
				];
			case "InventoryLot":
				return ["id", "skuId", "lotNumber", "qcStatus"];
			case "InventorySerial":
				return ["id", "skuId", "serialNumber", "locationId", "status"];
			case "InventoryBalance":
				return [
					"id",
					"warehouseId",
					"locationId",
					"skuId",
					"lotId",
					"state",
					"quantityAvailable",
					"updatedAt",
				];
			case "InventoryTransaction":
				return [
					"id",
					"createdAt",
					"warehouseId",
					"skuId",
					"lotId",
					"fromLocationId",
					"toLocationId",
					"quantity",
					"transactionType",
				];
			case "PurchaseOrder":
				return [
					"id",
					"createdAt",
					"warehouseId",
					"supplierId",
					"poNumber",
					"status",
				];
			case "PurchaseOrderItem":
				return [
					"id",
					"purchaseOrderId",
					"skuId",
					"orderedQty",
					"receivedQty",
				];
			case "AdvancedShippingNotice":
				return [
					"id",
					"createdAt",
					"warehouseId",
					"supplierId",
					"purchaseOrderId",
					"asnNumber",
					"status",
				];
			case "ASNItem":
				return ["id", "asnId", "skuId", "expectedQty", "receivedQty"];
			case "ReceivingOrder":
				return [
					"id",
					"createdAt",
					"warehouseId",
					"purchaseOrderId",
					"asnId",
					"status",
				];
			case "SalesOrder":
				return [
					"id",
					"orderedAt",
					"warehouseId",
					"customerId",
					"orderNumber",
					"status",
				];
			case "SalesOrderItem":
				return [
					"id",
					"salesOrderId",
					"skuId",
					"orderedQty",
					"allocatedQty",
				];
			case "Shipment":
				return [
					"id",
					"warehouseId",
					"salesOrderId",
					"shipmentNumber",
					"trackingNumber",
					"carrier",
					"dockDoorId",
					"scheduledAt",
					"notes",
					"shippedAt",
					"status",
				];
			default:
				return [];
		}
	}

	public initTable(table: SeedTable | string) {
		const filePath = path.join(this.dir, `${table}.csv`);
		const stream = fs.createWriteStream(filePath, { flags: "w" });
		const headers = this.getHeaders(table);
		stream.write(`${headers.join(",")}\n`);
		this.streams.set(table, stream);
	}

	public writeRow(table: string, row: Record<string, unknown>) {
		const stream = this.streams.get(table);
		if (!stream) {
			throw new Error(`Stream not initialized for table: ${table}`);
		}

		const headers = this.getHeaders(table);
		const values = headers.map((header) => {
			const val = row[header];
			if (val === null || val === undefined) {
				return "";
			}
			if (val instanceof Date) {
				return val.toISOString();
			}
			if (typeof val === "string") {
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

		stream.write(`${values.join(",")}\n`);
	}

	public closeAll() {
		for (const stream of this.streams.values()) {
			stream.end();
		}
	}
}
