"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	DownloadIcon,
	EllipsisIcon,
	FileSpreadsheetIcon,
	InfoIcon,
	PlusIcon,
	SearchIcon,
	Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";

type VendorAddress = {
	address1: string;
	address2: string;
	city: string;
	country: string;
	state: string;
	zip: string;
};

type VendorProfile = {
	name: string;
	prefix: string;
	email: string;
	phone: string;
	communicationPreference: string;
	representativeName: string;
	accountNumber: string;
	notes: string;
	brands: string;
	shipping: VendorAddress;
};

type VendorItemRow = {
	id: string;
	item: string;
	sku: string;
	vendorSku: string;
	step: string;
	price: string;
	cost: string;
	margin: string;
	qty: number;
};

type PurchaseOrderRow = {
	id: string;
	status: string;
	warehouse: string;
	tags: string;
	createdAt: string;
	financialStatus: string;
	deliveryDate: string;
	progress: string;
};

const COMMUNICATION_OPTIONS = [
	{ value: "none", label: "None" },
	{ value: "email", label: "Email" },
	{ value: "phone", label: "Phone" },
	{ value: "both", label: "Email and Phone" },
];

const COUNTRY_OPTIONS = [
	{ value: "us", label: "United States" },
	{ value: "ca", label: "Canada" },
	{ value: "mx", label: "Mexico" },
];

const STATE_OPTIONS = [
	{ value: "al", label: "Alabama" },
	{ value: "ca", label: "California" },
	{ value: "ny", label: "New York" },
	{ value: "tx", label: "Texas" },
];

const ITEM_OPTIONS = [
	{ value: "item-001", label: "Select an Item" },
	{ value: "item-002", label: "Organic Flour" },
	{ value: "item-003", label: "Brown Rice" },
	{ value: "item-004", label: "Coffee Beans" },
];

const PAYMENT_STATUS_OPTIONS = [
	{ value: "all", label: "Payment Status" },
	{ value: "paid", label: "Paid" },
	{ value: "pending", label: "Pending" },
	{ value: "overdue", label: "Overdue" },
];

const WAREHOUSE_OPTIONS = [
	{ value: "all", label: "All Warehouses" },
	{ value: "east", label: "East Warehouse" },
	{ value: "west", label: "West Warehouse" },
];

const INITIAL_VENDOR: VendorProfile = {
	name: "AFDEWFA",
	prefix: "AFD",
	email: "sahil@gmail.com",
	phone: "1234567890",
	communicationPreference: "none",
	representativeName: "",
	accountNumber: "",
	notes: "",
	brands: "",
	shipping: {
		address1: "AWEFAWEF",
		address2: "AWEFAW",
		city: "FAWEFAWEF",
		country: "us",
		state: "al",
		zip: "10000",
	},
};

const PLACEHOLDER_ITEMS: VendorItemRow[] = [];
const PLACEHOLDER_PURCHASE_ORDERS: PurchaseOrderRow[] = [];

export default function VendorDetailPage() {
	const [vendor, setVendor] = useState(INITIAL_VENDOR);
	const [selectedItem, setSelectedItem] = useState("item-001");
	const [vendorSku, setVendorSku] = useState("");
	const [unitCost, setUnitCost] = useState("9.999");
	const [step, setStep] = useState("1");
	const [itemNote, setItemNote] = useState("");
	const [itemSearch, setItemSearch] = useState("");
	const [purchaseOrderSearch, setPurchaseOrderSearch] = useState("");

	const filteredItems = useMemo(() => {
		if (!itemSearch.trim()) {
			return PLACEHOLDER_ITEMS;
		}

		const query = itemSearch.toLowerCase();
		return PLACEHOLDER_ITEMS.filter((row) => {
			return (
				row.item.toLowerCase().includes(query) ||
				row.sku.toLowerCase().includes(query) ||
				row.vendorSku.toLowerCase().includes(query)
			);
		});
	}, [itemSearch]);

	const filteredPurchaseOrders = useMemo(() => {
		if (!purchaseOrderSearch.trim()) {
			return PLACEHOLDER_PURCHASE_ORDERS;
		}

		const query = purchaseOrderSearch.toLowerCase();
		return PLACEHOLDER_PURCHASE_ORDERS.filter((row) => {
			return (
				row.id.toLowerCase().includes(query) ||
				row.status.toLowerCase().includes(query) ||
				row.warehouse.toLowerCase().includes(query)
			);
		});
	}, [purchaseOrderSearch]);

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex w-full justify-between items-center">
				<div className="mb-8">
					<h1 className="font-semibold text-2xl tracking-tight">
						Settings
					</h1>
					<p className="mt-2 text-muted-foreground">
						Manage account preferences, notifications, tokens, and
						webhooks.
					</p>
				</div>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Delete vendor"
						>
							<Trash2Icon className="size-4" />
						</Button>
						<Button>Update</Button>
					</div>
				</div>
			</div>
			<Tabs defaultValue="items" className="flex flex-col">
				<TabsList
					variant="line"
					className="justify-start gap-2 overflow-x-auto p-0"
				>
					<TabsTrigger value="items" className="px-3">
						Items
					</TabsTrigger>
					<TabsTrigger value="purchase-orders" className="px-3">
						Purchase Orders
					</TabsTrigger>
					<TabsTrigger value="settings" className="px-3">
						Settings
					</TabsTrigger>
				</TabsList>

				<TabsContent value="settings" className="space-y-4">
					<Card className="rounded-2xl border">
						<CardContent className="space-y-5 p-4 md:p-6">
							<div className="grid gap-4 md:grid-cols-[1fr_120px]">
								<div className="space-y-1.5">
									<Label htmlFor="vendor-name">
										Vendor name *
									</Label>
									<Input
										id="vendor-name"
										value={vendor.name}
										onChange={(event) =>
											setVendor((current) => ({
												...current,
												name: event.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label
										htmlFor="vendor-prefix"
										className="flex items-center gap-1"
									>
										Prefix*
										<InfoIcon className="size-3.5 text-muted-foreground" />
									</Label>
									<Input
										id="vendor-prefix"
										maxLength={3}
										value={vendor.prefix}
										onChange={(event) =>
											setVendor((current) => ({
												...current,
												prefix: event.target.value,
											}))
										}
									/>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-1.5">
									<Label htmlFor="vendor-email">
										Email *
									</Label>
									<Input
										id="vendor-email"
										type="email"
										placeholder="Add Email"
										value={vendor.email}
										onChange={(event) =>
											setVendor((current) => ({
												...current,
												email: event.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="vendor-phone">Phone</Label>
									<Input
										id="vendor-phone"
										type="tel"
										value={vendor.phone}
										onChange={(event) =>
											setVendor((current) => ({
												...current,
												phone: event.target.value,
											}))
										}
									/>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								<div className="space-y-1.5">
									<Label
										htmlFor="vendor-communication"
										className="flex items-center gap-1"
									>
										Communication Preference
										<InfoIcon className="size-3.5 text-muted-foreground" />
									</Label>
									<Select
										value={vendor.communicationPreference}
										onValueChange={(value) => {
											if (!value) {
												return;
											}
											setVendor((current) => ({
												...current,
												communicationPreference: value,
											}));
										}}
									>
										<SelectTrigger
											id="vendor-communication"
											className="w-full"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{COMMUNICATION_OPTIONS.map(
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
								<div className="space-y-1.5">
									<Label htmlFor="vendor-representative">
										Representative Name
									</Label>
									<Input
										id="vendor-representative"
										value={vendor.representativeName}
										onChange={(event) =>
											setVendor((current) => ({
												...current,
												representativeName:
													event.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="vendor-account">
										Account #
									</Label>
									<Input
										id="vendor-account"
										value={vendor.accountNumber}
										onChange={(event) =>
											setVendor((current) => ({
												...current,
												accountNumber:
													event.target.value,
											}))
										}
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="vendor-notes">Notes</Label>
								<textarea
									id="vendor-notes"
									className="flex min-h-[108px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
									value={vendor.notes}
									onChange={(event) =>
										setVendor((current) => ({
											...current,
											notes: event.target.value,
										}))
									}
								/>
							</div>

							<div className="space-y-1.5">
								<Label
									htmlFor="vendor-brands"
									className="flex items-center gap-1"
								>
									Brands
									<InfoIcon className="size-3.5 text-muted-foreground" />
								</Label>
								<Input
									id="vendor-brands"
									placeholder="Add Brand"
									value={vendor.brands}
									onChange={(event) =>
										setVendor((current) => ({
											...current,
											brands: event.target.value,
										}))
									}
								/>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-2xl border">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Shipping Location
							</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-4 pt-0 md:grid-cols-3">
							<div className="space-y-1.5">
								<Label htmlFor="shipping-address-1">
									Address *
								</Label>
								<Input
									id="shipping-address-1"
									value={vendor.shipping.address1}
									onChange={(event) =>
										setVendor((current) => ({
											...current,
											shipping: {
												...current.shipping,
												address1: event.target.value,
											},
										}))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="shipping-address-2">
									Address Line 2
								</Label>
								<Input
									id="shipping-address-2"
									value={vendor.shipping.address2}
									onChange={(event) =>
										setVendor((current) => ({
											...current,
											shipping: {
												...current.shipping,
												address2: event.target.value,
											},
										}))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="shipping-city">City *</Label>
								<Input
									id="shipping-city"
									value={vendor.shipping.city}
									onChange={(event) =>
										setVendor((current) => ({
											...current,
											shipping: {
												...current.shipping,
												city: event.target.value,
											},
										}))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="shipping-country">
									Country *
								</Label>
								<Select
									value={vendor.shipping.country}
									onValueChange={(value) => {
										if (!value) {
											return;
										}
										setVendor((current) => ({
											...current,
											shipping: {
												...current.shipping,
												country: value,
											},
										}));
									}}
								>
									<SelectTrigger
										id="shipping-country"
										className="w-full"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{COUNTRY_OPTIONS.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="shipping-state">State *</Label>
								<Select
									value={vendor.shipping.state}
									onValueChange={(value) => {
										if (!value) {
											return;
										}
										setVendor((current) => ({
											...current,
											shipping: {
												...current.shipping,
												state: value,
											},
										}));
									}}
								>
									<SelectTrigger
										id="shipping-state"
										className="w-full"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{STATE_OPTIONS.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="shipping-zip">Zip *</Label>
								<Input
									id="shipping-zip"
									value={vendor.shipping.zip}
									onChange={(event) =>
										setVendor((current) => ({
											...current,
											shipping: {
												...current.shipping,
												zip: event.target.value,
											},
										}))
									}
								/>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="items" className="space-y-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="text-3xl font-semibold tracking-tight">
							Items
						</h2>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								aria-label="Download item template"
							>
								<DownloadIcon className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								aria-label="Export item CSV"
							>
								<FileSpreadsheetIcon className="size-4" />
							</Button>
							<Button>Create Order</Button>
						</div>
					</div>

					<Card className="rounded-2xl border">
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Add Item
							</CardTitle>
							<Button size="sm">
								<PlusIcon className="size-4" />
								Add Item
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="item-select">Item *</Label>
								<Select
									value={selectedItem}
									onValueChange={(value) =>
										setSelectedItem(value ?? "item-001")
									}
								>
									<SelectTrigger
										id="item-select"
										className="w-full"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ITEM_OPTIONS.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								<div className="space-y-1.5">
									<Label htmlFor="vendor-sku">
										Vendor SKU
									</Label>
									<Input
										id="vendor-sku"
										value={vendorSku}
										onChange={(event) =>
											setVendorSku(event.target.value)
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="unit-cost">
										Unit Cost *
									</Label>
									<div className="relative">
										<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
											$
										</span>
										<Input
											id="unit-cost"
											className="pl-7"
											value={unitCost}
											onChange={(event) =>
												setUnitCost(event.target.value)
											}
										/>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label
										htmlFor="item-step"
										className="flex items-center gap-1"
									>
										Step
										<InfoIcon className="size-3.5 text-muted-foreground" />
									</Label>
									<Input
										id="item-step"
										value={step}
										onChange={(event) =>
											setStep(event.target.value)
										}
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="item-note">Item Note</Label>
								<textarea
									id="item-note"
									className="flex min-h-[94px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
									placeholder="Notes about the item that this vendor carriers"
									value={itemNote}
									onChange={(event) =>
										setItemNote(event.target.value)
									}
								/>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-2xl border">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Margin History
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-40 rounded-md border border-dashed bg-muted/20" />
						</CardContent>
					</Card>

					<Card className="rounded-2xl border">
						<CardContent className="p-0">
							<div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
								<div className="relative w-full lg:max-w-md">
									<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										className="pl-9"
										placeholder="Search"
										value={itemSearch}
										onChange={(event) =>
											setItemSearch(event.target.value)
										}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Select defaultValue="all">
										<SelectTrigger className="w-[170px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{WAREHOUSE_OPTIONS.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}
												>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
										<Button
											variant="ghost"
											size="sm"
											className="h-7 px-2"
										>
											&lt;
										</Button>
										<span className="text-sm font-medium">
											1
										</span>
										<Button
											variant="ghost"
											size="sm"
											className="h-7 px-2"
										>
											&gt;
										</Button>
									</div>
									<Button
										variant="outline"
										size="icon"
										aria-label="More item options"
									>
										<EllipsisIcon className="size-4" />
									</Button>
								</div>
							</div>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Item</TableHead>
										<TableHead>SKU</TableHead>
										<TableHead>Vendor SKU</TableHead>
										<TableHead>Step</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Cost</TableHead>
										<TableHead>Margin</TableHead>
										<TableHead className="text-right">
											Qty
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredItems.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">
												{row.item}
											</TableCell>
											<TableCell>{row.sku}</TableCell>
											<TableCell>
												{row.vendorSku}
											</TableCell>
											<TableCell>{row.step}</TableCell>
											<TableCell>{row.price}</TableCell>
											<TableCell>{row.cost}</TableCell>
											<TableCell>{row.margin}</TableCell>
											<TableCell className="text-right">
												{row.qty}
											</TableCell>
										</TableRow>
									))}
									{filteredItems.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={8}
												className="h-16 text-muted-foreground"
											>
												No items available for this
												vendor.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="purchase-orders" className="space-y-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<h2 className="text-3xl font-semibold tracking-tight">
							Purchase Orders
						</h2>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								aria-label="Export purchase order CSV"
							>
								<FileSpreadsheetIcon className="size-4" />
							</Button>
							<Button>Create Order</Button>
						</div>
					</div>

					<Card className="rounded-2xl border">
						<CardContent className="space-y-4 p-4 md:p-6">
							<p className="text-sm font-medium text-muted-foreground">
								No Filters
							</p>
							<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
								<div className="relative w-full xl:max-w-sm">
									<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Search"
										className="pl-9"
										value={purchaseOrderSearch}
										onChange={(event) =>
											setPurchaseOrderSearch(
												event.target.value,
											)
										}
									/>
								</div>
								<div className="flex flex-1 flex-wrap items-center gap-2">
									<Button variant="outline" size="sm">
										Create Date
									</Button>
									<Button variant="outline" size="sm">
										Order Tags
									</Button>
									<Select defaultValue="status-all">
										<SelectTrigger className="w-[150px]">
											<SelectValue placeholder="Order Status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="status-all">
												Order Status
											</SelectItem>
											<SelectItem value="status-open">
												Open
											</SelectItem>
											<SelectItem value="status-closed">
												Closed
											</SelectItem>
										</SelectContent>
									</Select>
									<Select defaultValue="all">
										<SelectTrigger className="w-[170px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{PAYMENT_STATUS_OPTIONS.map(
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
									<Select defaultValue="all">
										<SelectTrigger className="w-[170px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{WAREHOUSE_OPTIONS.map((option) => (
												<SelectItem
													key={option.value}
													value={option.value}
												>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
										<Button
											variant="ghost"
											size="sm"
											className="h-7 px-2"
										>
											&lt;
										</Button>
										<span className="text-sm font-medium">
											1
										</span>
										<Button
											variant="ghost"
											size="sm"
											className="h-7 px-2"
										>
											&gt;
										</Button>
									</div>
									<Button
										variant="outline"
										size="icon"
										aria-label="More order options"
									>
										<EllipsisIcon className="size-4" />
									</Button>
								</div>
							</div>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Status</TableHead>
										<TableHead>Warehouse</TableHead>
										<TableHead>Tags</TableHead>
										<TableHead>ID</TableHead>
										<TableHead>Created At</TableHead>
										<TableHead>Financial Status</TableHead>
										<TableHead>Delivery Date</TableHead>
										<TableHead>Progress</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredPurchaseOrders.map((row) => (
										<TableRow key={row.id}>
											<TableCell>{row.status}</TableCell>
											<TableCell>
												{row.warehouse}
											</TableCell>
											<TableCell>{row.tags}</TableCell>
											<TableCell>{row.id}</TableCell>
											<TableCell>
												{row.createdAt}
											</TableCell>
											<TableCell>
												{row.financialStatus}
											</TableCell>
											<TableCell>
												{row.deliveryDate}
											</TableCell>
											<TableCell>
												{row.progress}
											</TableCell>
										</TableRow>
									))}
									{filteredPurchaseOrders.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={8}
												className="h-14 text-muted-foreground"
											>
												No purchase orders found for
												this vendor.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
