import { db } from "@repo/database";
import { Prisma } from "@repo/database/prisma/generated/client";

const packageTypeSelect = {
	id: true,
	organizationId: true,
	name: true,
	description: true,
	packageType: true,
	price: true,
	length: true,
	width: true,
	height: true,
	weight: true,
	dimensionUnit: true,
	weightUnit: true,
	applyToAllWarehouses: true,
	metadata: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.PackageTypeSelect;

type ListPackageTypesInput = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

type PackageTypePayload = {
	name: string;
	description?: string;
	packageType: string;
	price?: number;
	length?: number;
	width?: number;
	height?: number;
	weight?: number;
	dimensionUnit?: string;
	weightUnit?: string;
	applyToAllWarehouses?: boolean;
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
		return { organizationId } satisfies Prisma.PackageTypeWhereInput;
	}

	return {
		organizationId,
		OR: [
			{ name: { contains: trimmedQuery, mode: "insensitive" } },
			{ description: { contains: trimmedQuery, mode: "insensitive" } },
			{ packageType: { contains: trimmedQuery, mode: "insensitive" } },
		],
	} satisfies Prisma.PackageTypeWhereInput;
}

export async function listPackageTypes(input: ListPackageTypesInput) {
	const where = buildWhere({
		organizationId: input.organizationId,
		query: input.query,
	});

	const [packageTypes, total] = await Promise.all([
		db.packageType.findMany({
			where,
			select: packageTypeSelect,
			take: input.limit,
			skip: input.offset,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.packageType.count({ where }),
	]);

	return {
		packageTypes,
		total,
	};
}

export async function getPackageTypeById(params: {
	organizationId: string;
	id: string;
}) {
	return db.packageType.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: packageTypeSelect,
	});
}

export async function createPackageType(params: {
	organizationId: string;
	data: PackageTypePayload;
}) {
	return db.packageType.create({
		data: {
			organizationId: params.organizationId,
			name: params.data.name,
			description: params.data.description,
			packageType: params.data.packageType,
			price: toDecimal(params.data.price) ?? new Prisma.Decimal(0),
			length: toDecimal(params.data.length) ?? new Prisma.Decimal(1),
			width: toDecimal(params.data.width) ?? new Prisma.Decimal(1),
			height: toDecimal(params.data.height) ?? new Prisma.Decimal(1),
			weight: toDecimal(params.data.weight) ?? new Prisma.Decimal(1),
			dimensionUnit: params.data.dimensionUnit ?? "in",
			weightUnit: params.data.weightUnit ?? "lb",
			applyToAllWarehouses: params.data.applyToAllWarehouses ?? true,
			metadata: params.data.metadata,
		},
		select: packageTypeSelect,
	});
}

export async function updatePackageType(params: {
	organizationId: string;
	id: string;
	data: Partial<PackageTypePayload>;
}) {
	const existing = await db.packageType.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: { id: true },
	});

	if (!existing) {
		return null;
	}

	return db.packageType.update({
		where: {
			id: params.id,
		},
		data: {
			name: params.data.name,
			description: params.data.description,
			packageType: params.data.packageType,
			price: toDecimal(params.data.price),
			length: toDecimal(params.data.length),
			width: toDecimal(params.data.width),
			height: toDecimal(params.data.height),
			weight: toDecimal(params.data.weight),
			dimensionUnit: params.data.dimensionUnit,
			weightUnit: params.data.weightUnit,
			applyToAllWarehouses: params.data.applyToAllWarehouses,
			metadata: params.data.metadata,
		},
		select: packageTypeSelect,
	});
}

export async function deletePackageType(params: {
	organizationId: string;
	id: string;
}) {
	const result = await db.packageType.deleteMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
	});

	return result.count > 0;
}
