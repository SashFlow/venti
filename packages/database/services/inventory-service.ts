import { db as prisma } from "../prisma";

export async function listInventoryBalances(input: {
	organizationId: string;
	warehouseId?: string;
	locationId?: string;
	skuId?: string;
	lotId?: string;
	state?: any;
}) {
	const balances = await prisma.inventoryBalance.findMany({
		where: {
			warehouse: { organizationId: input.organizationId },
			warehouseId: input.warehouseId,
			locationId: input.locationId,
			skuId: input.skuId,
			lotId: input.lotId,
			state: input.state,
		},
		include: {
			sku: true,
			location: true,
			lot: true,
		},
		orderBy: {
			location: { code: "asc" },
		},
	});
	return balances;
}

export async function getInventoryTimeline(input: {
	organizationId: string;
	warehouseId?: string;
	skuId?: string;
	limit: number;
}) {
	const transactions = await prisma.inventoryTransaction.findMany({
		where: {
			warehouse: { organizationId: input.organizationId },
			warehouseId: input.warehouseId,
			skuId: input.skuId,
		},
		include: {
			sku: true,
			toLocation: true,
			performedBy: true,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: input.limit,
	});
	return transactions;
}

export async function adjustInventory(input: {
	organizationId: string;
	warehouseId: string;
	locationId: string;
	skuId: string;
	quantityChange: number;
	reason: string;
	userId: string;
}) {
	const warehouse = await prisma.warehouse.findUnique({
		where: { id: input.warehouseId, organizationId: input.organizationId },
	});
	if (!warehouse) throw new Error("Warehouse not found");

	// Prisma transaction to update balance and record history
	return await prisma.$transaction(async (tx) => {
		// Get existing balance
		const existing = await tx.inventoryBalance.findFirst({
			where: {
				warehouseId: input.warehouseId,
				locationId: input.locationId,
				skuId: input.skuId,
				state: "AVAILABLE",
			},
		});

		let balance;
		if (existing) {
			balance = await tx.inventoryBalance.update({
				where: { id: existing.id },
				data: {
					quantityAvailable: { increment: input.quantityChange },
				},
			});
		} else {
			balance = await tx.inventoryBalance.create({
				data: {
					warehouseId: input.warehouseId,
					locationId: input.locationId,
					skuId: input.skuId,
					state: "AVAILABLE",
					quantityAvailable: input.quantityChange,
				},
			});
		}

		// Create transaction log
		await tx.inventoryTransaction.create({
			data: {
				warehouseId: input.warehouseId,
				toLocationId: input.locationId,
				skuId: input.skuId,
				performedById: input.userId,
				transactionType: "ADJUSTMENT",
				quantity: input.quantityChange,
				metadata: { notes: input.reason },
			},
		});

		return balance;
	});
}
