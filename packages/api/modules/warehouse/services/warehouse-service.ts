import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";

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
	status?: "active" | "archived" | "all";
	limit: number;
	offset: number;
}) {
	const statusWhere =
		params.status === "archived"
			? { status: "ARCHIVED" as const }
			: params.status === "all"
				? {}
				: {
						NOT: {
							status: "ARCHIVED" as const,
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
						zones: true,
						storageUnits: true,
						inventoryItems: true,
					},
				},
				layoutVersions: {
					orderBy: { version: "desc" },
					take: 1,
					select: {
						version: true,
						status: true,
						updatedAt: true,
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
					status: "ARCHIVED" as const,
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
			description: true,
			timezone: true,
			status: true,
			address: {
				select: {
					id: true,
					addressLine1: true,
					addressLine2: true,
					city: true,
					state: true,
					zip: true,
					country: true,
				},
			},
			returnAddress: {
				select: {
					id: true,
					addressLine1: true,
					addressLine2: true,
					city: true,
					state: true,
					zip: true,
					country: true,
				},
			},
			_count: {
				select: {
					zones: true,
					storageUnits: true,
					inventoryItems: true,
				},
			},
			layoutVersions: {
				orderBy: { version: "desc" },
				take: 1,
				select: {
					id: true,
					version: true,
					status: true,
					sceneDataUrl: true,
					updatedAt: true,
					publishedAt: true,
				},
			},
		},
	});

	if (!warehouse) {
		throw new ORPCError("NOT_FOUND", {
			message: "Warehouse not found.",
		});
	}

	const latestLayout = warehouse.layoutVersions[0] ?? null;

	return {
		...warehouse,
		latestLayout: latestLayout
			? {
					id: latestLayout.id,
					version: latestLayout.version,
					status: latestLayout.status,
					updatedAt: latestLayout.updatedAt,
					publishedAt: latestLayout.publishedAt,
					scene: parseLayoutScene(latestLayout.sceneDataUrl),
				}
			: null,
	};
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
		throw new ORPCError("BAD_REQUEST", {
			message: "Warehouse code already exists in this organization.",
		});
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
			description: params.description,
			timezone: params.timezone ?? "UTC",
			addressId,
			returnAddressId,
		},
		select: {
			id: true,
			organizationId: true,
			name: true,
			code: true,
			description: true,
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
				status: "ARCHIVED",
			},
		},
		select: {
			id: true,
			addressId: true,
			returnAddressId: true,
		},
	});

	if (!existing) {
		throw new ORPCError("NOT_FOUND", {
			message: "Warehouse not found.",
		});
	}

	let addressId = existing.addressId;
	let returnAddressId = existing.returnAddressId;

	if (params.address) {
		if (!addressId) {
			const createdAddress = await db.address.create({
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

			addressId = createdAddress.id;
		} else {
			await db.address.update({
				where: { id: addressId },
				data: {
					addressLine1: params.address.addressLine1,
					addressLine2: params.address.addressLine2,
					city: params.address.city,
					state: params.address.state,
					zip: params.address.zip,
					country: params.address.country,
				},
			});
		}
	}

	if (params.returnAddress === null) {
		returnAddressId = null;
	}

	if (params.returnAddress) {
		if (!returnAddressId) {
			const createdReturnAddress = await db.address.create({
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

			returnAddressId = createdReturnAddress.id;
		} else {
			await db.address.update({
				where: { id: returnAddressId },
				data: {
					addressLine1: params.returnAddress.addressLine1,
					addressLine2: params.returnAddress.addressLine2,
					city: params.returnAddress.city,
					state: params.returnAddress.state,
					zip: params.returnAddress.zip,
					country: params.returnAddress.country,
				},
			});
		}
	}

	const warehouse = await db.warehouse.update({
		where: { id: params.id },
		data: {
			name: params.name,
			code: params.code,
			description: params.description,
			timezone: params.timezone,
			addressId,
			returnAddressId,
		},
		select: {
			id: true,
			name: true,
			code: true,
			description: true,
			timezone: true,
			updatedAt: true,
		},
	});

	return { warehouse };
}

export async function deleteWarehouse(params: {
	organizationId: string;
	id: string;
}) {
	const archived = await db.warehouse.updateMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
			NOT: {
				status: "ARCHIVED",
			},
		},
		data: {
			status: "ARCHIVED",
		},
	});

	if (archived.count === 0) {
		throw new ORPCError("NOT_FOUND", {
			message: "Warehouse not found.",
		});
	}

	return { deleted: true };
}

export async function restoreWarehouse(params: {
	organizationId: string;
	id: string;
}) {
	const restored = await db.warehouse.updateMany({
		where: {
			id: params.id,
			organizationId: params.organizationId,
			status: "ARCHIVED",
		},
		data: {
			status: "ACTIVE",
		},
	});

	if (restored.count === 0) {
		throw new ORPCError("NOT_FOUND", {
			message: "Archived warehouse not found.",
		});
	}

	return { restored: true };
}

export async function getLatestLayoutVersion(params: {
	organizationId: string;
	warehouseId: string;
}) {
	const warehouse = await db.warehouse.findFirst({
		where: {
			id: params.warehouseId,
			organizationId: params.organizationId,
		},
		select: { id: true },
	});

	if (!warehouse) {
		throw new ORPCError("NOT_FOUND", {
			message: "Warehouse not found.",
		});
	}

	const layout = await db.layoutVersion.findFirst({
		where: {
			warehouseId: params.warehouseId,
		},
		orderBy: { version: "desc" },
		select: {
			id: true,
			version: true,
			name: true,
			status: true,
			notes: true,
			sceneDataUrl: true,
			updatedAt: true,
			publishedAt: true,
		},
	});

	if (!layout) {
		return { layout: null };
	}

	return {
		layout: {
			...layout,
			scene: parseLayoutScene(layout.sceneDataUrl),
		},
	};
}

export async function saveLayoutDraft(params: {
	organizationId: string;
	warehouseId: string;
	name?: string;
	notes?: string;
	scene: {
		viewMode: "2d" | "iso" | "3d";
		nodes: Array<{
			id: string;
			label: string;
			x: number;
			y: number;
			width: number;
			height: number;
			color: string;
		}>;
	};
}) {
	const warehouse = await db.warehouse.findFirst({
		where: {
			id: params.warehouseId,
			organizationId: params.organizationId,
		},
		select: { id: true },
	});

	if (!warehouse) {
		throw new ORPCError("NOT_FOUND", {
			message: "Warehouse not found.",
		});
	}

	const layout = await db.layoutVersion.create({
		data: {
			warehouseId: params.warehouseId,
			name: params.name,
			notes: params.notes,
			status: "DRAFT",
			sceneDataUrl: JSON.stringify(params.scene),
		},
		select: {
			id: true,
			version: true,
			name: true,
			status: true,
			notes: true,
			sceneDataUrl: true,
			updatedAt: true,
			publishedAt: true,
		},
	});

	return {
		layout: {
			...layout,
			scene: parseLayoutScene(layout.sceneDataUrl),
		},
	};
}

export async function publishLayoutVersion(params: {
	organizationId: string;
	warehouseId: string;
	layoutVersionId: string;
	publishedByUserId: string;
}) {
	const warehouse = await db.warehouse.findFirst({
		where: {
			id: params.warehouseId,
			organizationId: params.organizationId,
		},
		select: { id: true },
	});

	if (!warehouse) {
		throw new ORPCError("NOT_FOUND", {
			message: "Warehouse not found.",
		});
	}

	const existingLayout = await db.layoutVersion.findFirst({
		where: {
			id: params.layoutVersionId,
			warehouseId: params.warehouseId,
		},
		select: { id: true },
	});

	if (!existingLayout) {
		throw new ORPCError("NOT_FOUND", {
			message: "Layout version not found.",
		});
	}

	const layout = await db.layoutVersion.update({
		where: {
			id: params.layoutVersionId,
		},
		data: {
			status: "PUBLISHED",
			publishedAt: new Date(),
			publishedByUserId: params.publishedByUserId,
		},
		select: {
			id: true,
			version: true,
			status: true,
			publishedAt: true,
			updatedAt: true,
		},
	});

	return { layout };
}
