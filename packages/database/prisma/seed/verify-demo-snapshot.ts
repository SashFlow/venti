import { db } from "../client";
import { CONFIG } from "./config";

async function verifyDemoSnapshot() {
	const org = await db.organization.findFirst({
		where: { name: CONFIG.ORG_NAME },
	});
	if (!org) {
		throw new Error("Organization not found.");
	}

	const errors: string[] = [];

	const openPoCount = await db.purchaseOrder.count({
		where: {
			poNumber: CONFIG.DEMO_PO_OPEN,
			status: { in: ["APPROVED", "IN_TRANSIT", "PARTIAL"] },
			warehouse: { organizationId: org.id },
		},
	});
	if (openPoCount < 1) {
		errors.push("Open demo PO not found.");
	}

	const summerSo = await db.salesOrder.findFirst({
		where: {
			orderNumber: CONFIG.DEMO_SO_SUMMER,
			status: "ALLOCATED",
			warehouse: { organizationId: org.id },
		},
		include: { items: true },
	});
	if (!summerSo || summerSo.items.length < 12) {
		errors.push("Summer spike SO missing or has fewer than 12 lines.");
	}
	const unpickedLines =
		summerSo?.items.filter((i) => Number(i.pickedQty) === 0).length ?? 0;
	if (unpickedLines < 12) {
		errors.push("Summer SO lines are not all unpicked.");
	}

	const draftWave = await db.pickWave.findFirst({
		where: {
			waveNumber: CONFIG.DEMO_WAVE_DRAFT,
			status: "CREATED",
			warehouse: { organizationId: org.id },
		},
		include: { _count: { select: { lines: true } } },
	});
	if (!draftWave || draftWave._count.lines < 5) {
		errors.push("Draft wave missing or has fewer than 5 lines.");
	}

	if (CONFIG.DEMO_PRERELEASE_WAVE) {
		const pickWave = await db.pickWave.findFirst({
			where: {
				waveNumber: CONFIG.DEMO_WAVE_PICK,
				status: "RELEASED",
				warehouse: { organizationId: org.id },
			},
		});
		if (!pickWave?.routePlan) {
			errors.push("Pre-released pick wave missing routePlan.");
		}
	}

	const openReturn = await db.returnOrder.findFirst({
		where: {
			returnNumber: CONFIG.DEMO_RMA_OPEN,
			status: { in: ["RECEIVED", "INSPECTING"] },
			warehouse: { organizationId: org.id },
		},
		include: { items: true },
	});
	if (!openReturn || openReturn.items.some((i) => i.disposition !== null)) {
		errors.push("Open demo return missing or already dispositioned.");
	}

	const compSku = await db.sKU.findFirst({
		where: {
			code: CONFIG.DEMO_SKU_COMPRESSOR,
			product: { organizationId: org.id },
		},
	});
	if (!compSku) {
		errors.push(`${CONFIG.DEMO_SKU_COMPRESSOR} SKU not found.`);
	} else {
		type VelocityRow = { ship_qty_30d: number; on_hand: number };
		const rows = await db.$queryRaw<VelocityRow[]>`
			WITH velocity AS (
				SELECT COALESCE(SUM(ABS(it.quantity::float)), 0) AS ship_qty_30d
				FROM "InventoryTransaction" it
				INNER JOIN "Warehouse" w ON w.id = it."warehouseId"
				WHERE w."organizationId" = ${org.id}
				  AND it."skuId" = ${compSku.id}
				  AND it."transactionType" = 'SHIP'
				  AND it."createdAt" >= NOW() - INTERVAL '30 days'
			),
			on_hand AS (
				SELECT COALESCE(SUM(ib."quantityAvailable"::float), 0) AS on_hand
				FROM "InventoryBalance" ib
				INNER JOIN "Warehouse" w ON w.id = ib."warehouseId"
				WHERE w."organizationId" = ${org.id}
				  AND ib."skuId" = ${compSku.id}
				  AND ib.state = 'AVAILABLE'
			)
			SELECT v.ship_qty_30d, oh.on_hand FROM velocity v, on_hand oh
		`;
		const row = rows[0];
		if (!row || row.ship_qty_30d <= 0) {
			errors.push("COMP-400A has no recent ship velocity.");
		}
		if (row && row.on_hand > 14) {
			errors.push("COMP-400A on-hand too high for stockout insight.");
		}
	}

	const recentShipments = await db.shipment.count({
		where: {
			shippedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
			warehouse: { organizationId: org.id },
			status: "SHIPPED",
		},
	});
	if (recentShipments < 1) {
		errors.push("No shipments in the last 7 days.");
	}

	const pendingMove = await db.warehouseTask.count({
		where: {
			type: "MOVE",
			status: { in: ["PENDING", "ASSIGNED"] },
			warehouse: { organizationId: org.id },
		},
	});
	if (pendingMove < 1) {
		errors.push("No pending MOVE tasks for AGV demo.");
	}

	if (errors.length > 0) {
		console.error("Demo snapshot verification FAILED:");
		for (const e of errors) {
			console.error(`  - ${e}`);
		}
		process.exit(1);
	}

	console.log("Demo snapshot verification passed.");
}

verifyDemoSnapshot().catch((err) => {
	console.error(err);
	process.exit(1);
});
