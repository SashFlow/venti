import fs from "fs";
import path from "path";
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";
import { pipeline } from "stream/promises";
import { CONFIG } from "./config";

// Must match the exact order of files generated
const TABLES_IN_ORDER = [
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

async function main() {
	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) {
		throw new Error("DATABASE_URL is not set in the environment");
	}

	console.log("Connecting to database...");
	const client = new Client({ connectionString: dbUrl });
	await client.connect();

	try {
		console.log("Disabling constraints & wiping existing data...");
		// Wipe everything (truncate in reverse order or just CASCADE)
		await client.query(`
      TRUNCATE TABLE 
        ${TABLES_IN_ORDER.slice()
			.reverse()
			.map((t) => `"${t}"`)
			.join(", ")} 
      CASCADE;
    `);

		console.log("Loading CSV dumps...");
		for (const table of TABLES_IN_ORDER) {
			const filePath = path.join(CONFIG.OUTPUT_DIR, `${table}.csv`);

			if (!fs.existsSync(filePath)) {
				console.warn(`File not found: ${filePath}, skipping...`);
				continue;
			}

			// Read header to specify columns in COPY command
			const fileContent = fs.readFileSync(filePath, "utf8");
			const firstLine = fileContent.split("\n")[0];
			if (!firstLine) continue;

			const columns = firstLine
				.split(",")
				.map((c) => `"${c.trim()}"`)
				.join(", ");

			console.log(`Loading table: ${table} (${filePath})...`);

			const stream = client.query(
				copyFrom(
					`COPY "${table}" (${columns}) FROM STDIN WITH (FORMAT csv, HEADER true)`,
				),
			);

			const fileStream = fs.createReadStream(filePath);

			await pipeline(fileStream, stream);

			console.log(`✅ Loaded ${table}`);
		}

		console.log("Data loading complete!");
	} catch (error) {
		console.error("Error loading data:", error);
	} finally {
		await client.end();
	}
}

main().catch(console.error);
