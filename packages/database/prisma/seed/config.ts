import path from "path";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const CONFIG = {
	CREATE_ADMIN: true,
	NAME: "Admin",
	EMAIL: "sahil@sashflow.com",
	PASSWORD: "Sahil@123",
	ORG_NAME: "Daikin",

	NUM_WAREHOUSES: 5,
	ORDERS_PER_DAY: 50,
	RECEIPTS_PER_DAY: 10,
	OUTPUT_DIR: path.resolve(__dirname, "../../.data-dump"),

	NUM_ORGANIZATIONS: 1,
	NUM_USERS_PER_ORG: 10,
	NUM_SUPPLIERS: 20,
	NUM_CUSTOMERS: 100,
	PRODUCTS: 10,
	NUM_SKUS_PER_PRODUCT: 20,
	NUM_CATEGORIES: 10,

	FLOOR_WIDTH_MM: 100000,
	FLOOR_LENGTH_MM: 150000,

	SKU_TYPE_PROBS: {
		SERIALIZED: 0.4,
		BATCH_TRACKED: 0.1,
		BULK: 0.6,
	},

	// Simulation window (historical engine ends before snapshot gap)
	HISTORICAL_YEARS: 2,
	HISTORICAL_END_OFFSET_DAYS: 90,
	FLUSH_TX_THRESHOLD: 500,

	DEMO_WAREHOUSE_CODE: "HYD-01",
	DEMO_PRERELEASE_WAVE: true,
	SKIP_HISTORICAL: process.env.SKIP_HISTORICAL === "true",

	// Pinned demo entity numbers
	DEMO_PO_OPEN: "PO-DEMO-RCV-001",
	DEMO_PO_PARTIAL: "PO-DEMO-RCV-002",
	DEMO_SO_SUMMER: "SO-SUMMER-SPIKE-2026",
	DEMO_WAVE_DRAFT: "WAVE-DEMO-DRAFT",
	DEMO_WAVE_PICK: "WAVE-DEMO-PICK",
	DEMO_RMA_OPEN: "RMA-DEMO-001",
	DEMO_RMA_INSPECT: "RMA-DEMO-002",
	DEMO_SKU_COMPRESSOR: "COMP-400A",
};

export function getHistoricalSimulationDates(now = new Date()) {
	const end = new Date(
		now.getTime() - CONFIG.HISTORICAL_END_OFFSET_DAYS * MS_PER_DAY,
	);
	const start = new Date(
		end.getTime() - CONFIG.HISTORICAL_YEARS * 365 * MS_PER_DAY,
	);
	return { start, end };
}
