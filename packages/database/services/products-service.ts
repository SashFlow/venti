import { Prisma } from "@prisma/client";
import { db } from "../prisma";

const skuSelect = {
	id: true,
	organizationId: true,
	code: true,
	name: true,
	barcode: true,
	baseUomId: true,
	productId: true,
	width: true,
	length: true,
	height: true,
	weight: true,
	unitPrice: true,
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
	code: string;
	name: string;
	productId: string;
	barcode?: string;
	baseUomId: string;
	width?: number;
	length?: number;
	height?: number;
	weight?: number;
	unitPrice?: number;
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
			{ code: { contains: trimmedQuery, mode: "insensitive" } },
			{ name: { contains: trimmedQuery, mode: "insensitive" } },
			{ barcode: { contains: trimmedQuery, mode: "insensitive" } },
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
			code: params.data.code,
			name: params.data.name,
			barcode: params.data.barcode,
			baseUomId: params.data.baseUomId,
			productId: params.data.productId,
			width: toDecimal(params.data.width),
			length: toDecimal(params.data.length),
			height: toDecimal(params.data.height),
			weight: toDecimal(params.data.weight),
			unitPrice: toDecimal(params.data.unitPrice),
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
			code: params.data.code,
			name: params.data.name,
			barcode: params.data.barcode,
			baseUomId: params.data.baseUomId,
			productId: params.data.productId,
			width: toDecimal(params.data.width),
			length: toDecimal(params.data.length),
			height: toDecimal(params.data.height),
			weight: toDecimal(params.data.weight),
			unitPrice: toDecimal(params.data.unitPrice),
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
