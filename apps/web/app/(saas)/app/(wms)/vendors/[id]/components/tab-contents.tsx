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
import { TabsContent } from "@repo/ui/tabs";
import {
	DownloadIcon,
	FileSpreadsheetIcon,
	InfoIcon,
	Link2Icon,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

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
									<SelectValue />
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
						<Label htmlFor="shipping-country">Country *</Label>
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
	);
}

export function ItemsTabContent({ vendorName }: { vendorName: string }) {
	return (
		<TabsContent value="items" className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">Items</h2>
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
					<Button variant="outline">Request Item Feed</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardHeader className="flex flex-row items-center justify-between pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Coverage
					</CardTitle>
					<Button size="sm" variant="outline">
						<Link2Icon className="size-4" />
						Link Catalog Feed
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Item associations for {vendorName.toLowerCase()} are not
						available through the current supplier API yet. Use this
						tab to review readiness and request catalog linkage.
					</p>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">
								Catalog linkage
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Awaiting supplier-to-SKU relation procedures.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">Price history</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Margin and cost trend data will appear once item
								feeds are available.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">
								Bulk onboarding
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Use the template actions to prepare a future
								import batch.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="rounded-2xl border">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Next Step
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						When the supplier item contract is exposed, this tab
						should support item linkage, unit-cost updates,
						import/export, and purchase coverage analytics.
					</p>
					<div className="rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
						No vendor items are available yet.
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function PurchaseOrdersTabContent({
	vendorName,
}: {
	vendorName: string;
}) {
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
						aria-label="Export purchase order CSV"
					>
						<FileSpreadsheetIcon className="size-4" />
					</Button>
					<Button variant="outline">Request PO Feed</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="space-y-4 p-4 md:p-6">
					<p className="text-sm text-muted-foreground">
						Purchase orders for {vendorName.toLowerCase()} are not
						yet queryable from the supplier API. This tab is ready
						for live data once purchase-order relations are exposed.
					</p>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">Order history</p>
							<p className="mt-1 text-sm text-muted-foreground">
								PO timelines and financial statuses will appear
								here.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">Filters</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Warehouse, payment, and progress filters are
								staged for the live feed.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="text-sm font-medium">Exports</p>
							<p className="mt-1 text-sm text-muted-foreground">
								CSV export is ready to connect once the query
								endpoint is available.
							</p>
						</div>
					</div>
					<div className="rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
						No purchase orders are available for this vendor yet.
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
