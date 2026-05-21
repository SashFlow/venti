import { faker } from "@faker-js/faker";
import { CONFIG } from "./config";
import type { CsvExporter } from "./export";
import { generateId } from "./utils";

export interface State {
	orgId: string;
	users: string[];
	uoms: string[];
	categories: string[];
	suppliers: string[];
	customers: string[];
	skus: { id: string; serialTracking: boolean; batchTracking: boolean }[];
	warehouses: {
		id: string;
		pickingBins: string[];
		bulkLocations: string[];
		inboundLocations: string[];
		outboundLocations: string[];
	}[];
}

export function generateMasterData(exporter: CsvExporter): State {
	const state: State = {
		orgId: generateId(),
		users: [],
		uoms: [],
		categories: [],
		suppliers: [],
		customers: [],
		skus: [],
		warehouses: [],
	};

	const now = new Date();

	// Organization
	exporter.writeRow("organization", {
		id: state.orgId,
		name: faker.company.name(),
		slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
		createdAt: now,
	});

	// Users
	for (let i = 0; i < CONFIG.NUM_USERS_PER_ORG; i++) {
		const id = generateId();
		state.users.push(id);
		exporter.writeRow("user", {
			id,
			name: faker.person.fullName(),
			email: faker.internet.email(),
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		});
	}

	// UOMs
	const baseUomId = generateId();
	state.uoms.push(baseUomId);
	exporter.writeRow("uom", {
		id: baseUomId,
		organizationId: state.orgId,
		code: "EA",
		name: "Each",
		abbreviation: "ea",
		isBase: true,
		precision: 0,
		createdAt: now,
		updatedAt: now,
	});

	// Categories
	for (let i = 0; i < CONFIG.NUM_CATEGORIES; i++) {
		const id = generateId();
		state.categories.push(id);
		exporter.writeRow("sku_category", {
			id,
			organizationId: state.orgId,
			name:
				faker.commerce.department() +
				" " +
				faker.string.uuid().slice(0, 4),
			createdAt: now,
			updatedAt: now,
		});
	}

	// Suppliers
	for (let i = 0; i < CONFIG.NUM_SUPPLIERS; i++) {
		const id = generateId();
		state.suppliers.push(id);
		exporter.writeRow("supplier", {
			id,
			organizationId: state.orgId,
			code: `SUP-${i + 1}`,
			name: faker.company.name(),
			createdAt: now,
			updatedAt: now,
		});
	}

	// Customers
	for (let i = 0; i < CONFIG.NUM_CUSTOMERS; i++) {
		const id = generateId();
		state.customers.push(id);
		exporter.writeRow("customer", {
			id,
			organizationId: state.orgId,
			name: faker.company.name(),
			createdAt: now,
			updatedAt: now,
		});
	}

	// SKUs
	for (let i = 0; i < CONFIG.NUM_SKUS; i++) {
		const id = generateId();
		const isSerialized = Math.random() < CONFIG.SKU_TYPE_PROBS.SERIALIZED;
		const isBatch =
			!isSerialized &&
			Math.random() <
				CONFIG.SKU_TYPE_PROBS.BATCH_TRACKED /
					(1 - CONFIG.SKU_TYPE_PROBS.SERIALIZED);

		state.skus.push({
			id,
			serialTracking: isSerialized,
			batchTracking: isBatch,
		});

		exporter.writeRow("sku", {
			id,
			organizationId: state.orgId,
			skuCode: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
			name: faker.commerce.productName(),
			lifecycle: "ACTIVE",
			categoryId: faker.helpers.arrayElement(state.categories),
			uomId: baseUomId,
			serialTracking: isSerialized,
			batchTracking: isBatch,
			createdAt: now,
			updatedAt: now,
		});
	}

	// Warehouses & Physical Layouts
	for (let i = 0; i < CONFIG.NUM_WAREHOUSES; i++) {
		const whId = generateId();
		const floorId = generateId();

		const whState = {
			id: whId,
			pickingBins: [] as string[],
			bulkLocations: [] as string[],
			inboundLocations: [] as string[],
			outboundLocations: [] as string[],
		};

		exporter.writeRow("warehouse", {
			id: whId,
			organizationId: state.orgId,
			code: `WH-${i + 1}`,
			name: `${faker.location.city()} Distribution Center`,
			status: "ACTIVE",
			createdAt: now,
			updatedAt: now,
		});

		exporter.writeRow("warehouse_floor", {
			id: floorId,
			warehouseId: whId,
			floorNumber: 1,
			code: "FL-1",
			status: "ACTIVE",
			widthMm: CONFIG.FLOOR_WIDTH_MM,
			lengthMm: CONFIG.FLOOR_LENGTH_MM,
			createdAt: now,
			updatedAt: now,
		});

		// Zones
		const zones = [
			{ type: "INBOUND", code: "Z-IN", name: "Inbound Staging" },
			{ type: "OUTBOUND", code: "Z-OUT", name: "Outbound Staging" },
			{ type: "BULK", code: "Z-BLK", name: "Bulk Storage" },
			{ type: "PICKING", code: "Z-PCK", name: "Picking Area" },
			{ type: "QC", code: "Z-QC", name: "Quality Control" },
		];

		for (const z of zones) {
			const zoneId = generateId();
			exporter.writeRow("zone", {
				id: zoneId,
				warehouseId: whId,
				code: z.code,
				name: z.name,
				type: z.type,
				createdAt: now,
				updatedAt: now,
			});

			// Generate Storage Units per Zone with randomized layout to make each warehouse different
			if (z.type === "INBOUND") {
				const numStaging = faker.number.int({ min: 3, max: 8 });
				for (let j = 0; j < numStaging; j++) {
					const locId = generateId();
					whState.inboundLocations.push(locId);
					exporter.writeRow("storage_unit", {
						id: locId,
						warehouseId: whId,
						floorId,
						zoneId,
						code: `IN-STG-${j + 1}`,
						type: "STAGING",
						status: "ACTIVE",
						createdAt: now,
						updatedAt: now,
					});
				}
			} else if (z.type === "OUTBOUND") {
				const numStaging = faker.number.int({ min: 3, max: 8 });
				for (let j = 0; j < numStaging; j++) {
					const locId = generateId();
					whState.outboundLocations.push(locId);
					exporter.writeRow("storage_unit", {
						id: locId,
						warehouseId: whId,
						floorId,
						zoneId,
						code: `OUT-STG-${j + 1}`,
						type: "STAGING",
						status: "ACTIVE",
						createdAt: now,
						updatedAt: now,
					});
				}
			} else if (z.type === "BULK") {
				// Random layout: a mix of floor locations and tall racks
				const numFloorLocations = faker.number.int({ min: 5, max: 20 });
				for (let f = 0; f < numFloorLocations; f++) {
					const locId = generateId();
					whState.bulkLocations.push(locId);
					exporter.writeRow("storage_unit", {
						id: locId,
						warehouseId: whId,
						floorId,
						zoneId,
						code: `BLK-FLR-${f + 1}`,
						type: "FLOOR_LOCATION",
						status: "ACTIVE",
						createdAt: now,
						updatedAt: now,
					});
				}

				const numRacks = faker.number.int({ min: 5, max: 15 });
				for (let r = 0; r < numRacks; r++) {
					const rackId = generateId();
					exporter.writeRow("storage_unit", {
						id: rackId,
						warehouseId: whId,
						floorId,
						zoneId,
						code: `BLK-R${r + 1}`,
						type: "RACK",
						status: "ACTIVE",
						createdAt: now,
						updatedAt: now,
					});
					const numLevels = faker.number.int({ min: 3, max: 6 });
					for (let l = 0; l < numLevels; l++) {
						const levelId = generateId();
						exporter.writeRow("storage_unit", {
							id: levelId,
							warehouseId: whId,
							floorId,
							zoneId,
							parentStorageUnitId: rackId,
							code: `BLK-R${r + 1}-L${l + 1}`,
							type: "RACK_LEVEL",
							levelIndex: l,
							status: "ACTIVE",
							createdAt: now,
							updatedAt: now,
						});
						const numSlots = faker.number.int({ min: 4, max: 8 });
						for (let s = 0; s < numSlots; s++) {
							const slotId = generateId();
							whState.bulkLocations.push(slotId);
							exporter.writeRow("storage_unit", {
								id: slotId,
								warehouseId: whId,
								floorId,
								zoneId,
								parentStorageUnitId: levelId,
								code: `BLK-R${r + 1}-L${l + 1}-S${s + 1}`,
								type: "PALLET_SLOT",
								positionIndex: s,
								status: "ACTIVE",
								createdAt: now,
								updatedAt: now,
							});
						}
					}
				}
			} else if (z.type === "PICKING") {
				const numShelves = faker.number.int({ min: 10, max: 30 });
				for (let s = 0; s < numShelves; s++) {
					const shelfId = generateId();
					exporter.writeRow("storage_unit", {
						id: shelfId,
						warehouseId: whId,
						floorId,
						zoneId,
						code: `PCK-S${s + 1}`,
						type: "SHELF",
						status: "ACTIVE",
						createdAt: now,
						updatedAt: now,
					});
					const numLevels = faker.number.int({ min: 4, max: 7 });
					for (let l = 0; l < numLevels; l++) {
						const levelId = generateId();
						exporter.writeRow("storage_unit", {
							id: levelId,
							warehouseId: whId,
							floorId,
							zoneId,
							parentStorageUnitId: shelfId,
							code: `PCK-S${s + 1}-L${l + 1}`,
							type: "SHELF_LEVEL",
							levelIndex: l,
							status: "ACTIVE",
							createdAt: now,
							updatedAt: now,
						});
						const numBins = faker.number.int({ min: 5, max: 12 });
						for (let b = 0; b < numBins; b++) {
							const binId = generateId();
							whState.pickingBins.push(binId);
							exporter.writeRow("storage_unit", {
								id: binId,
								warehouseId: whId,
								floorId,
								zoneId,
								parentStorageUnitId: levelId,
								code: `PCK-S${s + 1}-L${l + 1}-B${b + 1}`,
								type: "BIN",
								positionIndex: b,
								status: "ACTIVE",
								createdAt: now,
								updatedAt: now,
							});
						}
					}
				}
			}
		}

		state.warehouses.push(whState);
	}

	return state;
}
