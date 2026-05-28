import { db } from "../prisma";
import { Prisma } from "../prisma/generated/client";

const productSelect = {
	id: true,
	organizationId: true,
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
			unitPrice: true,
			length: true,
			width: true,
			height: true,
			weight: true,
			metadata: true,
			balances: {
				select: {
					quantityAvailable: true,
				},
			},
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
	name: string;
	description?: string;
	isPerishable?: boolean;
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
		OR: [{ name: { contains: trimmedQuery, mode: "insensitive" } }],
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
			name: params.data.name,
			description: params.data.description,
			isPerishable: params.data.isPerishable,
			isBatchTracked: params.data.isBatchTracked,
			isSerialTracked: params.data.isSerialTracked,
			skus: {
				create: params.skus.map((sku) => ({
					code: sku.code,
					name: params.data.name,
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

export async function updateProduct(params: {
	organizationId: string;
	id: string;
	data: ProductPayload;
	skus: Array<{
		id?: string;
		code: string;
		price?: number;
		length?: number;
		width?: number;
		height?: number;
		weight?: number;
		metadata?: Prisma.InputJsonValue;
	}>;
}) {
	// First, fetch the existing product and skus
	const existingProduct = await db.product.findFirst({
		where: { id: params.id, organizationId: params.organizationId },
		include: { skus: true },
	});

	if (!existingProduct) {
		throw new Error("Product not found");
	}

	const existingSkuIds = existingProduct.skus.map((s) => s.id);
	const incomingSkuIds = params.skus
		.map((s) => s.id)
		.filter(Boolean) as string[];
	const skusToDelete = existingSkuIds.filter(
		(id) => !incomingSkuIds.includes(id),
	);

	return db.$transaction(async (tx) => {
		// 1. Delete removed SKUs
		if (skusToDelete.length > 0) {
			await tx.sKU.deleteMany({
				where: { id: { in: skusToDelete }, productId: params.id },
			});
		}

		// 2. Update existing and create new SKUs along with updating the product
		const updatedProduct = await tx.product.update({
			where: { id: params.id },
			data: {
				name: params.data.name,
				description: params.data.description,
				isPerishable: params.data.isPerishable,
				isBatchTracked: params.data.isBatchTracked,
				isSerialTracked: params.data.isSerialTracked,
				skus: {
					upsert: params.skus.map((sku) => ({
						where: { id: sku.id ?? "new" },
						update: {
							code: sku.code,
							unitPrice: toDecimal(sku.price),
							length: toDecimal(sku.length),
							width: toDecimal(sku.width),
							height: toDecimal(sku.height),
							weight: toDecimal(sku.weight),
							metadata: sku.metadata ?? Prisma.JsonNull,
						},
						create: {
							code: sku.code,
							unitPrice: toDecimal(sku.price),
							length: toDecimal(sku.length),
							width: toDecimal(sku.width),
							height: toDecimal(sku.height),
							weight: toDecimal(sku.weight),
							metadata: sku.metadata ?? Prisma.JsonNull,
							organizationId: params.organizationId,
						},
					})),
				},
			},
			select: productSelect,
		});

		return updatedProduct;
	});
}

export async function deleteProduct(params: {
	organizationId: string;
	id: string;
}) {
	return db.$transaction(async (tx) => {
		// Verify product belongs to org
		const product = await tx.product.findFirst({
			where: { id: params.id, organizationId: params.organizationId },
		});

		if (!product) return false;

		// Delete SKUs first due to foreign key constraint
		await tx.sKU.deleteMany({
			where: { productId: params.id },
		});

		const result = await tx.product.deleteMany({
			where: { id: params.id },
		});

		return result.count > 0;
	});
}
