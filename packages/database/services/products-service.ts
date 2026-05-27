import { db } from "../prisma";
import { Prisma } from "../prisma/generated/client";

const productSelect = {
	id: true,
	organizationId: true,
	code: true,
	name: true,
	description: true,
	isPerishable: true,
	isBatchTracked: true,
	isSerialTracked: true,
	createdAt: true,
	updatedAt: true,
	skus: {
		select: {
			id: true,
			code: true,
			name: true,
		},
	},
} satisfies Prisma.ProductSelect;

type ListProductsInput = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

type ProductPayload = {
	code: string;
	name: string;
	description?: string;
	isPerishable?: boolean;
	life?: number;
	isBatchTracked?: boolean;
	isSerialTracked?: boolean;
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
		return { organizationId } satisfies Prisma.ProductWhereInput;
	}

	return {
		organizationId,
		OR: [
			{ code: { contains: trimmedQuery, mode: "insensitive" } },
			{ name: { contains: trimmedQuery, mode: "insensitive" } },
		],
	} satisfies Prisma.ProductWhereInput;
}

export async function listProducts(input: ListProductsInput) {
	const where = buildWhere({
		organizationId: input.organizationId,
		query: input.query,
	});

	const [products, total] = await Promise.all([
		db.product.findMany({
			where,
			select: productSelect,
			take: input.limit,
			skip: input.offset,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.product.count({ where }),
	]);

	return {
		products,
		total,
	};
}

export async function getProductById(params: {
	organizationId: string;
	id: string;
}) {
	return db.product.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: productSelect,
	});
}

function toDecimal(value: number | undefined) {
	if (value === undefined || Number.isNaN(value)) {
		return undefined;
	}
	return new Prisma.Decimal(value);
}

export async function createProduct(params: {
	organizationId: string;
	data: ProductPayload;
	skus: Array<{
		code: string;
		name: string;
		barcode?: string;
		baseUomId: string;
		price?: number;
		length?: number;
		width?: number;
		height?: number;
		weight?: number;
		metadata?: Prisma.InputJsonValue;
	}>;
}) {
	return db.product.create({
		data: {
			organizationId: params.organizationId,
			code: params.data.code,
			name: params.data.name,
			description: params.data.description,
			isPerishable: params.data.isPerishable,
			life: params.data.life,
			isBatchTracked: params.data.isBatchTracked,
			isSerialTracked: params.data.isSerialTracked,
			skus: {
				create: params.skus.map((sku) => ({
					code: sku.code,
					name: sku.name,
					barcode: sku.barcode,
					baseUomId: sku.baseUomId,
					unitPrice: toDecimal(sku.price),
					length: toDecimal(sku.length),
					width: toDecimal(sku.width),
					height: toDecimal(sku.height),
					weight: toDecimal(sku.weight),
					metadata: sku.metadata ?? Prisma.JsonNull,
					organizationId: params.organizationId,
				})),
			},
		},
		select: productSelect,
	});
}

export async function deleteProduct(params: {
	organizationId: string;
	id: string;
}) {
	const result = await db.product.deleteMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
	});

	return result.count > 0;
}
