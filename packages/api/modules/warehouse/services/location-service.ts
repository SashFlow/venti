import { prisma } from "@repo/database";

export async function listLocations(input: {
	organizationId: string;
	warehouseId: string;
}) {
	const locations = await prisma.location.findMany({
		where: {
			warehouseId: input.warehouseId,
			warehouse: {
				organizationId: input.organizationId,
			},
		},
		orderBy: [
			{ parentLocationId: "asc" },
			{ sequence: "asc" },
			{ code: "asc" },
		],
	});
	return locations;
}

export async function updateLocationHierarchy(input: {
	organizationId: string;
	warehouseId: string;
	updates: {
		id: string;
		parentLocationId: string | null;
		sequence: number;
	}[];
}) {
	const warehouse = await prisma.warehouse.findUnique({
		where: {
			id: input.warehouseId,
			organizationId: input.organizationId,
		},
	});

	if (!warehouse) {
		throw new Error("Warehouse not found or access denied");
	}

	const transactions = input.updates.map((update) =>
		prisma.location.update({
			where: {
				id: update.id,
				warehouseId: input.warehouseId,
			},
			data: {
				parentLocationId: update.parentLocationId,
				sequence: update.sequence,
			},
		}),
	);

	await prisma.$transaction(transactions);

	return { success: true };
}

export async function createLocation(input: {
	organizationId: string;
	warehouseId: string;
	parentLocationId?: string;
	code: string;
	name?: string;
	type: any;
	barcode?: string;
}) {
	const warehouse = await prisma.warehouse.findUnique({
		where: {
			id: input.warehouseId,
			organizationId: input.organizationId,
		},
	});

	if (!warehouse) {
		throw new Error("Warehouse not found or access denied");
	}

	return prisma.location.create({
		data: {
			warehouseId: input.warehouseId,
			parentLocationId: input.parentLocationId || null,
			code: input.code,
			name: input.name,
			type: input.type,
			barcode: input.barcode,
		},
	});
}

export async function deleteLocation(input: {
	organizationId: string;
	warehouseId: string;
	locationId: string;
}) {
	const location = await prisma.location.findUnique({
		where: {
			id: input.locationId,
			warehouse: { organizationId: input.organizationId },
		},
	});

	if (!location) {
		throw new Error("Location not found");
	}

	return prisma.location.delete({
		where: { id: input.locationId },
	});
}
