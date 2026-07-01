import {
	deriveEntityCode,
	getMetadataCode,
	mergeMetadataWithCode,
} from "../lib/metadata-code";
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

const supplierListSelect = {
	...supplierSelect,
	purchaseOrders: {
		where: {
			status: {
				notIn: ["RECEIVED", "CANCELLED"],
			},
		},
		select: {
			id: true,
		},
	},
} satisfies Prisma.SupplierSelect;

type SupplierRow = Prisma.SupplierGetPayload<{ select: typeof supplierSelect }>;
type SupplierListRow = Prisma.SupplierGetPayload<{
	select: typeof supplierListSelect;
}>;

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
	code?: string;
};

export function getSupplierCode(supplier: {
	name: string;
	metadata: unknown;
}): string {
	return getMetadataCode(supplier.metadata, supplier.name);
}

export function buildSupplierMetadataWithCode(
	metadata: Prisma.InputJsonValue | undefined,
	code: string,
): Prisma.InputJsonValue {
	return mergeMetadataWithCode(metadata, code);
}

function enrichSupplier<T extends SupplierRow>(supplier: T) {
	return {
		...supplier,
		code: getSupplierCode(supplier),
	};
}

function enrichSupplierList(supplier: SupplierListRow) {
	const { purchaseOrders, ...rest } = supplier;

	return {
		...enrichSupplier(rest),
		openOrderCount: purchaseOrders.length,
	};
}

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

async function findSupplierByCode(params: {
	organizationId: string;
	code: string;
	excludeId?: string;
}) {
	const normalizedCode = params.code.trim().toUpperCase();

	return db.supplier.findFirst({
		where: {
			organizationId: params.organizationId,
			...(params.excludeId ? { id: { not: params.excludeId } } : {}),
			metadata: {
				path: ["code"],
				equals: normalizedCode,
			},
		},
		select: { id: true },
	});
}

export async function listSuppliers(input: ListSuppliersInput) {
	const where = buildWhere({
		organizationId: input.organizationId,
		query: input.query,
	});

	const [suppliers, total] = await Promise.all([
		db.supplier.findMany({
			where,
			select: supplierListSelect,
			take: input.limit,
			skip: input.offset,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.supplier.count({ where }),
	]);

	return {
		suppliers: suppliers.map(enrichSupplierList),
		total,
	};
}

export async function getSupplierById(params: {
	organizationId: string;
	id: string;
}) {
	const supplier = await db.supplier.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: supplierSelect,
	});

	if (!supplier) {
		return null;
	}

	return enrichSupplier(supplier);
}

export async function createSupplier(params: {
	organizationId: string;
	data: SupplierPayload;
}) {
	const code =
		params.data.code?.trim().toUpperCase() ||
		getMetadataCode(params.data.metadata, params.data.name);

	const duplicate = await findSupplierByCode({
		organizationId: params.organizationId,
		code,
	});

	if (duplicate) {
		throw new Error("DUPLICATE_SUPPLIER_CODE");
	}

	const { code: _code, metadata, ...rest } = params.data;

	const supplier = await db.supplier.create({
		data: {
			organizationId: params.organizationId,
			...rest,
			metadata: mergeMetadataWithCode(metadata, code),
		},
		select: supplierSelect,
	});

	return enrichSupplier(supplier);
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
		select: { id: true, name: true, metadata: true },
	});

	if (!existing) {
		return null;
	}

	const nextName = params.data.name ?? existing.name;
	const nextCode = params.data.code
		? params.data.code.trim().toUpperCase()
		: getSupplierCode(existing);

	if (params.data.code) {
		const duplicate = await findSupplierByCode({
			organizationId: params.organizationId,
			code: nextCode,
			excludeId: params.id,
		});

		if (duplicate) {
			throw new Error("DUPLICATE_SUPPLIER_CODE");
		}
	}

	const { code: _code, metadata, ...rest } = params.data;
	const mergedMetadata = mergeMetadataWithCode(
		(metadata ?? existing.metadata) as Prisma.InputJsonValue | undefined,
		params.data.code
			? nextCode
			: getMetadataCode(metadata ?? existing.metadata, nextName),
	);

	const supplier = await db.supplier.update({
		where: {
			id: params.id,
		},
		data: {
			...rest,
			metadata: mergedMetadata,
		},
		select: supplierSelect,
	});

	return enrichSupplier(supplier);
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

export { deriveEntityCode as deriveSupplierCode };
