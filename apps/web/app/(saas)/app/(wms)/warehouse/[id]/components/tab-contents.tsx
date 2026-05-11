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
import { Switch } from "@repo/ui/switch";
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
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisIcon,
	InfoIcon,
	SearchIcon,
	ShareIcon,
	Trash2Icon,
	UploadIcon,
} from "lucide-react";

const FILTER_BUTTON_CLASS =
	"h-8 rounded-md border border-input bg-muted/40 px-3 text-xs font-semibold text-foreground/80";

function Pager() {
	return (
		<div className="ml-auto flex items-center gap-1">
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				aria-label="Prev page"
			>
				<ChevronLeftIcon className="size-4" />
			</Button>
			<span className="px-1 text-xs font-medium">1</span>
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				aria-label="Next page"
			>
				<ChevronRightIcon className="size-4" />
			</Button>
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				aria-label="More actions"
			>
				<EllipsisIcon className="size-4" />
			</Button>
		</div>
	);
}

function SettingsTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Warehouse
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Delete warehouse"
					>
						<Trash2Icon className="size-4" />
					</Button>
					<Button size="sm">Save</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="space-y-4 p-4">
					<div className="grid gap-4 md:grid-cols-[1fr_110px]">
						<div className="space-y-1.5">
							<Label htmlFor="warehouse-name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="warehouse-name"
								defaultValue="Bengaluru"
							/>
						</div>
						<div className="space-y-1.5">
							<div className="flex items-center gap-1">
								<Label htmlFor="warehouse-prefix">
									Prefix{" "}
									<span className="text-destructive">*</span>
								</Label>
								<InfoIcon className="size-3.5 text-muted-foreground" />
							</div>
							<Input id="warehouse-prefix" defaultValue="BEN" />
						</div>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="warehouse-phone">
							Phone <span className="text-destructive">*</span>
						</Label>
						<Input
							id="warehouse-phone"
							defaultValue="+91 9958684675"
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="border-b px-4 py-3">
					<CardTitle className="text-xs font-semibold uppercase tracking-wide">
						Address
					</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 p-4 md:grid-cols-3">
					<div className="space-y-1.5">
						<Label htmlFor="warehouse-address-1">
							Address <span className="text-destructive">*</span>
						</Label>
						<Input id="warehouse-address-1" defaultValue="loko" />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="warehouse-address-2">
							Address Line 2
						</Label>
						<Input id="warehouse-address-2" defaultValue="bob" />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="warehouse-city">
							City <span className="text-destructive">*</span>
						</Label>
						<Input id="warehouse-city" defaultValue="Bengaluru" />
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="warehouse-country">
							Country <span className="text-destructive">*</span>
						</Label>
						<Select defaultValue="india">
							<SelectTrigger
								id="warehouse-country"
								className="w-full"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="india">India</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="warehouse-state">
							State <span className="text-destructive">*</span>
						</Label>
						<Select defaultValue="karnataka">
							<SelectTrigger
								id="warehouse-state"
								className="w-full"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="karnataka">
									Karnataka
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="warehouse-zip">
							Zip <span className="text-destructive">*</span>
						</Label>
						<Input id="warehouse-zip" defaultValue="560057" />
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardContent className="flex items-center justify-between px-4 py-3">
					<div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
						Different Return Address
						<InfoIcon className="size-3.5 text-muted-foreground" />
					</div>
					<Switch defaultChecked={false} />
				</CardContent>
			</Card>
		</div>
	);
}

function InventoryTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Inventory
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Share inventory"
					>
						<ShareIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Export inventory"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Adjust</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="border-b px-4 py-2 text-xs font-semibold">
						No Filters
					</div>
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-sm">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Search" className="h-8 pl-9" />
						</div>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Product Type
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Product Tags
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							$
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							{"> Price"}
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							$
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							{"< Price"}
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Any ABC Class
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>Serial</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Lot</TableHead>
								<TableHead>Bin</TableHead>
								<TableHead>Shelf</TableHead>
								<TableHead>Unit Cost</TableHead>
								<TableHead>ABC</TableHead>
								<TableHead className="text-right">
									Qty
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="font-medium underline underline-offset-2">
									Chappal
								</TableCell>
								<TableCell>-</TableCell>
								<TableCell>KKIE</TableCell>
								<TableCell>-</TableCell>
								<TableCell className="underline underline-offset-2">
									bin 1
								</TableCell>
								<TableCell className="underline underline-offset-2">
									First Shelf
								</TableCell>
								<TableCell>$0.05</TableCell>
								<TableCell>-</TableCell>
								<TableCell className="text-right">
									101
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function ReplenishInventoryTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Replenish Inventory
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export replenishments"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Create</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-2xl">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Filter" className="h-8 pl-9" />
						</div>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							All
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>Vendor(s)</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Sales/Day</TableHead>
								<TableHead>Inventory</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody />
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function BinReplenishmentTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Bin Replenishment
				</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export bin replenishments"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Create</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-xs">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Filter" className="h-8 pl-9" />
						</div>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Has Origin
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							All
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							From Shelf
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							From Bin
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							To Shelf
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>From Bin</TableHead>
								<TableHead>Qty</TableHead>
								<TableHead>To Bin</TableHead>
								<TableHead>Current</TableHead>
								<TableHead className="text-right">
									Range
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody />
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function LogsTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-semibold tracking-tight">
					Inventory Logs
				</h2>
				<Button variant="outline" size="icon" aria-label="Export logs">
					<UploadIcon className="size-4" />
				</Button>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Change Type
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							All Employees
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Date
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Any reason
						</Button>
						<Button
							variant="outline"
							className={FILTER_BUTTON_CLASS}
						>
							Has note
						</Button>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Time</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Description</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell>1:40 AM</TableCell>
								<TableCell>Inventory Changed</TableCell>
								<TableCell>
									<span className="font-medium underline underline-offset-2">
										Chappal
									</span>{" "}
									- KKIE added to{" "}
									<span className="font-medium">
										bin 1 / First Shelf / Lvl:1
									</span>
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>1:39 AM</TableCell>
								<TableCell>Inventory Changed</TableCell>
								<TableCell>
									<span className="font-medium underline underline-offset-2">
										Chappal
									</span>{" "}
									- KKIE added to{" "}
									<span className="font-medium">
										bin 1 / First Shelf / Lvl:1
									</span>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function BundlesTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1">
					<h2 className="text-3xl font-semibold tracking-tight">
						Kits
					</h2>
					<InfoIcon className="size-4 text-muted-foreground" />
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Export kits"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button size="sm">Create Kit</Button>
				</div>
			</div>

			<Card className="border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-4xl">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input placeholder="Search" className="h-8 pl-9" />
						</div>
						<Pager />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Output</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody />
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function CycleCountTab() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-1">
				<h2 className="text-3xl font-semibold tracking-tight">
					Cycle Counts
				</h2>
				<InfoIcon className="size-4 text-muted-foreground" />
			</div>
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b py-3">
					<CardTitle className="text-xs font-semibold uppercase tracking-wide">
						Cycle Counts
					</CardTitle>
					<Button size="sm">Create Cycle Count</Button>
				</CardHeader>
				<CardContent className="px-5 py-6 text-sm text-muted-foreground">
					No cycle counts
				</CardContent>
			</Card>
		</div>
	);
}

function LayoutTab() {
	return (
		<Card className="border">
			<CardHeader className="border-b">
				<CardTitle className="text-base">Warehouse Layout</CardTitle>
			</CardHeader>
			<CardContent className="py-10">
				<div className="mx-auto max-w-3xl rounded-lg border border-dashed p-10 text-center">
					<p className="text-sm text-muted-foreground">
						Layout canvas placeholder. Add zone and bin map widgets
						here.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

function OrdersTab() {
	return (
		<Tabs defaultValue="fulfill" className="space-y-4">
			<TabsList
				variant="line"
				className="h-auto justify-start gap-2 rounded-none px-0 pb-0"
			>
				<TabsTrigger
					value="fulfill"
					className="px-3 py-2 text-sm font-medium"
				>
					Fulfill
				</TabsTrigger>
				<TabsTrigger
					value="manifests"
					className="px-3 py-2 text-sm font-medium"
				>
					Manifests
				</TabsTrigger>
				<TabsTrigger
					value="purchase-orders"
					className="px-3 py-2 text-sm font-medium"
				>
					Purchase Orders
				</TabsTrigger>
				<TabsTrigger
					value="outbound-orders"
					className="px-3 py-2 text-sm font-medium"
				>
					Outbound Orders
				</TabsTrigger>
			</TabsList>

			<TabsContent value="fulfill" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Fulfill
					</h2>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							Packed Shipments
						</Button>
						<Button variant="outline" size="sm">
							View Manifests
						</Button>
					</div>
				</div>
				<Card className="border">
					<CardHeader className="border-b px-4 py-3">
						<CardTitle className="text-xs font-semibold uppercase tracking-wide">
							Batches
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Batch Status
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Create Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Delivery Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Any Priority
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Assigned to Anyone
							</Button>
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Assignee</TableHead>
									<TableHead>Tote</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Deliver At</TableHead>
									<TableHead>Progress</TableHead>
									<TableHead>Fulfilled</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="manifests" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Manifests
					</h2>
					<Button size="sm">Create Manifests</Button>
				</div>
				<Card className="border">
					<CardContent className="p-0">
						<div className="flex items-center border-b px-4 py-3">
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Created At</TableHead>
									<TableHead>Carrier</TableHead>
									<TableHead># Shipments</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="purchase-orders" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Purchase Orders
					</h2>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Import purchase orders"
						>
							<UploadIcon className="size-4" />
						</Button>
						<Button variant="outline" size="sm">
							Discrepancies
						</Button>
						<Button size="sm">Create</Button>
					</div>
				</div>
				<Card className="border">
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<div className="relative w-full max-w-sm">
								<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search"
									className="h-8 pl-9"
								/>
							</div>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Create Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Status
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Payment Status
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Any Vendor
							</Button>
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>Vendor</TableHead>
									<TableHead>Warehouse</TableHead>
									<TableHead>Tags</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Financial Status</TableHead>
									<TableHead>Delivery Date</TableHead>
									<TableHead className="text-right">
										Progress
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="outbound-orders" className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-semibold tracking-tight">
						Outbound Orders
					</h2>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="View options"
						>
							<EllipsisIcon className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							aria-label="Import outbound orders"
						>
							<UploadIcon className="size-4" />
						</Button>
						<Button variant="outline" size="sm">
							Fulfill
						</Button>
						<Button size="sm">Create</Button>
					</div>
				</div>
				<Card className="border">
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<div className="relative w-full max-w-2xl">
								<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search"
									className="h-8 pl-9"
								/>
							</div>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Create Date
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={FILTER_BUTTON_CLASS}
							>
								Order Status
							</Button>
							<Pager />
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>Test</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Deliver At</TableHead>
									<TableHead>Tags</TableHead>
									<TableHead>Source</TableHead>
									<TableHead className="text-right">
										Progress
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody />
						</Table>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}

export function LayoutTabContent() {
	return (
		<TabsContent value="layout" className="space-y-4">
			<LayoutTab />
		</TabsContent>
	);
}

export function SettingsTabContent() {
	return (
		<TabsContent value="settings" className="space-y-4">
			<SettingsTab />
		</TabsContent>
	);
}

export function InventoryTabContent() {
	return (
		<TabsContent value="inventory" className="space-y-4">
			<InventoryTab />
		</TabsContent>
	);
}

export function CycleCountTabContent() {
	return (
		<TabsContent value="cycle-count" className="space-y-4">
			<CycleCountTab />
		</TabsContent>
	);
}

export function LogsTabContent() {
	return (
		<TabsContent value="logs" className="space-y-4">
			<LogsTab />
		</TabsContent>
	);
}

export function ReplenishInventoryTabContent() {
	return (
		<TabsContent value="replenish-inventory" className="space-y-4">
			<ReplenishInventoryTab />
		</TabsContent>
	);
}

export function BinReplenishmentTabContent() {
	return (
		<TabsContent value="bin-replenishment" className="space-y-4">
			<BinReplenishmentTab />
		</TabsContent>
	);
}

export function BundlesTabContent() {
	return (
		<TabsContent value="bundles" className="space-y-4">
			<BundlesTab />
		</TabsContent>
	);
}

export function OrdersTabContent() {
	return (
		<TabsContent value="orders" className="space-y-4">
			<OrdersTab />
		</TabsContent>
	);
}
