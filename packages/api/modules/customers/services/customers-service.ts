import { db } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";

const customerSelect = {
	id: true,
	organizationId: true,
	name: true,
	email: true,
	phone: true,
	isWholesaler: true,
	notes: true,
	lastOrderAt: true,
	totalOrders: true,
	metadata: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.CustomerSelect;

type ListCustomersInput = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

type CustomerPayload = {
	name: string;
	email?: string;
	phone?: string;
	isWholesaler?: boolean;
	notes?: string;
	lastOrderAt?: Date;
	totalOrders?: number;
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
