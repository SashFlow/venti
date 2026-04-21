import { ORPCError } from "@orpc/client";
import type { db } from "@repo/database";

export type PrismaTx = Parameters<
	Parameters<(typeof db)["$transaction"]>[0]
>[0];

// Convert Prisma Decimal, number, or string → plain number
function n(v: { toString(): string } | number | string): number {
	return typeof v === "number" ? v : Number.parseFloat(v.toString());
}

type RecordMovementParams = {
	organizationId: string;
	warehouseId: string;
	variantId: string;
	binId?: string;
	/** "RECEIPT" | "PICK" | "RETURN" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "SCRAP" | "INITIAL" */
	movementType: string;
	/** Positive = stock in, Negative = stock out */
	qty: { toString(): string } | number;
	costPerUnit?: { toString(): string } | number | null;
	totalCost?: { toString(): string } | number | null;
	referenceType?: string;
	referenceId?: string;
	batchLotId?: string;
	serialNumberId?: string;
	palletId?: string;
	performedById?: string;
	note?: string;
};

/**
 * Write one immutable StockLedger row for every inventory movement.
 * Does NOT update StockLevel — call adjustStockLevel separately (or together
 * inside a transaction).
 */
export async function recordMovement(
	tx: PrismaTx,
	params: RecordMovementParams,
): Promise<void> {
	const qty = n(params.qty);
	const costPerUnit =
		params.costPerUnit != null ? n(params.costPerUnit) : null;
	const totalCost =
		params.totalCost != null
			? n(params.totalCost)
			: costPerUnit != null
				? qty * costPerUnit
				: null;

	await tx.stockLedger.create({
		data: {
			organizationId: params.organizationId,
			warehouseId: params.warehouseId,
			variantId: params.variantId,
			binId: params.binId,
			movementType: params.movementType,
			qty,
			costPerUnit,
			totalCost,
			referenceType: params.referenceType,
			referenceId: params.referenceId,
			batchLotId: params.batchLotId,
			serialNumberId: params.serialNumberId,
			palletId: params.palletId,
			performedById: params.performedById,
			note: params.note,
		},
	});
}

type AdjustStockLevelParams = {
	organizationId: string;
	warehouseId: string;
	binId: string;
	variantId: string;
	/** Positive = incoming, Negative = outgoing */
	qtyDelta: { toString(): string } | number;
	/** Positive = reserving stock, Negative = releasing/fulfilling reservation */
	qtyReservedDelta?: { toString(): string } | number;
};

/**
 * Upsert StockLevel row, keeping qtyAvailable = qtyOnHand - qtyReserved in sync.
 * Throws ORPCError("CONFLICT") if the operation would result in negative qtyOnHand
 * or negative qtyReserved.
 */
export async function adjustStockLevel(
	tx: PrismaTx,
	params: AdjustStockLevelParams,
): Promise<void> {
	const qtyDelta = n(params.qtyDelta);
	const qtyReservedDelta =
		params.qtyReservedDelta != null ? n(params.qtyReservedDelta) : 0;

	const existing = await tx.stockLevel.findUnique({
		where: {
			organizationId_warehouseId_binId_variantId: {
				organizationId: params.organizationId,
				warehouseId: params.warehouseId,
				binId: params.binId,
				variantId: params.variantId,
			},
		},
	});

	if (existing) {
		const newQtyOnHand = n(existing.qtyOnHand) + qtyDelta;
		const newQtyReserved = n(existing.qtyReserved) + qtyReservedDelta;

		if (newQtyOnHand < 0) {
			throw new ORPCError(
				"CONFLICT",
				"Insufficient stock: operation would result in negative inventory",
			);
		}
		if (newQtyReserved < 0) {
			throw new ORPCError(
				"CONFLICT",
				"Cannot release more than reserved quantity",
			);
		}

		const newQtyAvailable = newQtyOnHand - newQtyReserved;

		await tx.stockLevel.update({
			where: { id: existing.id },
			data: {
				qtyOnHand: newQtyOnHand,
				qtyReserved: newQtyReserved,
				qtyAvailable: newQtyAvailable,
			},
		});
	} else {
		if (qtyDelta < 0) {
			throw new ORPCError(
				"CONFLICT",
				"Cannot decrease stock: no existing stock level found",
			);
		}

		const qtyOnHand = qtyDelta;
		const qtyReserved = qtyReservedDelta > 0 ? qtyReservedDelta : 0;
		const qtyAvailable = qtyOnHand - qtyReserved;

		await tx.stockLevel.create({
			data: {
				organizationId: params.organizationId,
				warehouseId: params.warehouseId,
				binId: params.binId,
				variantId: params.variantId,
				qtyOnHand,
				qtyReserved,
				qtyAvailable,
			},
		});
	}
}
