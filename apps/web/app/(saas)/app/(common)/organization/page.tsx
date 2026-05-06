"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/collapsible";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Switch } from "@repo/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/tooltip";
import {
	ArrowRightIcon,
	BoxIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	InfoIcon,
	ScanLineIcon,
	TagIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Option = {
	value: string;
	label: string;
};

const TAB_ITEMS = [
	{ value: "fulfillment", label: "Fulfillment" },
	{ value: "inventory", label: "Inventory" },
	{ value: "scanning", label: "Barcode Scanning" },
	{ value: "units", label: "Units" },
	{ value: "po", label: "Purchase Orders" },
	{ value: "transfers", label: "Transfers" },
	{ value: "cycle_counts", label: "Cycle Counts" },
	{ value: "etc", label: "Data Retention" },
];

const LENGTH_UNIT_OPTIONS: Option[] = [
	{ value: "in", label: "Inches (IN)" },
	{ value: "cm", label: "Centimeters (CM)" },
	{ value: "mm", label: "Millimeters (MM)" },
	{ value: "m", label: "Meters (M)" },
];

const WEIGHT_UNIT_OPTIONS: Option[] = [
	{ value: "lb", label: "Pounds (LB)" },
	{ value: "oz", label: "Ounces (OZ)" },
	{ value: "kg", label: "Kilograms (KG)" },
	{ value: "g", label: "Grams (G)" },
];

const CURRENCY_OPTIONS: Option[] = [
	{ value: "usd", label: "US Dollars ($)" },
	{ value: "eur", label: "Euro (EUR)" },
	{ value: "gbp", label: "British Pound (GBP)" },
	{ value: "inr", label: "Indian Rupee (INR)" },
];

const ABC_VALUATION_OPTIONS: Option[] = [
	{ value: "retail_value", label: "Retail Value" },
	{
		value: "retail_value_after_discounts",
		label: "Retail Value (after discounts)",
	},
	{ value: "unit_cost", label: "Unit Cost" },
];

const INITIAL_TOGGLES: Record<string, boolean> = {
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

function HelpTip({ text }: { text: string }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
					aria-label="More info"
				>
					<InfoIcon className="size-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent className="max-w-72 text-xs">{text}</TooltipContent>
		</Tooltip>
	);
}

function SectionCard({
	id,
	title,
	actions,
	children,
}: {
	id?: string;
	title: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<Card id={id} className="rounded-2xl border">
			<CardContent className="space-y-4 p-4 md:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h3 className="font-semibold text-lg tracking-tight">
						{title}
					</h3>
					{actions}
				</div>
				{children}
			</CardContent>
		</Card>
	);
}

function SwitchRow({
	label,
	description,
	checked,
	onCheckedChange,
	size = "default",
	helpText,
}: {
	label: string;
	description?: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	size?: "sm" | "default";
	helpText?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border p-3">
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<p className="font-medium text-sm">{label}</p>
					{helpText ? <HelpTip text={helpText} /> : null}
				</div>
				{description ? (
					<p className="text-muted-foreground text-xs">
						{description}
					</p>
				) : null}
			</div>
			<Switch
				size={size}
				checked={checked}
				onCheckedChange={onCheckedChange}
			/>
		</div>
	);
}

function SelectRow({
	label,
	value,
	onValueChange,
	options,
	helpText,
}: {
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	options: Option[];
	helpText?: string;
}) {
	return (
		<div className="space-y-2 rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<Label>{label}</Label>
				{helpText ? <HelpTip text={helpText} /> : null}
			</div>
			<Select
				value={value}
				onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

function InputRow({
	label,
	value,
	onChange,
	placeholder,
	type = "text",
	min,
	max,
	helpText,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	type?: "text" | "email" | "number";
	min?: number;
	max?: number;
	helpText?: string;
}) {
	return (
		<div className="space-y-2 rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<Label>{label}</Label>
				{helpText ? <HelpTip text={helpText} /> : null}
			</div>
			<Input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				min={min}
				max={max}
			/>
		</div>
	);
}

function CollapsibleGroup({
	title,
	defaultOpen,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(Boolean(defaultOpen));

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div className="rounded-lg border">
				<CollapsibleTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="h-auto w-full justify-between rounded-lg px-3 py-2"
					>
						<span className="font-medium text-sm">{title}</span>
						{open ? (
							<ChevronDownIcon className="size-4" />
						) : (
							<ChevronRightIcon className="size-4" />
						)}
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-3 border-t p-3">
					{children}
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export default function OrganizationPage() {
	const [toggles, setToggles] = useState(INITIAL_TOGGLES);

	const [ignoreLineItemProperties, setIgnoreLineItemProperties] =
		useState("");
	const [inventoryAdjustmentReasons, setInventoryAdjustmentReasons] =
		useState("");
	const [vendorsEmail, setVendorsEmail] = useState("");
	const [customersRetentionPeriod, setCustomersRetentionPeriod] =
		useState("30");
	const [fulfillmentLabelHeader, setFulfillmentLabelHeader] = useState("");
	const [fulfillmentLabelFooter, setFulfillmentLabelFooter] = useState("");
	const [itemsDefaultLengthUnit, setItemsDefaultLengthUnit] = useState("in");
	const [itemsDefaultWeightUnit, setItemsDefaultWeightUnit] = useState("lb");
	const [displayCurrency, setDisplayCurrency] = useState("usd");
	const [abcValuationMethod, setAbcValuationMethod] =
		useState("retail_value");

	const updateToggle = (key: string, checked: boolean) => {
		setToggles((previous) => ({ ...previous, [key]: checked }));
	};

	return (
		<TooltipProvider>
			<div className="container mx-auto max-w-7xl py-8">
				<h1 className="font-semibold text-2xl tracking-tight">
					Organization
				</h1>
				<p className="mt-2 text-muted-foreground">
					Configure operational settings for fulfillment, inventory,
					scanning, and data policies.
				</p>

				<Tabs
					defaultValue="fulfillment"
					className="flex flex-col py-8 mb-8"
				>
					<TabsList
						variant="line"
						className="w-full justify-start gap-1 overflow-x-auto p-0"
					>
						{TAB_ITEMS.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="flex-none px-3"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value="fulfillment" className="space-y-4">
						<SectionCard id="fulfillment" title="Fulfillment">
							<SwitchRow
								label="Allow shipments to be marked as fulfilled"
								description="Allow fulfillment without requiring carrier label purchase, such as in-store pickup and local delivery."
								checked={
									toggles.outbound_markShipmentAsFulfilled
								}
								onCheckedChange={(checked) =>
									updateToggle(
										"outbound_markShipmentAsFulfilled",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Notify customer when fulfilled"
								description="Send fulfillment notifications through Shopify."
								checked={toggles.batch_notifyCustomerFulfilled}
								onCheckedChange={(checked) =>
									updateToggle(
										"batch_notifyCustomerFulfilled",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Use default Shopify tracking page"
								checked={toggles.batch_useShopifyTrackingPage}
								onCheckedChange={(checked) =>
									updateToggle(
										"batch_useShopifyTrackingPage",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Create barcodes for batches"
								checked={toggles.batch_generateBarcodes}
								onCheckedChange={(checked) =>
									updateToggle(
										"batch_generateBarcodes",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Allow partial fulfillment of orders"
								checked={toggles.batch_partialFulfillment}
								onCheckedChange={(checked) =>
									updateToggle(
										"batch_partialFulfillment",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Allow printing pick slips"
								helpText="Allows printing at the pick stage for paper-assisted workflows."
								checked={toggles.batch_printPickSlip}
								onCheckedChange={(checked) =>
									updateToggle("batch_printPickSlip", checked)
								}
							/>
							<SwitchRow
								label="Allow bulk packing all items"
								helpText="Packs all picked line items into shipment with one action."
								checked={toggles.batch_packAll}
								onCheckedChange={(checked) =>
									updateToggle("batch_packAll", checked)
								}
							/>
							<SwitchRow
								label="Print license plate when packing completes"
								helpText="Prints a shipment license plate label after pack confirmation."
								checked={toggles.batch_printLicensePlate}
								onCheckedChange={(checked) =>
									updateToggle(
										"batch_printLicensePlate",
										checked,
									)
								}
							/>

							<InputRow
								label="Ignore line item properties"
								helpText="Comma-separated patterns ignored when matching line item properties."
								value={ignoreLineItemProperties}
								onChange={setIgnoreLineItemProperties}
								placeholder="Ignore pattern"
							/>

							<CollapsibleGroup title="Label Messages">
								<p className="text-muted-foreground text-sm">
									Configure dynamic label message templates
									for different shipment states and carrier
									actions.
								</p>
								<div className="grid gap-3 md:grid-cols-2">
									<InputRow
										label="Header message"
										value={fulfillmentLabelHeader}
										onChange={setFulfillmentLabelHeader}
										placeholder="Optional header"
									/>
									<InputRow
										label="Footer message"
										value={fulfillmentLabelFooter}
										onChange={setFulfillmentLabelFooter}
										placeholder="Optional footer"
									/>
								</div>
							</CollapsibleGroup>
						</SectionCard>
					</TabsContent>

					<TabsContent value="inventory" className="space-y-4">
						<SectionCard id="inventory" title="Inventory">
							<InputRow
								label="Adjustment reasons"
								value={inventoryAdjustmentReasons}
								onChange={setInventoryAdjustmentReasons}
								placeholder="New reason"
							/>
							<SwitchRow
								label="Enable bin to bin replenishment"
								helpText="Allows internal replenishment transfers between bins."
								checked={
									toggles.inventory_enableInternalReplenishment
								}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_enableInternalReplenishment",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Enable kitting"
								helpText="Allows assembling and disassembling kit SKUs."
								checked={toggles.inventory_enableKitting}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_enableKitting",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Track packaging inventory"
								helpText="Includes cartons and packaging supplies in stock records."
								checked={toggles.inventory_packaging}
								onCheckedChange={(checked) =>
									updateToggle("inventory_packaging", checked)
								}
							/>
							<SwitchRow
								label="Retain empty records"
								helpText="Keeps zero-stock records for reporting continuity."
								checked={toggles.inventory_retainEmptyRecords}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_retainEmptyRecords",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Require adjustment reason"
								checked={
									toggles.inventory_adjustmentReasonRequired
								}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_adjustmentReasonRequired",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Enable serialized inventory"
								checked={toggles.inventory_enableSerialization}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_enableSerialization",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Enable expiration and lot tracking"
								checked={
									toggles.inventory_enableExpirationTracking
								}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_enableExpirationTracking",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Prioritize lot expiration ranges during picking"
								checked={
									toggles.inventory_enableLotClassifications
								}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_enableLotClassifications",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Limit one lot per item per bin"
								helpText="Prevents mixing multiple lots for the same item in a single bin."
								checked={toggles.inventory_oneLotPerBin}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_oneLotPerBin",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Show lot expirations as date"
								description="Example: 5/6/2026"
								checked={toggles.inventory_expirationAsDate}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_expirationAsDate",
										checked,
									)
								}
							/>

							<CollapsibleGroup title="ABC Analysis">
								<SwitchRow
									label="Enable ABC analysis"
									helpText="Classifies SKUs by movement and supports slotting strategies."
									checked={toggles.inventory_abc_enabled}
									onCheckedChange={(checked) =>
										updateToggle(
											"inventory_abc_enabled",
											checked,
										)
									}
								/>

								<div className="space-y-5 rounded-lg border bg-muted/10 p-4">
									<div className="overflow-hidden rounded-md border bg-background">
										<div className="grid grid-cols-[15fr_40fr_45fr] text-center font-semibold text-sm text-white">
											<div className="bg-linear-to-r from-emerald-400 to-lime-400 px-2 py-2">
												A: 15
											</div>
											<div className="border-x border-background/70 bg-linear-to-r from-lime-500 to-amber-500 px-2 py-2">
												B: 40
											</div>
											<div className="bg-linear-to-r from-amber-500 to-orange-500 px-2 py-2">
												C: 45
											</div>
										</div>
									</div>

									<div className="grid gap-3 md:grid-cols-[1fr_400px] md:items-center">
										<div className="flex items-center gap-2">
											<p className="font-semibold text-sm">
												Valuation Method
											</p>
											<HelpTip text="Choose which value metric should drive A/B/C ranking." />
										</div>
										<Select
											value={abcValuationMethod}
											onValueChange={(nextValue) =>
												setAbcValuationMethod(
													nextValue ?? "",
												)
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{ABC_VALUATION_OPTIONS.map(
													(option) => (
														<SelectItem
															key={option.value}
															value={option.value}
														>
															{option.label}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</div>
								</div>
							</CollapsibleGroup>

							<SwitchRow
								label="Enable cost tracking"
								helpText="Enables inventory valuation and cost-aware operational reports."
								checked={toggles.inventory_enableCostTracking}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_enableCostTracking",
										checked,
									)
								}
							/>
						</SectionCard>
					</TabsContent>

					<TabsContent value="scanning" className="space-y-4">
						<SectionCard
							id="scanning"
							title="Barcode Scanning"
							actions={
								<Button asChild size="sm">
									<Link href="/company/features/scanner-setup">
										<ScanLineIcon className="size-4" />
										<span>Scanner Setup</span>
									</Link>
								</Button>
							}
						>
							<div className="space-y-6 rounded-xl border bg-muted/20 p-4 md:p-6">
								<p className="font-semibold text-sm">
									Fulfillment Scan Points:
								</p>

								<div className="grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start">
									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
												<BoxIcon className="size-5" />
											</div>
											<p className="font-semibold text-base">
												Bin
											</p>
										</div>

										<div className="space-y-2">
											<div className="flex items-center gap-2 pl-1">
												<p className="font-semibold text-xl">
													Pick
												</p>
												<ArrowRightIcon className="size-4 text-muted-foreground" />
											</div>
											<div className="flex items-center gap-3 pl-1">
												<Switch
													size="sm"
													checked={
														toggles.batch_scanBinWhenRemovingFromBin
													}
													onCheckedChange={(
														checked,
													) =>
														updateToggle(
															"batch_scanBinWhenRemovingFromBin",
															checked,
														)
													}
												/>
												<p className="font-semibold text-sm">
													Scan Bin
												</p>
											</div>
											<div className="flex items-center gap-3 pl-1">
												<Switch
													size="sm"
													checked={
														toggles.batch_scanItemWhenRemovingFromBin
													}
													onCheckedChange={(
														checked,
													) =>
														updateToggle(
															"batch_scanItemWhenRemovingFromBin",
															checked,
														)
													}
												/>
												<p className="font-semibold text-sm">
													Scan Item
												</p>
											</div>
											<div className="flex items-center gap-3 pl-1">
												<Switch
													size="sm"
													checked={
														toggles.batch_scanEachItem
													}
													onCheckedChange={(
														checked,
													) =>
														updateToggle(
															"batch_scanEachItem",
															checked,
														)
													}
												/>
												<p className="font-semibold text-sm">
													1 scan = 1 qty
												</p>
											</div>
										</div>
									</div>

									<div className="hidden self-center md:block">
										<ArrowRightIcon className="size-5 text-muted-foreground" />
									</div>

									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
												<TagIcon className="size-5" />
											</div>
											<p className="font-semibold text-base">
												Batch
											</p>
										</div>
										<div className="space-y-2 pl-1">
											<div className="flex items-center gap-2">
												<p className="font-semibold text-xl">
													Pack
												</p>
												<ArrowRightIcon className="size-4 text-muted-foreground" />
											</div>
											<div className="flex items-center gap-3">
												<Switch
													size="sm"
													checked={
														toggles.batch_scanItemWhenAddingToShipment
													}
													onCheckedChange={(
														checked,
													) =>
														updateToggle(
															"batch_scanItemWhenAddingToShipment",
															checked,
														)
													}
												/>
												<p className="font-semibold text-sm">
													Scan Item
												</p>
											</div>
										</div>
									</div>

									<div className="hidden self-center md:block">
										<ArrowRightIcon className="size-5 text-muted-foreground" />
									</div>

									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
												<BoxIcon className="size-5" />
											</div>
											<p className="font-semibold text-base">
												Shipment
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-3 pt-1">
								<div className="flex items-center justify-between gap-4">
									<p className="font-semibold text-base">
										Enable webcam scanner
									</p>
									<Switch
										checked={
											toggles.userConfig_enableCameraScanner
										}
										onCheckedChange={(checked) =>
											updateToggle(
												"userConfig_enableCameraScanner",
												checked,
											)
										}
									/>
								</div>
								<div className="flex items-center justify-between gap-4">
									<p className="font-semibold text-base">
										Enable test scanner
									</p>
									<Switch
										checked={
											toggles.userConfig_enableDevScanner
										}
										onCheckedChange={(checked) =>
											updateToggle(
												"userConfig_enableDevScanner",
												checked,
											)
										}
									/>
								</div>
								<div className="flex items-center justify-between gap-4">
									<p className="font-semibold text-base">
										Enable native scanner (BLE / USB)
									</p>
									<Switch
										checked={
											toggles.userConfig_enableNativeScanner
										}
										onCheckedChange={(checked) =>
											updateToggle(
												"userConfig_enableNativeScanner",
												checked,
											)
										}
									/>
								</div>
								<div className="flex items-center justify-between gap-4">
									<p className="font-semibold text-base">
										Listen for hardware scans
									</p>
									<Switch
										checked={toggles.scanPrefixValue}
										onCheckedChange={(checked) =>
											updateToggle(
												"scanPrefixValue",
												checked,
											)
										}
									/>
								</div>
							</div>
						</SectionCard>
					</TabsContent>

					<TabsContent value="units" className="space-y-4">
						<SectionCard id="units" title="Units">
							<SelectRow
								label="Default length unit"
								value={itemsDefaultLengthUnit}
								onValueChange={setItemsDefaultLengthUnit}
								options={LENGTH_UNIT_OPTIONS}
							/>
							<SelectRow
								label="Default weight unit"
								value={itemsDefaultWeightUnit}
								onValueChange={setItemsDefaultWeightUnit}
								options={WEIGHT_UNIT_OPTIONS}
							/>
							<SelectRow
								label="Display currency"
								helpText="Controls currency formatting in operational screens."
								value={displayCurrency}
								onValueChange={setDisplayCurrency}
								options={CURRENCY_OPTIONS}
							/>
						</SectionCard>
					</TabsContent>

					<TabsContent value="po" className="space-y-4">
						<SectionCard id="po" title="Purchase Orders">
							<SwitchRow
								label="Enable purchase order management"
								checked={toggles.inventory_enablePurchaseOrders}
								onCheckedChange={(checked) =>
									updateToggle(
										"inventory_enablePurchaseOrders",
										checked,
									)
								}
							/>
							<InputRow
								label="PO email"
								helpText="Destination email for PO dispatch and vendor communication."
								value={vendorsEmail}
								onChange={setVendorsEmail}
								placeholder="name@example.com"
								type="email"
							/>
							<SwitchRow
								label="Enable check-in criteria"
								checked={toggles.checkin_enableBinCriteria}
								onCheckedChange={(checked) =>
									updateToggle(
										"checkin_enableBinCriteria",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Enable bulk counting"
								helpText="Supports one-step check-in quantity operations."
								checked={toggles.po_oneStepCheckIn}
								onCheckedChange={(checked) =>
									updateToggle("po_oneStepCheckIn", checked)
								}
							/>
							<SwitchRow
								label="Edit closed POs"
								helpText="Allows reopening or editing completed purchase orders."
								checked={toggles.po_editClosed}
								onCheckedChange={(checked) =>
									updateToggle("po_editClosed", checked)
								}
							/>
						</SectionCard>
					</TabsContent>

					<TabsContent value="transfers" className="space-y-4">
						<SectionCard id="transfers" title="Transfers">
							<SwitchRow
								label="Enable transfers between warehouses"
								checked={toggles.transfers_enabled}
								onCheckedChange={(checked) =>
									updateToggle("transfers_enabled", checked)
								}
							/>
							<SwitchRow
								label="Edit closed transfers"
								helpText="Allows post-close adjustments to transfer records."
								checked={toggles.transfers_editClosed}
								onCheckedChange={(checked) =>
									updateToggle(
										"transfers_editClosed",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Enable bulk counting"
								helpText="Enables one-step receiving counts for transfers."
								checked={toggles.transfers_oneStepCheckIn}
								onCheckedChange={(checked) =>
									updateToggle(
										"transfers_oneStepCheckIn",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Allow overcounting on transfers"
								helpText="Allows receiving quantities above expected transfer quantities."
								checked={toggles.transfers_enableOverCounting}
								onCheckedChange={(checked) =>
									updateToggle(
										"transfers_enableOverCounting",
										checked,
									)
								}
							/>
						</SectionCard>
					</TabsContent>

					<TabsContent value="cycle_counts" className="space-y-4">
						<SectionCard id="cycle_counts" title="Cycle Counts">
							<SwitchRow
								label="Enable cycle counting"
								checked={toggles.cycleCounts_enabled}
								onCheckedChange={(checked) =>
									updateToggle("cycleCounts_enabled", checked)
								}
							/>
							<SwitchRow
								label="Require bin scan"
								checked={toggles.cycleCounts_scanBin}
								onCheckedChange={(checked) =>
									updateToggle("cycleCounts_scanBin", checked)
								}
							/>
							<SwitchRow
								label="Require item scan"
								checked={toggles.cycleCounts_scanItem}
								onCheckedChange={(checked) =>
									updateToggle(
										"cycleCounts_scanItem",
										checked,
									)
								}
							/>
							<SwitchRow
								label="Show expected quantity in bin"
								checked={toggles.cycleCounts_showQty}
								onCheckedChange={(checked) =>
									updateToggle("cycleCounts_showQty", checked)
								}
							/>
						</SectionCard>
					</TabsContent>

					<TabsContent value="etc" className="space-y-4">
						<SectionCard id="etc" title="Data Retention">
							<InputRow
								label="Customer retention period (days)"
								helpText="Specifies the retention window used by cleanup and archival jobs."
								value={customersRetentionPeriod}
								onChange={setCustomersRetentionPeriod}
								placeholder="#"
								type="number"
								min={1}
								max={32767}
							/>
						</SectionCard>
					</TabsContent>
				</Tabs>
			</div>
		</TooltipProvider>
	);
}
