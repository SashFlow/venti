import type { PrismaTx } from "./stock-ledger";

// Convert Prisma Decimal, number, or string → plain number
function n(v: { toString(): string } | number | string): number {
	return typeof v === "number" ? v : Number.parseFloat(v.toString());
}

type AddCostLayerParams = {
	organizationId: string;
	variantId: string;
	warehouseId: string;
	qty: { toString(): string } | number;
	/** Base purchase cost per unit (excluding landed costs) */
	costPerUnit: { toString(): string } | number;
	/** Per-unit landed cost component (freight + insurance + customs allocated per unit) */
	landedCost?: { toString(): string } | number;
	grnId?: string;
};

/**
 * Create a FIFO cost layer when stock arrives (GRN completion).
 * totalCost = qty × (costPerUnit + landedCost)
 */
export async function addCostLayer(
	tx: PrismaTx,
	params: AddCostLayerParams,
): Promise<void> {
	const qty = n(params.qty);
	const costPerUnit = n(params.costPerUnit);
	const landedCost = params.landedCost != null ? n(params.landedCost) : 0;
	const totalCost = qty * (costPerUnit + landedCost);

	await tx.costLayer.create({
		data: {
			organizationId: params.organizationId,
			variantId: params.variantId,
			warehouseId: params.warehouseId,
			qty,
			costPerUnit,
			landedCost,
			totalCost,
			grnId: params.grnId,
			depleted: false,
		},
	});
}

type DepleteStockParams = {
	organizationId: string;
	variantId: string;
	warehouseId: string;
	qty: { toString(): string } | number;
};

/**
 * FIFO depletion: consume qty from oldest non-depleted cost layers.
 * Returns the weighted-average cost of the depleted quantity — used to
 * populate StockLedger.costPerUnit for PICK / SCRAP / TRANSFER_OUT entries.
 *
 * If there are no cost layers (edge case), returns zero cost without throwing.
 */
export async function depleteStock(
	tx: PrismaTx,
	params: DepleteStockParams,
): Promise<{ totalCost: number; avgCostPerUnit: number }> {
	let remainingQty = n(params.qty);
	let totalCost = 0;
	let totalQtyConsumed = 0;

	const layers = await tx.costLayer.findMany({
		where: {
			organizationId: params.organizationId,
			variantId: params.variantId,
			warehouseId: params.warehouseId,
			depleted: false,
		},
		orderBy: { createdAt: "asc" },
	});

	for (const layer of layers) {
		if (remainingQty <= 0) break;

		const layerQty = n(layer.qty);
		const effectiveCostPerUnit = n(layer.costPerUnit) + n(layer.landedCost);

		if (layerQty <= remainingQty) {
			// Consume entire layer
			totalCost += n(layer.totalCost);
			totalQtyConsumed += layerQty;
			remainingQty -= layerQty;

			await tx.costLayer.update({
				where: { id: layer.id },
				data: { depleted: true, qty: 0, totalCost: 0 },
			});
		} else {
			// Partial consumption
			const costForThisQty = remainingQty * effectiveCostPerUnit;
			totalCost += costForThisQty;
			totalQtyConsumed += remainingQty;

			const newQty = layerQty - remainingQty;
			const newTotalCost = newQty * effectiveCostPerUnit;

			await tx.costLayer.update({
				where: { id: layer.id },
				data: { qty: newQty, totalCost: newTotalCost },
			});

			remainingQty = 0;
		}
	}

	const avgCostPerUnit =
		totalQtyConsumed > 0 ? totalCost / totalQtyConsumed : 0;

	return { totalCost, avgCostPerUnit };
}

type UpdateProductCostParams = {
	organizationId: string;
	variantId: string;
	warehouseId: string;
};

/**
 * Recompute ProductCost from the current non-depleted cost layers.
 * Call after every GRN completion, stock adjustment, or landed cost change.
 * No-op if there are no remaining layers (keeps last known cost).
 */
export async function updateProductCost(
	tx: PrismaTx,
	params: UpdateProductCostParams,
): Promise<void> {
	const layers = await tx.costLayer.findMany({
		where: {
			organizationId: params.organizationId,
			variantId: params.variantId,
			warehouseId: params.warehouseId,
			depleted: false,
		},
	});

	if (layers.length === 0) return;

	let totalQty = 0;
	let totalCost = 0;
	let totalLandedCost = 0;

	for (const layer of layers) {
		const qty = n(layer.qty);
		totalQty += qty;
		totalCost += n(layer.totalCost);
		totalLandedCost += n(layer.landedCost) * qty;
	}

	const costPerUnit = totalQty > 0 ? totalCost / totalQty : 0;
	const landedCostPerUnit = totalQty > 0 ? totalLandedCost / totalQty : 0;

	const existing = await tx.productCost.findUnique({
		where: {
			organizationId_variantId_warehouseId: {
				organizationId: params.organizationId,
				variantId: params.variantId,
				warehouseId: params.warehouseId,
			},
		},
	});

	if (existing) {
		const sellingPrice = existing.sellingPrice
			? n(existing.sellingPrice)
			: null;
		const marginPct =
			sellingPrice != null && sellingPrice > 0
				? ((sellingPrice - costPerUnit) / sellingPrice) * 100
				: null;

		await tx.productCost.update({
			where: { id: existing.id },
			data: {
				costPerUnit,
				landedCost: landedCostPerUnit,
				marginPct,
			},
		});
	} else {
		await tx.productCost.create({
			data: {
				organizationId: params.organizationId,
				variantId: params.variantId,
				warehouseId: params.warehouseId,
				costPerUnit,
				landedCost: landedCostPerUnit,
			},
		});
	}
}

/**
 * Update landed cost component for all cost layers associated with a GRN.
 * Called after upsert-landed-cost to propagate allocation to existing layers.
 */
export async function updateLandedCostForGrn(
	tx: PrismaTx,
	params: {
		organizationId: string;
		grnId: string;
		/** Map of variantId → per-unit landed cost */
		perUnitLandedCosts: Map<string, number>;
	},
): Promise<void> {
	const layers = await tx.costLayer.findMany({
		where: {
			organizationId: params.organizationId,
			grnId: params.grnId,
			depleted: false,
		},
	});

	for (const layer of layers) {
		const perUnitLanded = params.perUnitLandedCosts.get(layer.variantId);
		if (perUnitLanded == null) continue;

		const qty = n(layer.qty);
		const newTotalCost = qty * (n(layer.costPerUnit) + perUnitLanded);

		await tx.costLayer.update({
			where: { id: layer.id },
			data: {
				landedCost: perUnitLanded,
				totalCost: newTotalCost,
			},
		});

		await updateProductCost(tx, {
			organizationId: params.organizationId,
			variantId: layer.variantId,
			warehouseId: layer.warehouseId,
		});
	}
}
