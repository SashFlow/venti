import { db as prisma } from "../prisma";

/**
 * Location + Asset input contracts used by layout maker.
 *
 * Notes:
 * - We intentionally accept parent references by `parentCode` (not fragile IDs)
 *   and resolve them server-side after creation.
 * - All distances are stored as provided (caller uses mm; db uses Decimal).
 */
export type WarehouseLayoutLocationInput = {
	code: string;
	name?: string | null;
	type: string;
	barcode?: string | null;
	sequence?: number | null;
	x?: number | string | null;
	y?: number | string | null;
	z?: number | string | null;
	width?: number | string | null;
	height?: number | string | null;
	depth?: number | string | null;
	rotationX?: number | string | null;
	rotationY?: number | string | null;
	rotationZ?: number | string | null;
	meshType?: string | null;
	colorHex?: string | null;
	parentCode?: string | null;
};

export type WarehouseLayoutAssetInput = {
	name?: string | null;
	type: string;
	x?: number | string | null;
	y?: number | string | null;
	z?: number | string | null;
	width?: number | string | null;
	height?: number | string | null;
	depth?: number | string | null;
	rotationX?: number | string | null;
	rotationY?: number | string | null;
	rotationZ?: number | string | null;
	meshType?: string | null;
	colorHex?: string | null;
	anchorLocationCode?: string | null;
};

export type WarehouseLayoutScenePayload = {
	locations: WarehouseLayoutLocationInput[];
	assets: WarehouseLayoutAssetInput[];
	meta?: Record<string, unknown>;
};

const VALID_LOCATION_TYPES = new Set<string>([
	"FLOOR",
	"ZONE",
	"BLOCK",
	"RACK",
	"SHELF",
	"BIN",
	"PALLET",
]);

const VALID_ASSET_TYPES = new Set<string>([
	"AISLE",
	"DOCK_DOOR",
	"STAIRS",
	"WALL",
]);

export async function saveWarehouseLayout(input: {
	organizationId: string;
	warehouseId: string;
	locations: WarehouseLayoutLocationInput[];
	assets?: WarehouseLayoutAssetInput[];
}) {
	const { warehouseId, locations } = input;

	const assets = input.assets ?? [];

	// Overwrite published layout (locations + assets)
	await prisma.$transaction(async (tx) => {
		await tx.asset.deleteMany({ where: { warehouseId } });
		await tx.location.deleteMany({ where: { warehouseId } });

		const createdByCode = new Map<string, { id: string; code: string }>();
		const pendingParentLinks: Array<{ code: string; parentCode: string }> = [];

		for (const loc of locations) {
			if (!VALID_LOCATION_TYPES.has(loc.type)) {
				continue;
			}
			const { parentCode, ...data } = loc;
			const created = await tx.location.create({
				data: {
					...data,
					type: data.type as never,
					warehouseId,
				},
				select: { id: true, code: true },
			});
			createdByCode.set(created.code, created);
			if (parentCode) {
				pendingParentLinks.push({ code: created.code, parentCode });
			}
		}

		// Resolve parentLocationId by code.
		for (const link of pendingParentLinks) {
			const child = createdByCode.get(link.code);
			const parent = createdByCode.get(link.parentCode);
			if (!child || !parent) {
				continue;
			}
			await tx.location.update({
				where: { id: child.id },
				data: { parentLocationId: parent.id },
			});
		}

		// Create assets, optionally anchored to a location code.
		for (const asset of assets) {
			if (!VALID_ASSET_TYPES.has(asset.type)) {
				continue;
			}
			const { anchorLocationCode, ...data } = asset;
			const anchor = anchorLocationCode
				? createdByCode.get(anchorLocationCode)
				: undefined;
			await tx.asset.create({
				data: {
					...data,
					type: data.type as never,
					warehouseId,
					locationId: anchor?.id,
				},
			});
		}
	});

	return { ok: true };
}

/**
 * Load all locations for a warehouse, sorted parent-first.
 */
export async function loadWarehouseLayout(input: {
	organizationId: string;
	warehouseId: string;
}) {
	const { warehouseId } = input;
	const [locations, assets] = await Promise.all([
		prisma.location.findMany({
			where: { warehouseId },
			orderBy: [
				{ parentLocationId: "asc" },
				{ sequence: "asc" },
				{ code: "asc" },
			],
		}),
		prisma.asset.findMany({
			where: { warehouseId },
			orderBy: { name: "asc" },
		}),
	]);
	return { locations, assets };
}

export async function getWarehouseLayoutDraft(input: {
	organizationId: string;
	warehouseId: string;
}) {
	const draft = await prisma.warehouseLayout.findFirst({
		where: {
			organizationId: input.organizationId,
			warehouseId: input.warehouseId,
			status: "DRAFT",
		},
		orderBy: { updatedAt: "desc" },
	});
	return draft ?? null;
}

export async function saveWarehouseLayoutDraft(input: {
	organizationId: string;
	warehouseId: string;
	name?: string | null;
	notes?: string | null;
	scene: WarehouseLayoutScenePayload;
}) {
	const existing = await prisma.warehouseLayout.findFirst({
		where: {
			organizationId: input.organizationId,
			warehouseId: input.warehouseId,
			status: "DRAFT",
		},
		select: { id: true },
	});

	if (existing) {
		return prisma.warehouseLayout.update({
			where: { id: existing.id },
			data: {
				name: input.name ?? undefined,
				notes: input.notes ?? undefined,
				scene: input.scene as any,
			},
		});
	}

	return prisma.warehouseLayout.create({
		data: {
			organizationId: input.organizationId,
			warehouseId: input.warehouseId,
			status: "DRAFT",
			name: input.name ?? undefined,
			notes: input.notes ?? undefined,
			scene: input.scene as any,
		},
	});
}

export async function publishWarehouseLayoutFromDraft(input: {
	organizationId: string;
	warehouseId: string;
}) {
	const draft = await getWarehouseLayoutDraft(input);
	if (!draft) {
		throw new Error("No draft layout to publish.");
	}

	const scene = draft.scene as unknown as WarehouseLayoutScenePayload;
	await saveWarehouseLayout({
		organizationId: input.organizationId,
		warehouseId: input.warehouseId,
		locations: scene.locations ?? [],
		assets: scene.assets ?? [],
	});

	await prisma.warehouseLayout.update({
		where: { id: draft.id },
		data: {
			status: "PUBLISHED",
			publishedAt: new Date(),
		},
	});

	return { ok: true };
}
