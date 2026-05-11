import type { Option, OrganizationToggleState } from "./types";

export const TAB_ITEMS = [
	{ value: "whitelable", label: "Whitelable" },
	{ value: "fulfillment", label: "Fulfillment" },
	{ value: "inventory", label: "Inventory" },
	{ value: "scanning", label: "Barcode Scanning" },
	{ value: "units", label: "Units" },
	{ value: "po", label: "Purchase Orders" },
	{ value: "transfers", label: "Transfers" },
	{ value: "cycle_counts", label: "Cycle Counts" },
	{ value: "metafield_schemas", label: "Metafield Schemas" },
	{ value: "etc", label: "Data Retention" },
] as const;

export const LENGTH_UNIT_OPTIONS: Option[] = [
	{ value: "in", label: "Inches (IN)" },
	{ value: "cm", label: "Centimeters (CM)" },
	{ value: "mm", label: "Millimeters (MM)" },
	{ value: "m", label: "Meters (M)" },
];

export const WEIGHT_UNIT_OPTIONS: Option[] = [
	{ value: "lb", label: "Pounds (LB)" },
	{ value: "oz", label: "Ounces (OZ)" },
	{ value: "kg", label: "Kilograms (KG)" },
	{ value: "g", label: "Grams (G)" },
];

export const CURRENCY_OPTIONS: Option[] = [
	{ value: "usd", label: "US Dollars ($)" },
	{ value: "eur", label: "Euro (EUR)" },
	{ value: "gbp", label: "British Pound (GBP)" },
	{ value: "inr", label: "Indian Rupee (INR)" },
];

export const ABC_VALUATION_OPTIONS: Option[] = [
	{ value: "retail_value", label: "Retail Value" },
	{
		value: "retail_value_after_discounts",
		label: "Retail Value (after discounts)",
	},
	{ value: "unit_cost", label: "Unit Cost" },
];

export const METAFIELD_TYPE_OPTIONS: Option[] = [
	{ value: "single_line_text_field", label: "Single Line Text" },
	{ value: "multi_line_text_field", label: "Multi Line Text" },
	{ value: "number_integer", label: "Integer" },
	{ value: "number_decimal", label: "Decimal" },
	{ value: "boolean", label: "Boolean" },
	{ value: "date", label: "Date" },
];

export const INITIAL_TOGGLES: OrganizationToggleState = {
	outbound_markShipmentAsFulfilled: false,
	batch_notifyCustomerFulfilled: false,
	batch_useShopifyTrackingPage: false,
	batch_generateBarcodes: false,
	batch_partialFulfillment: false,
	batch_printPickSlip: false,
	batch_packAll: false,
	batch_printLicensePlate: false,
	inventory_enableInternalReplenishment: true,
	inventory_enableKitting: true,
	inventory_packaging: true,
	inventory_retainEmptyRecords: false,
	inventory_adjustmentReasonRequired: true,
	inventory_enableSerialization: true,
	inventory_enableExpirationTracking: true,
	inventory_enableLotClassifications: true,
	inventory_oneLotPerBin: true,
	inventory_expirationAsDate: true,
	inventory_abc_enabled: true,
	inventory_enableCostTracking: true,
	batch_scanBinWhenRemovingFromBin: true,
	batch_scanItemWhenRemovingFromBin: true,
	batch_scanEachItem: false,
	batch_scanItemWhenAddingToShipment: true,
	userConfig_enableCameraScanner: true,
	userConfig_enableDevScanner: false,
	userConfig_enableNativeScanner: false,
	scanPrefixValue: false,
	items_generateBarcodes: true,
	items_replaceShopifyBarcodes: false,
	inventory_enablePurchaseOrders: true,
	checkin_enableBinCriteria: true,
	po_oneStepCheckIn: true,
	po_editClosed: true,
	transfers_enabled: true,
	transfers_editClosed: true,
	transfers_oneStepCheckIn: true,
	transfers_enableOverCounting: true,
	cycleCounts_enabled: true,
	cycleCounts_scanBin: true,
	cycleCounts_scanItem: true,
	cycleCounts_showQty: true,
};
