import { faker } from "@faker-js/faker";
import { CONFIG } from "./config";
import type { CsvExporter } from "./export";
import { generateId } from "./utils";

export interface State {
	orgId: string;
	users: string[];
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

	// Suppliers
	for (let i = 0; i < CONFIG.NUM_SUPPLIERS; i++) {
		const id = generateId();
		state.suppliers.push(id);
		exporter.writeRow("Supplier", {
			id,
			organizationId: state.orgId,
			name: `Supplier ${i + 1} - ${faker.company.name()}`,
			type: "VENDOR",
			createdAt: now,
		});
	}

	// Customers
	for (let i = 0; i < CONFIG.NUM_CUSTOMERS; i++) {
		const id = generateId();
		state.customers.push(id);
		exporter.writeRow("Customer", {
			id,
			organizationId: state.orgId,
			name: `Customer ${i + 1} - ${faker.company.name()}`,
			type: "RETAIL",
			createdAt: now,
		});
	}

	// Products & SKUs
	for (let i = 0; i < CONFIG.NUM_SKUS_PER_PRODUCT; i++) {
		const productId = generateId();
		const skuId = generateId();
		const isSerialized = Math.random() < CONFIG.SKU_TYPE_PROBS.SERIALIZED;
		const isBatch =
			!isSerialized &&
			Math.random() <
				CONFIG.SKU_TYPE_PROBS.BATCH_TRACKED /
					(1 - CONFIG.SKU_TYPE_PROBS.SERIALIZED);

		state.skus.push({
			id: skuId,
			serialTracking: isSerialized,
			batchTracking: isBatch,
		});

		const productName = `Product ${i + 1} - ${faker.commerce.productName()}`;

		exporter.writeRow("Product", {
			id: productId,
			createdAt: now,
			updatedAt: now,
			organizationId: state.orgId,
			name: productName,
			isBatchTracked: isBatch,
			isSerialTracked: isSerialized,
			isPerishable: isBatch && Math.random() > 0.5,
		});

		exporter.writeRow("SKU", {
			id: skuId,
			createdAt: now,
			updatedAt: now,
			productId: productId,
			code: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
			organizationId: state.orgId,
		});
	}

	// Warehouses & Physical Layouts
	for (let i = 0; i < CONFIG.NUM_WAREHOUSES; i++) {
		const whId = generateId();
		const floorId = generateId();
		const addressId = generateId();

		const whState = {
			id: whId,
			pickingBins: [] as string[],
			bulkLocations: [] as string[],
			inboundLocations: [] as string[],
			outboundLocations: [] as string[],
		};

		exporter.writeRow("address", {
			id: addressId,
			addressLine1: faker.location.streetAddress(),
			addressLine2: null,
			city: faker.location.city(),
			state: faker.location.state(),
			zip: faker.location.zipCode(),
			country: faker.location.country(),
			createdAt: now,
			updatedAt: now,
		});

		exporter.writeRow("Warehouse", {
			id: whId,
			createdAt: now,
			updatedAt: now,
			organizationId: state.orgId,
			code: `WH-${i + 1}`,
			name: `${faker.location.city()} Distribution Center`,
			timezone: "UTC",
			addressId,
			sameReturn: true,
			status: "ACTIVE",
		});

		exporter.writeRow("Location", {
			id: floorId,
			createdAt: now,
			updatedAt: now,
			warehouseId: whId,
			parentLocationId: null,
			code: "FL-1",
			name: "Main Floor",
			type: "FLOOR",
			isPickable: false,
			isReceivable: false,
			isReservable: false,
			isQuarantine: false,
			x: 0,
			y: 0,
			z: 0,
			width: CONFIG.FLOOR_WIDTH_MM,
			height: 0,
			depth: CONFIG.FLOOR_LENGTH_MM,
		});

		// Zones
		const zones = [
			{
				type: "ZONE",
				code: "Z-IN",
				name: "Inbound Staging",
				isReceivable: true,
				isPickable: false,
				isQuarantine: false,
			},
			{
				type: "ZONE",
				code: "Z-OUT",
				name: "Outbound Staging",
				isReceivable: false,
				isPickable: false,
				isQuarantine: false,
			},
			{
				type: "ZONE",
				code: "Z-BLK",
				name: "Bulk Storage",
				isReceivable: true,
				isPickable: true,
				isQuarantine: false,
			},
			{
				type: "ZONE",
				code: "Z-PCK",
				name: "Picking Area",
				isReceivable: true,
				isPickable: true,
				isQuarantine: false,
			},
			{
				type: "ZONE",
				code: "Z-QC",
				name: "Quality Control",
				isReceivable: true,
				isPickable: false,
				isQuarantine: true,
			},
		];

		for (const z of zones) {
			const zoneId = generateId();
			exporter.writeRow("Location", {
				id: zoneId,
				createdAt: now,
				updatedAt: now,
				warehouseId: whId,
				parentLocationId: floorId,
				code: z.code,
				name: z.name,
				type: z.type,
				isPickable: z.isPickable,
				isReceivable: z.isReceivable,
				isReservable: true,
				isQuarantine: z.isQuarantine,
				x: null,
				y: null,
				z: null,
				width: null,
				height: null,
				depth: null,
			});

			if (z.code === "Z-IN") {
				const numStaging = faker.number.int({ min: 3, max: 8 });
				for (let j = 0; j < numStaging; j++) {
					const locId = generateId();
					whState.inboundLocations.push(locId);
					exporter.writeRow("Location", {
						id: locId,
						createdAt: now,
						updatedAt: now,
						warehouseId: whId,
						parentLocationId: zoneId,
						code: `IN-STG-${j + 1}`,
						name: `Inbound Staging ${j + 1}`,
						type: "BIN",
						isPickable: false,
						isReceivable: true,
						isReservable: true,
						isQuarantine: false,
						x: null,
						y: null,
						z: null,
						width: null,
						height: null,
						depth: null,
					});
				}
			} else if (z.code === "Z-OUT") {
				const numStaging = faker.number.int({ min: 3, max: 8 });
				for (let j = 0; j < numStaging; j++) {
					const locId = generateId();
					whState.outboundLocations.push(locId);
					exporter.writeRow("Location", {
						id: locId,
						createdAt: now,
						updatedAt: now,
						warehouseId: whId,
						parentLocationId: zoneId,
						code: `OUT-STG-${j + 1}`,
						name: `Outbound Staging ${j + 1}`,
						type: "BIN",
						isPickable: false,
						isReceivable: false,
						isReservable: false,
						isQuarantine: false,
						x: null,
						y: null,
						z: null,
						width: null,
						height: null,
						depth: null,
					});
				}
			} else if (z.code === "Z-BLK") {
				const numRacks = faker.number.int({ min: 5, max: 15 });
				for (let r = 0; r < numRacks; r++) {
					const rackId = generateId();
					exporter.writeRow("Location", {
						id: rackId,
						createdAt: now,
						updatedAt: now,
						warehouseId: whId,
						parentLocationId: zoneId,
						code: `BLK-R${r + 1}`,
						name: `Bulk Rack ${r + 1}`,
						type: "RACK",
						isPickable: false,
						isReceivable: false,
						isReservable: false,
						isQuarantine: false,
						x: null,
						y: null,
						z: null,
						width: null,
						height: null,
						depth: null,
					});
					const numLevels = faker.number.int({ min: 3, max: 6 });
					for (let l = 0; l < numLevels; l++) {
						const levelId = generateId();
						exporter.writeRow("Location", {
							id: levelId,
							createdAt: now,
							updatedAt: now,
							warehouseId: whId,
							parentLocationId: rackId,
							code: `BLK-R${r + 1}-L${l + 1}`,
							name: `Bulk Rack ${r + 1} Level ${l + 1}`,
							type: "SHELF",
							isPickable: false,
							isReceivable: false,
							isReservable: false,
							isQuarantine: false,
							x: null,
							y: null,
							z: null,
							width: null,
							height: null,
							depth: null,
						});
						const numSlots = faker.number.int({ min: 4, max: 8 });
						for (let s = 0; s < numSlots; s++) {
							const slotId = generateId();
							whState.bulkLocations.push(slotId);
							exporter.writeRow("Location", {
								id: slotId,
								createdAt: now,
								updatedAt: now,
								warehouseId: whId,
								parentLocationId: levelId,
								code: `BLK-R${r + 1}-L${l + 1}-S${s + 1}`,
								name: `Bulk Rack ${r + 1} Level ${l + 1} Slot ${s + 1}`,
								type: "BIN",
								isPickable: true,
								isReceivable: true,
								isReservable: true,
								isQuarantine: false,
								x: null,
								y: null,
								z: null,
								width: null,
								height: null,
								depth: null,
							});
						}
					}
				}
			} else if (z.code === "Z-PCK") {
				const numRacks = faker.number.int({ min: 10, max: 20 });
				for (let r = 0; r < numRacks; r++) {
					const rackId = generateId();
					exporter.writeRow("Location", {
						id: rackId,
						createdAt: now,
						updatedAt: now,
						warehouseId: whId,
						parentLocationId: zoneId,
						code: `PCK-R${r + 1}`,
						name: `Picking Rack ${r + 1}`,
						type: "RACK",
						isPickable: false,
						isReceivable: false,
						isReservable: false,
						isQuarantine: false,
						x: null,
						y: null,
						z: null,
						width: null,
						height: null,
						depth: null,
					});
					const numLevels = faker.number.int({ min: 3, max: 5 });
					for (let l = 0; l < numLevels; l++) {
						const levelId = generateId();
						exporter.writeRow("Location", {
							id: levelId,
							createdAt: now,
							updatedAt: now,
							warehouseId: whId,
							parentLocationId: rackId,
							code: `PCK-R${r + 1}-L${l + 1}`,
							name: `Picking Rack ${r + 1} Level ${l + 1}`,
							type: "SHELF",
							isPickable: false,
							isReceivable: false,
							isReservable: false,
							isQuarantine: false,
							x: null,
							y: null,
							z: null,
							width: null,
							height: null,
							depth: null,
						});
						const numBins = faker.number.int({ min: 5, max: 10 });
						for (let b = 0; b < numBins; b++) {
							const binId = generateId();
							whState.pickingBins.push(binId);
							exporter.writeRow("Location", {
								id: binId,
								createdAt: now,
								updatedAt: now,
								warehouseId: whId,
								parentLocationId: levelId,
								code: `PCK-R${r + 1}-L${l + 1}-B${b + 1}`,
								name: `Picking Rack ${r + 1} Level ${l + 1} Bin ${b + 1}`,
								type: "BIN",
								isPickable: true,
								isReceivable: true,
								isReservable: true,
								isQuarantine: false,
								x: null,
								y: null,
								z: null,
								width: null,
								height: null,
								depth: null,
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
