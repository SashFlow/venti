import fs from "fs";
import path from "path";
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";
import { pipeline } from "stream/promises";
import { CONFIG } from "./config";
import { seedAdminUser } from "./seed-admin-user";
import { SEED_TABLES } from "./tables";

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
		await client.query(`
      TRUNCATE TABLE 
        ${SEED_TABLES.slice()
					.reverse()
					.map((t) => `"${t}"`)
					.join(", ")} 
      CASCADE;
    `);

		console.log("Loading CSV dumps...");
		for (const table of SEED_TABLES) {
			const filePath = path.join(CONFIG.OUTPUT_DIR, `${table}.csv`);

			if (!fs.existsSync(filePath)) {
				console.warn(`File not found: ${filePath}, skipping...`);
				continue;
			}

			const fileContent = fs.readFileSync(filePath, "utf8");
			const firstLine = fileContent.split("\n")[0];
			if (!firstLine) {
				continue;
			}

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

		console.log("Creating admin login user...");
		await seedAdminUser();
	} catch (error) {
		console.error("Error loading data:", error);
		process.exitCode = 1;
	} finally {
		await client.end();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
