import { db } from "@repo/database";
import type { Prisma } from "@repo/database/prisma/generated/client";

const uomSelect = {
	id: true,
	organizationId: true,
	code: true,
	name: true,
	abbreviation: true,
	isBase: true,
	precision: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.UOMSelect;

type ListUomsInput = {
	organizationId: string;
	query?: string;
	limit: number;
	offset: number;
};

type UomPayload = {
	code: string;
	name: string;
	abbreviation: string;
	isBase?: boolean;
	precision?: number;
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
		return { organizationId } satisfies Prisma.UOMWhereInput;
	}

	return {
		organizationId,
		OR: [
			{ code: { contains: trimmedQuery, mode: "insensitive" } },
			{ name: { contains: trimmedQuery, mode: "insensitive" } },
			{ abbreviation: { contains: trimmedQuery, mode: "insensitive" } },
		],
	} satisfies Prisma.UOMWhereInput;
}

export async function listUoms(input: ListUomsInput) {
	const where = buildWhere({
		organizationId: input.organizationId,
		query: input.query,
	});

	const [uoms, total] = await Promise.all([
		db.uOM.findMany({
			where,
			select: uomSelect,
			take: input.limit,
			skip: input.offset,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.uOM.count({ where }),
	]);

	return {
		uoms,
		total,
	};
}

export async function getUomById(params: {
	organizationId: string;
	id: string;
}) {
	return db.uOM.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: uomSelect,
	});
}

export async function createUom(params: {
	organizationId: string;
	data: UomPayload;
}) {
	return db.uOM.create({
		data: {
			organizationId: params.organizationId,
			...params.data,
		},
		select: uomSelect,
	});
}

export async function updateUom(params: {
	organizationId: string;
	id: string;
	data: Partial<UomPayload>;
}) {
	const existing = await db.uOM.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		select: {
			id: true,
		},
	});

	if (!existing) {
		return null;
	}

	return db.uOM.update({
		where: {
			id: params.id,
		},
		data: params.data,
		select: uomSelect,
	});
}

export async function deleteUom(params: {
	organizationId: string;
	id: string;
}) {
	const result = await db.uOM.deleteMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
	});

	return result.count > 0;
}
