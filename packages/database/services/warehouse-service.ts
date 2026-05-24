import { db } from "../prisma";

function parseLayoutScene(sceneDataUrl: string | null) {
	if (!sceneDataUrl) {
		return null;
	}

	try {
		return JSON.parse(sceneDataUrl) as {
			viewMode?: "2d" | "iso" | "3d";
			nodes?: Array<{
				id: string;
				label: string;
				x: number;
				y: number;
				width: number;
				height: number;
				color: string;
			}>;
		};
	} catch {
		return null;
	}
}

export async function listWarehouses(params: {
	organizationId: string;
	query?: string;
	status?: "active" | "INACTIVE" | "all";
	limit: number;
	offset: number;
}) {
	const statusWhere =
		params.status === "INACTIVE"
			? { status: "INACTIVE" as const }
			: params.status === "all"
				? {}
				: {
						NOT: {
							status: "INACTIVE" as const,
						},
					};

	const where = {
		organizationId: params.organizationId,
		...statusWhere,
		...(params.query
			? {
					OR: [
						{
							name: {
								contains: params.query,
								mode: "insensitive" as const,
							},
						},
						{
							code: {
								contains: params.query,
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {}),
	};

	const [warehouses, total] = await Promise.all([
		db.warehouse.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: params.limit,
			skip: params.offset,
			select: {
				id: true,
				name: true,
				code: true,
				status: true,
				timezone: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						locations: true,
						inventoryBalances: true,
					},
				},
			},
		}),
		db.warehouse.count({ where }),
	]);

	return { warehouses, total };
}

export async function getWarehouseById(params: {
	organizationId: string;
	id: string;
	includeArchived?: boolean;
}) {
	const statusFilter = params.includeArchived
		? {}
		: {
				NOT: {
					status: "INACTIVE" as const,
				},
			};

	const warehouse = await db.warehouse.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
			...statusFilter,
		},
		select: {
			id: true,
			organizationId: true,
			name: true,
			code: true,

			timezone: true,
			status: true,
			_count: {
				select: {
					locations: true,
					inventoryBalances: true,
				},
			},
		},
	});

	if (!warehouse) {
		throw new Error();
	}

	return warehouse;
}

export async function createWarehouse(params: {
	organizationId: string;
	name: string;
	code: string;
	description?: string;
	timezone?: string;
	address?: {
		addressLine1?: string;
		addressLine2?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	};
	returnAddress?: {
		addressLine1?: string;
		addressLine2?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	} | null;
}) {
	const existing = await db.warehouse.findFirst({
		where: {
			organizationId: params.organizationId,
			code: params.code,
		},
		select: { id: true },
	});

	if (existing) {
		throw new Error();
	}

	let addressId: string | undefined;
	let returnAddressId: string | null | undefined;

	if (params.address) {
		const address = await db.address.create({
			data: {
				addressLine1: params.address.addressLine1 ?? "",
				addressLine2: params.address.addressLine2,
				city: params.address.city ?? "",
				state: params.address.state ?? "",
				zip: params.address.zip ?? "",
				country: params.address.country ?? "",
			},
			select: { id: true },
		});

		addressId = address.id;
	}

	if (params.returnAddress) {
		const returnAddress = await db.address.create({
			data: {
				addressLine1: params.returnAddress.addressLine1 ?? "",
				addressLine2: params.returnAddress.addressLine2,
				city: params.returnAddress.city ?? "",
				state: params.returnAddress.state ?? "",
				zip: params.returnAddress.zip ?? "",
				country: params.returnAddress.country ?? "",
			},
			select: { id: true },
		});

		returnAddressId = returnAddress.id;
	}

	const warehouse = await db.warehouse.create({
		data: {
			organizationId: params.organizationId,
			name: params.name,
			code: params.code,
			timezone: params.timezone ?? "UTC",
		},
		select: {
			id: true,
			organizationId: true,
			name: true,
			code: true,

			timezone: true,
			status: true,
			createdAt: true,
		},
	});

	return { warehouse };
}

export async function updateWarehouse(params: {
	organizationId: string;
	id: string;
	name: string;
	code: string;
	description?: string;
	timezone?: string;
	address?: {
		addressLine1?: string;
		addressLine2?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	};
	returnAddress?: {
		addressLine1?: string;
		addressLine2?: string;
		city?: string;
		state?: string;
		zip?: string;
		country?: string;
	} | null;
}) {
	const existing = await db.warehouse.findFirst({
		where: {
			id: params.id,
			organizationId: params.organizationId,
			NOT: {
				status: "INACTIVE",
			},
		},
		select: {
			id: true,
		},
	});

	if (!existing) {
		throw new Error();
	}

	return db.warehouse.update({
		where: { id: params.id },
		data: {
			name: params.name,
			code: params.code,
			timezone: params.timezone,
		},
		select: {
			id: true,
			organizationId: true,
			name: true,
			code: true,
			timezone: true,
			status: true,
		},
	});
}

export async function archiveWarehouse(params: {
	organizationId: string;
	id: string;
}) {
	const archived = await db.warehouse.updateMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
		},
		data: {
			status: "INACTIVE",
		},
	});

	if (archived.count === 0) {
		throw new Error();
	}

	return { archived: true };
}

export async function restoreWarehouse(params: {
	organizationId: string;
	id: string;
}) {
	const restored = await db.warehouse.updateMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
			status: "INACTIVE",
		},
		data: {
			status: "ACTIVE",
		},
	});

	if (restored.count === 0) {
		throw new Error();
	}

	return { restored: true };
}
