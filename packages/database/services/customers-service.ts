import { db } from "../prisma";
import type { Prisma } from "../prisma/generated/client";

const customerSelect = {
	id: true,
	organizationId: true,
	code: true,
	name: true,
	email: true,
	phone: true,
	isWholesaler: true,
	notes: true,
	metadata: true,
	createdAt: true,
} satisfies Prisma.CustomerSelect;

type ListCustomersInput = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

type CustomerPayload = {
	code: string;
	name: string;
	email?: string;
	phone?: string;
	isWholesaler?: boolean;
	notes?: string;
	metadata?: Prisma.InputJsonValue;
};

function buildWhere({
	organizationId,
	query,
}: {
	organizationId: string;
	query?: string;
}) {
	const trimmedQuery = query?.trim();

	if (!trimmedQuery) {
		return { organizationId } satisfies Prisma.CustomerWhereInput;
	}

	return {
		organizationId,
		OR: [
			{ name: { contains: trimmedQuery, mode: "insensitive" } },
			{ email: { contains: trimmedQuery, mode: "insensitive" } },
			{ phone: { contains: trimmedQuery, mode: "insensitive" } },
		],
	} satisfies Prisma.CustomerWhereInput;
}

export async function listCustomers(input: ListCustomersInput) {
	const where = buildWhere({
		organizationId: input.organizationId,
		query: input.query,
	});

	const [customers, total] = await Promise.all([
		db.customer.findMany({
			where,
			select: customerSelect,
			take: input.limit,
			skip: input.offset,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.customer.count({ where }),
	]);

	return {
		customers,
		total,
	};
}

export async function getCustomerById(params: {
	organizationId: string;
	id: string;
}) {
	return db.customer.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: customerSelect,
	});
}

export async function createCustomer(params: {
	organizationId: string;
	data: CustomerPayload;
}) {
	return db.customer.create({
		data: {
			organizationId: params.organizationId,
			...params.data,
		},
		select: customerSelect,
	});
}

export async function updateCustomer(params: {
	organizationId: string;
	id: string;
	data: Partial<CustomerPayload>;
}) {
	const existing = await db.customer.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: { id: true },
	});

	if (!existing) {
		return null;
	}

	return db.customer.update({
		where: {
			id: params.id,
		},
		data: params.data,
		select: customerSelect,
	});
}

export async function deleteCustomer(params: {
	organizationId: string;
	id: string;
}) {
	const result = await db.customer.deleteMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
	});

	return result.count > 0;
}

// ============================================================================
// CUSTOMER LOCATIONS
// ============================================================================

const customerLocationSelect = {
	id: true,
	customerId: true,
	organizationId: true,
	name: true,
	isDefault: true,
	notes: true,
	createdAt: true,
	updatedAt: true,
	address: {
		select: {
			id: true,
			addressLine1: true,
			addressLine2: true,
			city: true,
			state: true,
			zip: true,
			country: true,
		},
	},
} satisfies Prisma.CustomerLocationSelect;

export async function listCustomerLocations(params: {
	organizationId: string;
	customerId: string;
}) {
	const locations = await db.customerLocation.findMany({
		where: {
			customerId: params.customerId,
			organizationId: params.organizationId,
		},
		select: customerLocationSelect,
		orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
	});

	return { locations };
}

type AddressPayload = {
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	zip: string;
	country: string;
};

export async function createCustomerLocation(params: {
	organizationId: string;
	customerId: string;
	name: string;
	isDefault?: boolean;
	notes?: string;
	address: AddressPayload;
}) {
	return db.$transaction(async (tx) => {
		if (params.isDefault) {
			await tx.customerLocation.updateMany({
				where: {
					customerId: params.customerId,
					organizationId: params.organizationId,
					isDefault: true,
				},
				data: { isDefault: false },
			});
		}

		const address = await tx.address.create({
			data: params.address,
		});

		const location = await tx.customerLocation.create({
			data: {
				customerId: params.customerId,
				organizationId: params.organizationId,
				addressId: address.id,
				name: params.name,
				isDefault: params.isDefault ?? false,
				notes: params.notes,
			},
			select: customerLocationSelect,
		});

		return { location };
	});
}

export async function updateCustomerLocation(params: {
	organizationId: string;
	customerId: string;
	id: string;
	name?: string;
	isDefault?: boolean;
	notes?: string;
	address?: Partial<AddressPayload>;
}) {
	return db.$transaction(async (tx) => {
		const existing = await tx.customerLocation.findFirst({
			where: {
				id: params.id,
				customerId: params.customerId,
				organizationId: params.organizationId,
			},
			select: { id: true, addressId: true },
		});

		if (!existing) {
			return null;
		}

		if (params.isDefault) {
			await tx.customerLocation.updateMany({
				where: {
					customerId: params.customerId,
					organizationId: params.organizationId,
					isDefault: true,
					id: { not: params.id },
				},
				data: { isDefault: false },
			});
		}

		if (params.address && Object.keys(params.address).length > 0) {
			await tx.address.update({
				where: { id: existing.addressId },
				data: params.address,
			});
		}

		const location = await tx.customerLocation.update({
			where: { id: params.id },
			data: {
				...(params.name !== undefined && { name: params.name }),
				...(params.isDefault !== undefined && {
					isDefault: params.isDefault,
				}),
				...(params.notes !== undefined && { notes: params.notes }),
			},
			select: customerLocationSelect,
		});

		return { location };
	});
}

export async function deleteCustomerLocation(params: {
	organizationId: string;
	customerId: string;
	id: string;
}) {
	return db.$transaction(async (tx) => {
		const existing = await tx.customerLocation.findFirst({
			where: {
				id: params.id,
				customerId: params.customerId,
				organizationId: params.organizationId,
			},
			select: { id: true, addressId: true },
		});

		if (!existing) {
			return false;
		}

		await tx.customerLocation.delete({ where: { id: params.id } });
		await tx.address.delete({ where: { id: existing.addressId } });

		return true;
	});
}
