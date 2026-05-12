import { db } from "@repo/database";
import { type $Enums, Prisma } from "@repo/database/prisma/generated/client";

const skuSelect = {
	id: true,
	organizationId: true,
	skuCode: true,
	name: true,
	description: true,
	lifecycle: true,
	gtin: true,
	uomId: true,
	categoryId: true,
	widthMm: true,
	lengthMm: true,
	heightMm: true,
	weightKg: true,
	reorderPoint: true,
	minStock: true,
	maxStock: true,
	serialTracking: true,
	batchTracking: true,
	expiryTracking: true,
	metadata: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.SKUSelect;

type ListSKUsInput = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

type SKUPayload = {
	skuCode: string;
	name: string;
	description?: string;
	lifecycle?: string;
	gtin?: string;
	uomId?: string;
	categoryId?: string;
	widthMm?: number;
	lengthMm?: number;
	heightMm?: number;
	weightKg?: number;
	reorderPoint?: number;
	minStock?: number;
	maxStock?: number;
	serialTracking?: boolean;
	batchTracking?: boolean;
	expiryTracking?: boolean;
	metadata?: Prisma.InputJsonValue;
};

function toDecimal(value: number | undefined) {
	if (value === undefined || Number.isNaN(value)) {
		return undefined;
	}

	return new Prisma.Decimal(value);
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
		return { organizationId } satisfies Prisma.SKUWhereInput;
	}

	return {
		organizationId,
		OR: [
			{ skuCode: { contains: trimmedQuery, mode: "insensitive" } },
			{ name: { contains: trimmedQuery, mode: "insensitive" } },
			{ gtin: { contains: trimmedQuery, mode: "insensitive" } },
		],
	} satisfies Prisma.SKUWhereInput;
}

export async function listSKUs(input: ListSKUsInput) {
	const where = buildWhere({
		organizationId: input.organizationId,
		query: input.query,
	});

	const [skus, total] = await Promise.all([
		db.sKU.findMany({
			where,
			select: skuSelect,
			take: input.limit,
			skip: input.offset,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.sKU.count({ where }),
	]);

	return {
		skus,
		total,
	};
}

export async function getSKUById(params: {
	organizationId: string;
	id: string;
}) {
	return db.sKU.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: skuSelect,
	});
}

export async function createSKU(params: {
	organizationId: string;
	data: SKUPayload;
}) {
	return db.sKU.create({
		data: {
			organizationId: params.organizationId,
			skuCode: params.data.skuCode,
			name: params.data.name,
			description: params.data.description,
			lifecycle:
				(params.data.lifecycle as $Enums.SKULifecycle) || "ACTIVE",
			gtin: params.data.gtin,
			uomId: params.data.uomId,
			categoryId: params.data.categoryId,
			widthMm: toDecimal(params.data.widthMm),
			lengthMm: toDecimal(params.data.lengthMm),
			heightMm: toDecimal(params.data.heightMm),
			weightKg: toDecimal(params.data.weightKg),
			reorderPoint: toDecimal(params.data.reorderPoint),
			minStock: toDecimal(params.data.minStock),
			maxStock: toDecimal(params.data.maxStock),
			serialTracking: params.data.serialTracking ?? false,
			batchTracking: params.data.batchTracking ?? false,
			expiryTracking: params.data.expiryTracking ?? false,
			metadata: params.data.metadata,
		},
		select: skuSelect,
	});
}

export async function updateSKU(params: {
	organizationId: string;
	id: string;
	data: Partial<SKUPayload>;
}) {
	const existing = await db.sKU.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: { id: true },
	});

	if (!existing) {
		return null;
	}

	return db.sKU.update({
		where: {
			id: params.id,
		},
		data: {
			skuCode: params.data.skuCode,
			name: params.data.name,
			description: params.data.description,
			lifecycle: params.data.lifecycle as $Enums.SKULifecycle | undefined,
			gtin: params.data.gtin,
			uomId: params.data.uomId,
			categoryId: params.data.categoryId,
			widthMm: toDecimal(params.data.widthMm),
			lengthMm: toDecimal(params.data.lengthMm),
			heightMm: toDecimal(params.data.heightMm),
			weightKg: toDecimal(params.data.weightKg),
			reorderPoint: toDecimal(params.data.reorderPoint),
			minStock: toDecimal(params.data.minStock),
			maxStock: toDecimal(params.data.maxStock),
			serialTracking: params.data.serialTracking,
			batchTracking: params.data.batchTracking,
			expiryTracking: params.data.expiryTracking,
			metadata: params.data.metadata,
		},
		select: skuSelect,
	});
}

export async function deleteSKU(params: {
	organizationId: string;
	id: string;
}) {
	const result = await db.sKU.deleteMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
	});

	return result.count > 0;
}
