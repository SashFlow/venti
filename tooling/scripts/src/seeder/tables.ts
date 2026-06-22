/** Load order — table names match PostgreSQL (Prisma @@map or model name). */
export const SEED_TABLES = [
	"organization",
	"user",
	"address",
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
] as const;

export type SeedTable = (typeof SEED_TABLES)[number];
