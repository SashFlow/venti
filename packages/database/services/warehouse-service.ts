import { db } from "../prisma";

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
			sameReturn: true,
			address: true,
			return: true,
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
	timezone?: string;
	sameReturn: boolean;
	address: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		zip: string;
		country: string;
	};
	returnAddress?: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		zip: string;
		country: string;
	};
}) {
	const existing = await db.warehouse.findFirst({
		where: {
			organizationId: params.organizationId,
			code: params.code,
		},
		select: { id: true },
	});

	if (existing) {
		throw new Error("Warehouse code already exists");
	}

	const warehouse = await db.warehouse.create({
		data: {
			organization: { connect: { id: params.organizationId } },
			name: params.name,
			code: params.code,
			timezone: params.timezone ?? "UTC",
			sameReturn: params.sameReturn,
			address: {
				create: {
					addressLine1: params.address.line1,
					addressLine2: params.address.line2,
					city: params.address.city,
					state: params.address.state,
					zip: params.address.zip,
					country: params.address.country,
				},
			},
			...(params.sameReturn
				? {}
				: {
						return: params.returnAddress
							? {
									create: {
										addressLine1:
											params.returnAddress.line1,
										addressLine2:
											params.returnAddress.line2,
										city: params.returnAddress.city,
										state: params.returnAddress.state,
										zip: params.returnAddress.zip,
										country: params.returnAddress.country,
									},
								}
							: undefined,
					}),
		},
		select: {
			id: true,
			organizationId: true,
			name: true,
			code: true,
			timezone: true,
			status: true,
			sameReturn: true,
			address: true,
			return: true,
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
	timezone?: string;
	sameReturn?: boolean;
	address?: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		zip: string;
		country: string;
	};
	returnAddress?: {
		line1: string;
		line2?: string;
		city: string;
		state: string;
		zip: string;
		country: string;
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
			addressId: true,
			returnId: true,
		},
	});

	if (!existing) {
		throw new Error("Warehouse not found");
	}

	return db.warehouse.update({
		where: { id: params.id },
		data: {
			name: params.name,
			code: params.code,
			timezone: params.timezone,
			sameReturn: params.sameReturn,
			...(params.address
				? {
						address: {
							update: {
								addressLine1: params.address.line1,
								addressLine2: params.address.line2,
								city: params.address.city,
								state: params.address.state,
								zip: params.address.zip,
								country: params.address.country,
							},
						},
					}
				: {}),
			...(params.sameReturn === false && params.returnAddress
				? {
						return: existing.returnId
							? {
									update: {
										addressLine1:
											params.returnAddress.line1,
										addressLine2:
											params.returnAddress.line2,
										city: params.returnAddress.city,
										state: params.returnAddress.state,
										zip: params.returnAddress.zip,
										country: params.returnAddress.country,
									},
								}
							: {
									create: {
										addressLine1:
											params.returnAddress.line1,
										addressLine2:
											params.returnAddress.line2,
										city: params.returnAddress.city,
										state: params.returnAddress.state,
										zip: params.returnAddress.zip,
										country: params.returnAddress.country,
									},
								},
					}
				: {}),
			...(params.sameReturn === true && existing.returnId
				? {
						return: {
							disconnect: true,
						},
					}
				: {}),
		},
		select: {
			id: true,
			organizationId: true,
			name: true,
			code: true,
			timezone: true,
			status: true,
			sameReturn: true,
			address: true,
			return: true,
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
