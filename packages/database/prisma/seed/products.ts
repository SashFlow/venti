import { db } from "../client";

// Helper to generate a mock EAN-13 barcode
const generateBarcode = () =>
	Math.floor(1000000000000 + Math.random() * 9000000000000).toString();

async function main() {
	console.log("🌱 Starting database seed...");

	// Clean up existing products to prevent unique constraint violations on re-run
	const currentOrganization = await db.organization.findFirst();

	// 2. Define the 25 Product templates and their 5 SKU variations
	const productsToSeed = [
		{
			name: "Daikin Fit Heat Pump System",
			description: "Variable-speed inverter residential heat pump unit.",
			isSerialTracked: true,
			life: 7300, // 20 years
			returnEnabled: true,
			onReturn: "REFURBISH",
			deadStockValue: 1200.0,
			deadStockAction: "RETURN_TO_FACTORY",
			variants: [
				{ label: "1.5 Ton", price: 2100.0, weight: 150 },
				{ label: "2.0 Ton", price: 2400.0, weight: 165 },
				{ label: "3.0 Ton", price: 2800.0, weight: 190 },
				{ label: "4.0 Ton", price: 3200.0, weight: 215 },
				{ label: "5.0 Ton", price: 3600.0, weight: 240 },
			],
		},
		{
			name: "VRV IV-X Outdoor Unit",
			description:
				"Commercial variable refrigerant volume outdoor condenser.",
			isSerialTracked: true,
			life: 9125, // 25 years
			returnEnabled: true,
			onReturn: "RETURN_TO_FACTORY",
			deadStockValue: 5000.0,
			deadStockAction: "RETURN_TO_FACTORY",
			variants: [
				{ label: "6 Ton", price: 8500.0, weight: 400 },
				{ label: "8 Ton", price: 10500.0, weight: 450 },
				{ label: "10 Ton", price: 12000.0, weight: 520 },
				{ label: "12 Ton", price: 14500.0, weight: 600 },
				{ label: "14 Ton", price: 16000.0, weight: 680 },
			],
		},
		{
			name: "SkyAir Ceiling Cassette",
			description: "Flush-mount commercial indoor unit.",
			isSerialTracked: true,
			returnEnabled: true,
			onReturn: "REFURBISH",
			deadStockValue: 400.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "18k BTU", price: 1200.0, weight: 55 },
				{ label: "24k BTU", price: 1450.0, weight: 60 },
				{ label: "30k BTU", price: 1700.0, weight: 65 },
				{ label: "36k BTU", price: 1950.0, weight: 75 },
				{ label: "42k BTU", price: 2200.0, weight: 85 },
			],
		},
		{
			name: "R-32 Refrigerant Cylinder",
			description: "Next-generation low-GWP refrigerant gas.",
			isBatchTracked: true,
			isPerishable: true,
			life: 1825, // 5 years shelf life
			returnEnabled: true,
			onReturn: "RETURN_TO_VENDOR",
			deadStockValue: 50.0,
			deadStockAction: "RETURN_TO_VENDOR",
			variants: [
				{ label: "5 lb", price: 75.0, weight: 6.5 },
				{ label: "10 lb", price: 140.0, weight: 12 },
				{ label: "25 lb", price: 300.0, weight: 28 },
				{ label: "50 lb", price: 550.0, weight: 55 },
				{ label: "100 lb", price: 1000.0, weight: 110 },
			],
		},
		{
			name: "Daikin One+ Smart Thermostat",
			description: "Cloud-connected intelligent HVAC controller.",
			isSerialTracked: true,
			returnEnabled: true,
			defaultReturnWindowDays: 60,
			onReturn: "RESTOCK",
			deadStockValue: 150.0,
			deadStockAction: "REFURBISH",
			variants: [
				{ label: "Base", price: 299.0, weight: 1.5 },
				{ label: "Lite", price: 249.0, weight: 1.2 },
				{ label: "Premium", price: 399.0, weight: 1.8 },
				{ label: "Pro (Installer)", price: 349.0, weight: 1.8 },
				{ label: "Commercial Touch", price: 499.0, weight: 2.5 },
			],
		},
		{
			name: "HEPA Air Filter Replacement",
			description:
				"MERV 16 rated high-efficiency particulate air filter.",
			isBatchTracked: true,
			returnEnabled: true,
			onReturn: "SCRAP",
			deadStockValue: 5.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "16x20x1", price: 35.0, weight: 0.8 },
				{ label: "16x25x1", price: 38.0, weight: 1.0 },
				{ label: "20x20x1", price: 40.0, weight: 1.0 },
				{ label: "20x25x1", price: 45.0, weight: 1.2 },
				{ label: "24x24x1", price: 50.0, weight: 1.4 },
			],
		},
		{
			name: "Inverter Scroll Compressor",
			description:
				"Replacement high-efficiency variable scroll compressor.",
			isSerialTracked: true,
			returnEnabled: true,
			onReturn: "REFURBISH",
			deadStockValue: 300.0,
			deadStockAction: "RETURN_TO_FACTORY",
			variants: [
				{ label: "2 HP", price: 850.0, weight: 45 },
				{ label: "3 HP", price: 1100.0, weight: 55 },
				{ label: "4 HP", price: 1350.0, weight: 65 },
				{ label: "5 HP", price: 1600.0, weight: 75 },
				{ label: "6 HP", price: 1900.0, weight: 85 },
			],
		},
		{
			name: "Condenser Fan Motor",
			description: "OEM replacement outdoor fan motor (ECM).",
			isBatchTracked: true,
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 40.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "1/4 HP", price: 120.0, weight: 12 },
				{ label: "1/3 HP", price: 145.0, weight: 14 },
				{ label: "1/2 HP", price: 175.0, weight: 16 },
				{ label: "3/4 HP", price: 210.0, weight: 20 },
				{ label: "1 HP", price: 260.0, weight: 25 },
			],
		},
		{
			name: "Evaporator A-Coil",
			description: "All-aluminum indoor evaporator heat exchanger.",
			isSerialTracked: true,
			returnEnabled: true,
			onReturn: "REFURBISH",
			deadStockValue: 150.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "2.0 Ton", price: 450.0, weight: 40 },
				{ label: "3.0 Ton", price: 550.0, weight: 50 },
				{ label: "4.0 Ton", price: 650.0, weight: 60 },
				{ label: "5.0 Ton", price: 750.0, weight: 70 },
				{ label: "6.0 Ton", price: 850.0, weight: 80 },
			],
		},
		{
			name: "Electronic Expansion Valve (EXV)",
			description: "Precision refrigerant metering device.",
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 20.0,
			deadStockAction: "RETURN_TO_VENDOR",
			variants: [
				{ label: "3/8 inch", price: 85.0, weight: 0.5 },
				{ label: "1/2 inch", price: 95.0, weight: 0.6 },
				{ label: "5/8 inch", price: 110.0, weight: 0.8 },
				{ label: "7/8 inch", price: 130.0, weight: 1.1 },
				{ label: "1-1/8 inch", price: 160.0, weight: 1.5 },
			],
		},
		{
			name: "Main Control Board / PCB",
			description: "OEM motherboard logic controller.",
			isSerialTracked: true,
			returnEnabled: true,
			onReturn: "REFURBISH",
			deadStockValue: 50.0,
			deadStockAction: "RETURN_TO_FACTORY",
			variants: [
				{ label: "Indoor Mini-Split", price: 250.0, weight: 1.2 },
				{ label: "Outdoor Mini-Split", price: 320.0, weight: 1.5 },
				{ label: "VRV Master Controller", price: 850.0, weight: 3.0 },
				{ label: "RTU Logic Board", price: 450.0, weight: 2.0 },
				{ label: "Chiller Display Board", price: 600.0, weight: 2.5 },
			],
		},
		{
			name: "Condensate Drain Pump",
			description: "Automatic water removal pump for indoor units.",
			isBatchTracked: true,
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 15.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "15ft Lift", price: 65.0, weight: 3.5 },
				{ label: "20ft Lift", price: 75.0, weight: 4.0 },
				{ label: "22ft Lift", price: 85.0, weight: 4.2 },
				{ label: "24ft Lift", price: 95.0, weight: 4.5 },
				{ label: "30ft Lift (Heavy Duty)", price: 130.0, weight: 6.0 },
			],
		},
		{
			name: "Copper Tubing Line Set",
			description: "Insulated pre-flared refrigerant piping.",
			isBatchTracked: true,
			returnEnabled: true,
			onReturn: "SCRAP",
			deadStockValue: 20.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "15 ft (3/8 x 3/4)", price: 85.0, weight: 10 },
				{ label: "25 ft (3/8 x 3/4)", price: 135.0, weight: 16 },
				{ label: "35 ft (3/8 x 3/4)", price: 185.0, weight: 22 },
				{ label: "50 ft (3/8 x 3/4)", price: 260.0, weight: 32 },
				{ label: "100 ft (3/8 x 3/4)", price: 500.0, weight: 65 },
			],
		},
		{
			name: "Magnetic Contactor",
			description: "Heavy duty electrical switching relay.",
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 5.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "20A / 2-Pole", price: 25.0, weight: 0.8 },
				{ label: "30A / 2-Pole", price: 35.0, weight: 1.0 },
				{ label: "40A / 3-Pole", price: 45.0, weight: 1.2 },
				{ label: "50A / 3-Pole", price: 60.0, weight: 1.5 },
				{ label: "60A / 3-Pole", price: 75.0, weight: 1.8 },
			],
		},
		{
			name: "Compressor Oil (PVE)",
			description: "Polyvinyl Ether synthetic compressor lubricant.",
			isBatchTracked: true,
			returnEnabled: true,
			onReturn: "SCRAP", // Contaminated fluids are scrapped
			deadStockValue: 0.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "1 Pint", price: 28.0, weight: 1.2 },
				{ label: "1 Quart", price: 45.0, weight: 2.1 },
				{ label: "1 Gallon", price: 150.0, weight: 8.5 },
				{ label: "5 Gallon Bucket", price: 650.0, weight: 42 },
				{ label: "55 Gallon Drum", price: 6500.0, weight: 460 },
			],
		},
		{
			name: "Temperature Thermistor Sensor",
			description: "High-precision NTC resistance temperature probe.",
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 2.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "Ambient Air", price: 15.0, weight: 0.1 },
				{ label: "Liquid Line", price: 18.0, weight: 0.1 },
				{ label: "Gas Line", price: 18.0, weight: 0.1 },
				{ label: "Discharge Pipe", price: 25.0, weight: 0.15 },
				{ label: "Suction Pipe", price: 22.0, weight: 0.15 },
			],
		},
		{
			name: "Pressure Transducer",
			description: "Electronic refrigerant pressure monitoring sensor.",
			returnEnabled: true,
			onReturn: "RETURN_TO_VENDOR",
			deadStockValue: 15.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "Low Pressure (0-200 psi)", price: 85.0, weight: 0.3 },
				{ label: "Mid Pressure (0-400 psi)", price: 95.0, weight: 0.3 },
				{
					label: "High Pressure (0-600 psi)",
					price: 110.0,
					weight: 0.4,
				},
				{ label: "Ultra-low Pressure", price: 150.0, weight: 0.4 },
				{ label: "Ultra-high Pressure", price: 175.0, weight: 0.5 },
			],
		},
		{
			name: "Brazed Plate Heat Exchanger",
			description: "Stainless steel commercial heat transfer plate pack.",
			isSerialTracked: true,
			returnEnabled: true,
			onReturn: "RETURN_TO_FACTORY",
			deadStockValue: 200.0,
			deadStockAction: "REFURBISH",
			variants: [
				{ label: "10 Plate", price: 450.0, weight: 15 },
				{ label: "20 Plate", price: 650.0, weight: 25 },
				{ label: "30 Plate", price: 850.0, weight: 35 },
				{ label: "40 Plate", price: 1100.0, weight: 45 },
				{ label: "50 Plate", price: 1350.0, weight: 55 },
			],
		},
		{
			name: "Rubber Vibration Isolator Pads",
			description: "Anti-vibration mounting pads for outdoor units.",
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 1.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: '2" x 2" x 7/8"', price: 5.0, weight: 0.2 },
				{ label: '4" x 4" x 7/8"', price: 12.0, weight: 0.8 },
				{ label: '6" x 6" x 7/8"', price: 22.0, weight: 1.8 },
				{ label: '8" x 8" x 7/8"', price: 35.0, weight: 3.2 },
				{ label: '12" x 12" x 7/8"', price: 65.0, weight: 7.5 },
			],
		},
		{
			name: "Reversing Valve",
			description: "4-way heat pump cycle reversing valve.",
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 20.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "1.0 - 1.5 Ton", price: 85.0, weight: 1.5 },
				{ label: "2.0 - 2.5 Ton", price: 110.0, weight: 2.0 },
				{ label: "3.0 Ton", price: 135.0, weight: 2.5 },
				{ label: "4.0 Ton", price: 165.0, weight: 3.0 },
				{ label: "5.0 Ton", price: 195.0, weight: 3.5 },
			],
		},
		{
			name: "Duct Smoke Detector",
			description: "Commercial AHU air sampling smoke detector.",
			isSerialTracked: true,
			returnEnabled: true,
			onReturn: "RETURN_TO_VENDOR",
			deadStockValue: 40.0,
			deadStockAction: "RETURN_TO_VENDOR",
			variants: [
				{ label: "Photoelectric Base", price: 120.0, weight: 2.2 },
				{ label: "Ionization Base", price: 140.0, weight: 2.2 },
				{ label: "2-Wire Addressable", price: 180.0, weight: 2.5 },
				{ label: "4-Wire Conventional", price: 160.0, weight: 2.5 },
				{ label: "Wireless Integrated", price: 250.0, weight: 2.8 },
			],
		},
		{
			name: "UV Air Purifier Bulb",
			description: "UVC germicidal replacement lamp.",
			isBatchTracked: true,
			returnEnabled: true,
			onReturn: "SCRAP",
			deadStockValue: 5.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: '12" Standard', price: 45.0, weight: 0.5 },
				{ label: '14" High-Output', price: 55.0, weight: 0.6 },
				{ label: '16" Standard', price: 60.0, weight: 0.7 },
				{ label: '18" High-Output', price: 75.0, weight: 0.8 },
				{ label: '24" Commercial', price: 110.0, weight: 1.2 },
			],
		},
		{
			name: "Centrifugal Blower Wheel",
			description: "Galvanized steel indoor fan impeller.",
			returnEnabled: true,
			onReturn: "REFURBISH",
			deadStockValue: 15.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: '9" x 7"', price: 85.0, weight: 8.5 },
				{ label: '10" x 8"', price: 110.0, weight: 10.5 },
				{ label: '10" x 10"', price: 135.0, weight: 12.0 },
				{ label: '11" x 10"', price: 160.0, weight: 14.5 },
				{ label: '12" x 12"', price: 210.0, weight: 18.0 },
			],
		},
		{
			name: "Defrost Heater Assembly",
			description: "Evaporator electrical defrost element.",
			returnEnabled: true,
			onReturn: "RESTOCK",
			deadStockValue: 10.0,
			deadStockAction: "SCRAP",
			variants: [
				{ label: "500W", price: 45.0, weight: 1.2 },
				{ label: "1000W", price: 65.0, weight: 1.5 },
				{ label: "1500W", price: 85.0, weight: 1.8 },
				{ label: "2000W", price: 110.0, weight: 2.2 },
				{ label: "2500W", price: 135.0, weight: 2.6 },
			],
		},
		{
			name: "Packaged Rooftop Unit (RTU)",
			description: "All-in-one commercial heating and cooling plant.",
			isSerialTracked: true,
			life: 7300,
			returnEnabled: true,
			onReturn: "RETURN_TO_FACTORY",
			deadStockValue: 1500.0,
			deadStockAction: "RETURN_TO_FACTORY",
			variants: [
				{ label: "5 Ton", price: 6500.0, weight: 850 },
				{ label: "7.5 Ton", price: 9200.0, weight: 1100 },
				{ label: "10 Ton", price: 12500.0, weight: 1450 },
				{ label: "15 Ton", price: 17000.0, weight: 1850 },
				{ label: "20 Ton", price: 22000.0, weight: 2400 },
			],
		},
	];

	// 3. Insert Products and Nested SKUs
	for (let i = 0; i < productsToSeed.length; i++) {
		const template = productsToSeed[i];

		// Generate a unique base code for the product
		const productBaseCode = `${template.name.slice(0, 3)}-${(i + 1).toString()}`;

		await db.product.create({
			data: {
				organizationId: currentOrganization?.id || "",
				name: template.name,
				description: template.description,
				isPerishable: template.isPerishable ?? false,
				isBatchTracked: template.isBatchTracked ?? false,
				isSerialTracked: template.isSerialTracked ?? false,
				life: template.life ?? 0,
				returnEnabled: template.returnEnabled,
				defaultReturnWindowDays: template.defaultReturnWindowDays ?? 30,
				onReturn: template.onReturn as
					| "REFURBISH"
					| "RETURN_TO_FACTORY"
					| "RETURN_TO_VENDOR"
					| "RESTOCK"
					| "SCRAP",
				deadStockValue: template.deadStockValue,
				deadStockAction: template.deadStockAction as
					| "RETURN_TO_FACTORY"
					| "RETURN_TO_VENDOR"
					| "REFURBISH"
					| "SCRAP",

				// Nested create for the 5 SKUs
				skus: {
					create: template.variants.map((variant, vIdx) => ({
						code: `${productBaseCode}-V${vIdx + 1}`,
						barcode: generateBarcode(),
						unitPrice: variant.price,
						weight: variant.weight,
						width: Math.floor(Math.random() * 20) + 5, // Mocked dimensions
						height: Math.floor(Math.random() * 20) + 5,
						length: Math.floor(Math.random() * 20) + 5,
						metadata: {
							variantLabel: variant.label,
							brand: "Daikin",
							category: template.name.includes("Thermostat")
								? "Controls"
								: "HVAC",
						},
					})),
				},
			},
		});

		console.log(`✅ Inserted: ${template.name} (with 5 SKUs)`);
	}

	console.log("🎉 Seed complete! Inserted 25 Products and 125 SKUs.");
}

main().catch((e) => {
	console.error("Error seeding database:", e);
});
