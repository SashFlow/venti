import { db } from "../prisma";
import type { Prisma } from "../prisma/generated/client";
import { releaseAndOptimizeWave } from "./wave-routing-service";
import { createWarehouseTask } from "./tasks-service";
import {
	getDeadStockRebalanceOpportunities,
	getPredictiveDemandInsights,
} from "./insights-service";

export const AUTOPILOT_RULE_KEYS = [
	"low_stock_replenish",
	"wave_auto_release",
	"dead_stock_rebalance",
] as const;

export type AutopilotRuleKey = (typeof AUTOPILOT_RULE_KEYS)[number];

const DEFAULT_RULES: Array<{
	key: AutopilotRuleKey;
	name: string;
	config: Record<string, unknown>;
}> = [
	{
		key: "low_stock_replenish",
		name: "Low stock replenishment",
		config: { minQtyThreshold: 5 },
	},
	{
		key: "wave_auto_release",
		name: "Wave auto-release",
		config: { minLineCount: 5, pickerCount: 3 },
	},
	{
		key: "dead_stock_rebalance",
		name: "Dead stock rebalance",
		config: { minNetSavings: 0 },
	},
];

export async function ensureAutopilotRules(organizationId: string) {
	for (const rule of DEFAULT_RULES) {
		await db.autopilotRule.upsert({
			where: {
				organizationId_key: {
					organizationId,
					key: rule.key,
				},
			},
			create: {
				organizationId,
				key: rule.key,
				name: rule.name,
				enabled: true,
				config: rule.config as Prisma.InputJsonValue,
			},
			update: {},
		});
	}
}

export async function listAutopilotRules(organizationId: string) {
	await ensureAutopilotRules(organizationId);
	return db.autopilotRule.findMany({
		where: { organizationId },
		orderBy: { key: "asc" },
	});
}

export async function updateAutopilotRule(params: {
	organizationId: string;
	ruleId: string;
	enabled?: boolean;
	config?: Record<string, unknown>;
}) {
	const rule = await db.autopilotRule.findFirst({
		where: { id: params.ruleId, organizationId: params.organizationId },
	});
	if (!rule) {
		throw new Error("Rule not found.");
	}

	return db.autopilotRule.update({
		where: { id: rule.id },
		data: {
			...(params.enabled !== undefined ? { enabled: params.enabled } : {}),
			...(params.config
				? { config: params.config as Prisma.InputJsonValue }
				: {}),
		},
	});
}

async function getSystemUserId(organizationId: string) {
	const member = await db.member.findFirst({
		where: { organizationId },
		orderBy: { createdAt: "asc" },
	});
	return member?.userId;
}

async function runLowStockReplenish(
	organizationId: string,
	config: Record<string, unknown>,
) {
	const threshold = Number(config.minQtyThreshold ?? 5);
	const warehouses = await db.warehouse.findMany({
		where: { organizationId },
		select: { id: true, name: true },
	});

	for (const wh of warehouses) {
		const lowBalances = await db.inventoryBalance.findMany({
			where: {
				warehouseId: wh.id,
				state: "AVAILABLE",
				quantityAvailable: { lte: threshold },
			},
			include: {
				sku: { select: { id: true, code: true } },
				location: { select: { id: true, code: true } },
			},
			take: 1,
			orderBy: { quantityAvailable: "asc" },
		});

		if (lowBalances.length === 0) {
			continue;
		}

		const balance = lowBalances[0]!;
		const existing = await db.warehouseTask.findFirst({
			where: {
				warehouseId: wh.id,
				skuId: balance.skuId,
				type: "REPLENISHMENT",
				status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
			},
		});
		if (existing) {
			continue;
		}

		const qty = Math.max(
			10,
			Number(balance.quantityAvailable) < 1 ? 10 : 5,
		);

		await createWarehouseTask({
			organizationId,
			warehouseId: wh.id,
			type: "REPLENISHMENT",
			skuId: balance.skuId,
			quantity: qty,
			toLocationId: balance.locationId,
			priority: "HIGH",
		});

		return `Replenishment task created for ${balance.sku.code} at ${wh.name}`;
	}

	return "No low-stock SKUs requiring replenishment.";
}

async function runWaveAutoRelease(
	organizationId: string,
	config: Record<string, unknown>,
	userId: string,
) {
	const minLines = Number(config.minLineCount ?? 5);
	const pickerCount = Number(config.pickerCount ?? 3);

	const wave = await db.pickWave.findFirst({
		where: {
			status: "CREATED",
			warehouse: { organizationId },
		},
		include: { _count: { select: { lines: true } } },
		orderBy: { createdAt: "asc" },
	});

	if (!wave || wave._count.lines < minLines) {
		return "No eligible waves to auto-release.";
	}

	await releaseAndOptimizeWave({
		organizationId,
		waveId: wave.id,
		releasedByUserId: userId,
		pickerCount,
	});

	return `Auto-released wave ${wave.waveNumber} (${wave._count.lines} lines)`;
}

async function runDeadStockRebalance(organizationId: string) {
	const { opportunities } =
		await getDeadStockRebalanceOpportunities(organizationId);
	const opp = opportunities.find((o) => o.netSavings > 0) ?? opportunities[0];

	if (!opp) {
		return "No dead stock rebalance opportunities.";
	}

	const existing = await db.warehouseTask.findFirst({
		where: {
			warehouseId: opp.currentWarehouseId,
			skuId: opp.skuId,
			type: "MOVE",
			status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
		},
	});

	if (existing) {
		return `Move task already pending for ${opp.skuCode}.`;
	}

	await createWarehouseTask({
		organizationId,
		warehouseId: opp.currentWarehouseId,
		type: "MOVE",
		skuId: opp.skuId,
		quantity: opp.qtyToMove,
		fromLocationId: opp.fromLocationId,
		priority: "NORMAL",
	});

	return `Dead stock move task created for ${opp.skuCode} (${opp.currentWarehouse})`;
}

export async function runAutopilotRulesForOrg(params: {
	organizationId: string;
	userId?: string;
}) {
	await ensureAutopilotRules(params.organizationId);
	const rules = await db.autopilotRule.findMany({
		where: { organizationId: params.organizationId, enabled: true },
	});

	const userId =
		params.userId ?? (await getSystemUserId(params.organizationId));
	if (!userId) {
		throw new Error("No user available to run autopilot rules.");
	}

	const actions: string[] = [];

	for (const rule of rules) {
		const config = (rule.config as Record<string, unknown>) ?? {};
		let action = "No action taken.";

		try {
			if (rule.key === "low_stock_replenish") {
				action = await runLowStockReplenish(params.organizationId, config);
			} else if (rule.key === "wave_auto_release") {
				action = await runWaveAutoRelease(
					params.organizationId,
					config,
					userId,
				);
			} else if (rule.key === "dead_stock_rebalance") {
				action = await runDeadStockRebalance(params.organizationId);
			}

			await db.autopilotRule.update({
				where: { id: rule.id },
				data: {
					lastRunAt: new Date(),
					lastAction: action,
				},
			});

			if (!action.includes("No ")) {
				actions.push(`${rule.name}: ${action}`);
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Rule execution failed.";
			await db.autopilotRule.update({
				where: { id: rule.id },
				data: {
					lastRunAt: new Date(),
					lastAction: `Error: ${message}`,
				},
			});
		}
	}

	// Touch demand insights cache indirectly for demo freshness
	await getPredictiveDemandInsights(params.organizationId);

	return { actions };
}

export async function runAutopilotForAllOrgs() {
	const orgs = await db.autopilotRule.findMany({
		where: { enabled: true },
		select: { organizationId: true },
		distinct: ["organizationId"],
	});

	for (const { organizationId } of orgs) {
		try {
			await runAutopilotRulesForOrg({ organizationId });
		} catch {
			// continue other orgs
		}
	}
}
