"use client";

import { Badge } from "@repo/ui/badge";
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
import { TabsContent } from "@repo/ui/tabs";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import {
	CheckIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	FileSpreadsheetIcon,
	InfoIcon,
	Loader2Icon,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

export type VendorAddress = {
	address1: string;
	address2: string;
	city: string;
	country: string;
	state: string;
	zip: string;
};

export type VendorProfile = {
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

const COMMUNICATION_OPTIONS = [
	{ value: "none", label: "None" },
	{ value: "email", label: "Email" },
	{ value: "phone", label: "Phone" },
	{ value: "both", label: "Email and Phone" },
];

export function SettingsTabContent({
	vendor,
	setVendor,
}: {
	vendor: VendorProfile;
	setVendor: Dispatch<SetStateAction<VendorProfile>>;
}) {
	return (
		<TabsContent value="settings" className="space-y-4">
			<Card className="rounded-2xl border">
				<CardContent className="space-y-5 p-4 md:p-6">
					<div className="grid gap-4 md:grid-cols-[1fr_120px]">
						<div className="space-y-1.5">
							<Label htmlFor="vendor-name">Vendor name *</Label>
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
							<Label htmlFor="vendor-email">Email *</Label>
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
									<SelectValue placeholder="Select preference">
										{COMMUNICATION_OPTIONS.find(
											(o) =>
												o.value ===
												vendor.communicationPreference,
										)?.label ?? "Select preference"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{COMMUNICATION_OPTIONS.map((option) => (
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
							<Label htmlFor="vendor-representative">
								Representative Name
							</Label>
							<Input
								id="vendor-representative"
								value={vendor.representativeName}
								onChange={(event) =>
									setVendor((current) => ({
										...current,
										representativeName: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="vendor-account">Account #</Label>
							<Input
								id="vendor-account"
								value={vendor.accountNumber}
								onChange={(event) =>
									setVendor((current) => ({
										...current,
										accountNumber: event.target.value,
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
						<Label htmlFor="shipping-address-1">Address *</Label>
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
						<Label htmlFor="shipping-country">Country</Label>
						<Input
							id="shipping-country"
							placeholder="e.g. United States"
							value={vendor.shipping.country}
							onChange={(event) =>
								setVendor((current) => ({
									...current,
									shipping: {
										...current.shipping,
										country: event.target.value,
									},
								}))
							}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="shipping-state">State</Label>
						<Input
							id="shipping-state"
							placeholder="e.g. California"
							value={vendor.shipping.state}
							onChange={(event) =>
								setVendor((current) => ({
									...current,
									shipping: {
										...current.shipping,
										state: event.target.value,
									},
								}))
							}
						/>
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
	);
}

export function ItemsTabContent({
	organizationId: _organizationId,
	supplierId: _supplierId,
}: {
	organizationId: string | null;
	supplierId: string;
}) {
	// Supplier SKU catalog is not exposed via API yet.
	const isPending = false;
	const skuSuppliers: Array<{
		id: string;
		vendorCode: string | null;
		unitPrice: number | null;
		moq: number | null;
		leadTimeDays: number | null;
		isPrimary: boolean;
		sku: { skuCode: string; name: string };
	}> = [];

	return (
		<TabsContent value="items" className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">Items</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export item CSV"
					>
						<FileSpreadsheetIcon className="size-4" />
					</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					{isPending ? (
						<div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
							<Loader2Icon className="size-4 animate-spin" />
							Loading items...
						</div>
					) : skuSuppliers.length === 0 ? (
						<div className="rounded-md px-4 py-12 text-center text-sm text-muted-foreground">
							No items linked to this vendor yet.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>SKU Code</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Vendor Code</TableHead>
									<TableHead className="text-right">
										Unit Price
									</TableHead>
									<TableHead className="text-right">
										MOQ
									</TableHead>
									<TableHead className="text-right">
										Lead Time
									</TableHead>
									<TableHead className="text-center">
										Primary
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{skuSuppliers.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-mono text-sm">
											{row.sku.skuCode}
										</TableCell>
										<TableCell>{row.sku.name}</TableCell>
										<TableCell className="text-muted-foreground">
											{row.vendorCode ?? "—"}
										</TableCell>
										<TableCell className="text-right">
											{row.unitPrice != null
												? `$${Number(row.unitPrice).toFixed(2)}`
												: "—"}
										</TableCell>
										<TableCell className="text-right">
											{row.moq != null
												? String(row.moq)
												: "—"}
										</TableCell>
										<TableCell className="text-right">
											{row.leadTimeDays != null
												? `${row.leadTimeDays}d`
												: "—"}
										</TableCell>
										<TableCell className="text-center">
											{row.isPrimary ? (
												<CheckIcon className="mx-auto size-4 text-green-600" />
											) : (
												<span className="text-muted-foreground">
													—
												</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

		</TabsContent>
	);
}

function formatPoStatus(status: string) {
	return status
		.split("_")
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(" ");
}

export function PurchaseOrdersTabContent({
	organizationId,
	supplierId,
}: {
	organizationId: string | null;
	supplierId: string;
}) {
	const ITEMS_PER_PAGE = 20;
	const [page, setPage] = useState(1);

	const { data, isPending } = useQuery({
		...orpc.masterData.suppliers.listPurchaseOrders.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				supplierId,
				limit: ITEMS_PER_PAGE,
				offset: (page - 1) * ITEMS_PER_PAGE,
			},
		}),
		enabled: Boolean(organizationId && supplierId),
	});

	const orders = data?.orders ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

	return (
		<TabsContent value="purchase-orders" className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Purchase Orders
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export purchase orders CSV"
					>
						<FileSpreadsheetIcon className="size-4" />
					</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					{isPending ? (
						<div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
							<Loader2Icon className="size-4 animate-spin" />
							Loading purchase orders...
						</div>
					) : orders.length === 0 ? (
						<div className="rounded-md px-4 py-12 text-center text-sm text-muted-foreground">
							No purchase orders found for this vendor.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>PO Number</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Warehouse</TableHead>
									<TableHead className="text-right">
										Lines
									</TableHead>
									<TableHead>Expected Date</TableHead>
									<TableHead>Created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell className="font-mono text-sm font-medium">
											{order.poNumber}
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{formatPoStatus(order.status)}
											</Badge>
										</TableCell>
										<TableCell>
											{order.warehouse.name}
										</TableCell>
										<TableCell className="text-right">
											{order._count.items}
										</TableCell>
										<TableCell>
											{order.expectedAt
												? new Date(
														order.expectedAt,
													).toLocaleDateString()
												: "—"}
										</TableCell>
										<TableCell>
											{new Date(
												order.createdAt,
											).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{totalPages > 1 && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						Page {page} of {totalPages} ({total} orders)
					</span>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							disabled={page <= 1}
							onClick={() => setPage((p) => p - 1)}
						>
							<ChevronLeftIcon className="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							disabled={page >= totalPages}
							onClick={() => setPage((p) => p + 1)}
						>
							<ChevronRightIcon className="size-4" />
						</Button>
					</div>
				</div>
			)}
		</TabsContent>
	);
}
