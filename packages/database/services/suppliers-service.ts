import { db } from "../prisma";
import type { Prisma } from "../prisma/generated/client";

const supplierSelect = {
	id: true,
	organizationId: true,
	name: true,
	email: true,
	phone: true,

	metadata: true,
	createdAt: true,
} satisfies Prisma.SupplierSelect;

type ListSuppliersInput = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

type SupplierPayload = {
	name: string;
	email?: string;
	phone?: string;
	defaultLeadTimeDays?: number;
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
		return { organizationId } satisfies Prisma.SupplierWhereInput;
	}

	return {
		organizationId,
		OR: [
			{ name: { contains: trimmedQuery, mode: "insensitive" } },
			{ email: { contains: trimmedQuery, mode: "insensitive" } },
		],
	} satisfies Prisma.SupplierWhereInput;
}

export async function listSuppliers(input: ListSuppliersInput) {
	const where = buildWhere({
		organizationId: input.organizationId,
		query: input.query,
	});

	const [suppliers, total] = await Promise.all([
		db.supplier.findMany({
			where,
			select: supplierSelect,
			take: input.limit,
			skip: input.offset,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.supplier.count({ where }),
	]);

	return {
		suppliers,
		total,
	};
}

export async function getSupplierById(params: {
	organizationId: string;
	id: string;
}) {
	return db.supplier.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: supplierSelect,
	});
}

export async function createSupplier(params: {
	organizationId: string;
	data: SupplierPayload;
}) {
	return db.supplier.create({
		data: {
			organizationId: params.organizationId,
			...params.data,
		},
		select: supplierSelect,
	});
}

export async function updateSupplier(params: {
	organizationId: string;
	id: string;
	data: Partial<SupplierPayload>;
}) {
	const existing = await db.supplier.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: { id: true },
	});

	if (!existing) {
		return null;
	}

	return db.supplier.update({
		where: {
			id: params.id,
		},
		data: params.data,
		select: supplierSelect,
	});
}

export async function deleteSupplier(params: {
	organizationId: string;
	id: string;
}) {
	const result = await db.supplier.deleteMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
	});

	return result.count > 0;
}
