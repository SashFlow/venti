import path from "path";

export const CONFIG = {
	START_DATE: new Date("2022-04-01T00:00:00Z"),
	END_DATE: new Date("2026-05-21T00:00:00Z"),
	NUM_WAREHOUSES: 2,
	ORDERS_PER_DAY: 50,
	RECEIPTS_PER_DAY: 10,
	OUTPUT_DIR: path.resolve(__dirname, "../../.data-dump"),

	// Ratios / Counts
	NUM_ORGANIZATIONS: 1, // Focus on single tenant for simpler reporting (can scale later)
	NUM_USERS_PER_ORG: 10,
	NUM_SUPPLIERS: 10,
	NUM_CUSTOMERS: 50,
	NUM_SKUS: 200,
	NUM_CATEGORIES: 10,

	// Warehouse Dimensions
	FLOOR_WIDTH_MM: 100000, // 100 meters
	FLOOR_LENGTH_MM: 150000, // 150 meters -> 15,000 sq meters

	// Data probabilities
	SKU_TYPE_PROBS: {
		SERIALIZED: 0.1, // 10% of SKUs are individually serialized
		BATCH_TRACKED: 0.3, // 30% are batch tracked (e.g. food/med)
		BULK: 0.6, // 60% are generic bulk
	},
};
