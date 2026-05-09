"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
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
	ArrowRightIcon,
	CalendarIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisIcon,
	PlayIcon,
	SearchIcon,
	TagIcon,
	UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TAG_FILTER_CLASS =
	"h-8 rounded-md border border-input bg-muted/40 px-3 text-xs font-semibold text-foreground/80";

function CompactPager({
	page,
	onPrev,
	onNext,
}: {
	page: number;
	onPrev: () => void;
	onNext: () => void;
}) {
	return (
		<div className="ml-auto flex items-center gap-1">
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				onClick={onPrev}
				aria-label="Previous page"
			>
				<ChevronLeftIcon className="size-4" />
			</Button>
			<span className="px-1 text-xs font-medium">{page}</span>
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				onClick={onNext}
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

function GuideActions({
	title,
	guideLabel,
	primaryActionLabel,
	primaryActionHref,
	secondaryActionLabel,
	secondaryActionHref,
	heroTitle,
}: {
	title: string;
	guideLabel: string;
	primaryActionLabel: string;
	primaryActionHref: string;
	secondaryActionLabel: string;
	secondaryActionHref: string;
	heroTitle: string;
}) {
	return (
		<div className="space-y-4 rounded-2xl bg-muted/30 p-6">
			<div className="space-y-1 text-center">
				<h3 className="text-4xl font-semibold tracking-tight">
					{title}
				</h3>
				<Link
					href={primaryActionHref}
					className="inline-flex items-center gap-2 text-xl font-semibold text-primary"
				>
					{guideLabel}
					<ArrowRightIcon className="size-5" />
				</Link>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card className="rounded-xl border">
					<CardContent className="flex items-center justify-between py-5">
						<p className="text-2xl font-semibold tracking-tight">
							{primaryActionLabel}
						</p>
						<Button variant="ghost" size="icon" asChild>
							<Link href={primaryActionHref}>
								<ArrowRightIcon className="size-5" />
							</Link>
						</Button>
					</CardContent>
				</Card>
				<Card className="rounded-xl border">
					<CardContent className="flex items-center justify-between py-5">
						<p className="text-2xl font-semibold tracking-tight">
							{secondaryActionLabel}
						</p>
						<Button variant="ghost" size="icon" asChild>
							<Link href={secondaryActionHref}>
								<ArrowRightIcon className="size-5" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			<div className="relative flex min-h-80 items-center justify-center bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-center text-white">
				<div className="space-y-3">
					<p className="text-5xl font-semibold tracking-tight md:text-6xl">
						{heroTitle}
					</p>
					<p className="text-base text-slate-200">
						Quick operation walkthrough for your warehouse team.
					</p>
				</div>
				<button
					type="button"
					className="absolute rounded-full bg-black/40 p-3 text-white backdrop-blur hover:bg-black/60"
					aria-label="Play guide video"
				>
					<PlayIcon className="size-8 fill-current" />
				</button>
			</div>
		</div>
	);
}

function InboundTab() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-3xl font-semibold tracking-tight">
					Purchase Orders
				</h2>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" aria-label="Import">
						<UploadIcon className="size-4" />
					</Button>
					<Button variant="outline" size="sm">
						Discrepancies
					</Button>
					<Button size="sm">Create</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					<div className="border-b px-4 py-2 text-xs font-semibold">
						No Filters
					</div>
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-md">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={search}
								onChange={(event) =>
									setSearch(event.target.value)
								}
								placeholder="Search"
								className="h-8 pl-9"
							/>
						</div>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<CalendarIcon className="mr-1.5 size-3.5" />
							Create Date
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<TagIcon className="mr-1.5 size-3.5" />
							Order Tags
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Order Status
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Any Vendor
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Any Warehouse
						</Button>
						<CompactPager
							page={page}
							onPrev={() =>
								setPage((current) => Math.max(1, current - 1))
							}
							onNext={() => setPage((current) => current + 1)}
						/>
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
								<TableHead>Progress</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={9}
									className="h-12 text-muted-foreground"
								>
									No purchase orders yet.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<GuideActions
				title="No purchase orders yet...Let's change that"
				guideLabel="View Purchase Orders Guide"
				primaryActionLabel="Create Purchase Order"
				primaryActionHref="/app/orders"
				secondaryActionLabel="Sync Shopify Vendors"
				secondaryActionHref="/app/vendors/import"
				heroTitle="Purchase Orders and Put Away"
			/>
		</div>
	);
}

function OutboundTab() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-3xl font-semibold tracking-tight">
					Outbound Orders
				</h2>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" aria-label="Import">
						<UploadIcon className="size-4" />
					</Button>
					<Button variant="outline" size="sm">
						Fulfill
					</Button>
					<Button size="sm">Create</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					<div className="border-b px-4 py-2 text-xs font-semibold">
						No Filters
					</div>
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-md">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={search}
								onChange={(event) =>
									setSearch(event.target.value)
								}
								placeholder="Search"
								className="h-8 pl-9"
							/>
						</div>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<CalendarIcon className="mr-1.5 size-3.5" />
							Create Date
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<TagIcon className="mr-1.5 size-3.5" />
							Order Tags
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Order Status
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Any Warehouse
						</Button>
						<CompactPager
							page={page}
							onPrev={() =>
								setPage((current) => Math.max(1, current - 1))
							}
							onNext={() => setPage((current) => current + 1)}
						/>
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
								<TableHead>Progress</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={10}
									className="h-12 text-muted-foreground"
								>
									No outbound orders yet.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<GuideActions
				title="No orders yet...Let's change that"
				guideLabel="View the Orders Guide"
				primaryActionLabel="Create Outbound Order"
				primaryActionHref="/app/orders"
				secondaryActionLabel="Connect Shopify"
				secondaryActionHref="/app/integrations"
				heroTitle="Simple Order Fulfillment"
			/>
		</div>
	);
}

function TransferTab() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-3xl font-semibold tracking-tight">
					Transfers
				</h2>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" aria-label="Import">
						<UploadIcon className="size-4" />
					</Button>
					<Button variant="outline" size="sm">
						Discrepancies
					</Button>
					<Button size="sm">Create Transfer</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<div className="relative w-full max-w-md">
							<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={search}
								onChange={(event) =>
									setSearch(event.target.value)
								}
								placeholder="Search"
								className="h-8 pl-9"
							/>
						</div>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<CalendarIcon className="mr-1.5 size-3.5" />
							Create Date
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<TagIcon className="mr-1.5 size-3.5" />
							Order Tags
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Order Status
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Origin
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Destination
						</Button>
						<CompactPager
							page={page}
							onPrev={() =>
								setPage((current) => Math.max(1, current - 1))
							}
							onNext={() => setPage((current) => current + 1)}
						/>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Status</TableHead>
								<TableHead>Origin Warehouse</TableHead>
								<TableHead>Destination Warehouse</TableHead>
								<TableHead>ID</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Delivery Date</TableHead>
								<TableHead>Tags</TableHead>
								<TableHead>Progress</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={8}
									className="h-12 text-muted-foreground"
								>
									No transfers yet.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<GuideActions
				title="No transfers yet...Let's fix that"
				guideLabel="View the Transfers Guide"
				primaryActionLabel="Create a New Warehouse"
				primaryActionHref="/app/warehouse"
				secondaryActionLabel="Create New Transfer"
				secondaryActionHref="/app/orders"
				heroTitle="How To Transfer Stock"
			/>
		</div>
	);
}

function ManifestTab() {
	const [page, setPage] = useState(1);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-3xl font-semibold tracking-tight">
					Manifests
				</h2>
				<Button size="sm">Create Manifests</Button>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					<div className="flex items-center justify-end gap-2 border-b px-4 py-2">
						<CompactPager
							page={page}
							onPrev={() =>
								setPage((current) => Math.max(1, current - 1))
							}
							onNext={() => setPage((current) => current + 1)}
						/>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Created At</TableHead>
								<TableHead>Carrier</TableHead>
								<TableHead># Shipments</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={3}
									className="h-16 text-muted-foreground"
								>
									No manifests generated yet.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function FulfillTab() {
	const [batchPage, setBatchPage] = useState(1);
	const [shipmentPage, setShipmentPage] = useState(1);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
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
					<Button
						variant="outline"
						size="icon"
						aria-label="More actions"
					>
						<EllipsisIcon className="size-4" />
					</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardHeader className="border-b py-3 px-4">
					<div className="flex items-center justify-between gap-3">
						<CardTitle className="text-sm font-semibold uppercase tracking-wider">
							Batches
						</CardTitle>
						<Button size="sm" variant="outline">
							Merge Batches
						</Button>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="border-b px-4 py-2 text-xs font-semibold">
						No Filters
					</div>
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Batch Status
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<CalendarIcon className="mr-1.5 size-3.5" />
							Create Date
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<CalendarIcon className="mr-1.5 size-3.5" />
							Delivery Date
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Any Priority
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Assigned to Anyone
						</Button>
						<CompactPager
							page={batchPage}
							onPrev={() =>
								setBatchPage((current) =>
									Math.max(1, current - 1),
								)
							}
							onNext={() =>
								setBatchPage((current) => current + 1)
							}
						/>
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
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-12 text-muted-foreground"
								>
									No batches available.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card className="rounded-2xl border">
				<CardHeader className="border-b py-3 px-4">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Unbatched Shipments
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="border-b px-4 py-2 text-xs font-semibold">
						No Filters
					</div>
					<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Payment Status
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<TagIcon className="mr-1.5 size-3.5" />
							Order Tags
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							<TagIcon className="mr-1.5 size-3.5" />
							Product Tags
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Fulfillment Status
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Delivery Method
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Shipping Methods
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Item SKUs
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Order Sources
						</Button>
						<Button variant="outline" className={TAG_FILTER_CLASS}>
							Create Date
						</Button>
						<CompactPager
							page={shipmentPage}
							onPrev={() =>
								setShipmentPage((current) =>
									Math.max(1, current - 1),
								)
							}
							onNext={() =>
								setShipmentPage((current) => current + 1)
							}
						/>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Shipment ID</TableHead>
								<TableHead>Method</TableHead>
								<TableHead>Stage</TableHead>
								<TableHead>Deliver At</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Order Tags</TableHead>
								<TableHead>Source</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									colSpan={8}
									className="h-12 text-muted-foreground"
								>
									No unbatched shipments available.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export default function OrdersPage() {
	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="space-y-1">
				<h1 className="text-3xl font-semibold tracking-tight">
					Orders
				</h1>
				<p className="text-muted-foreground">
					Manage inbound, outbound, transfer, manifest, and
					fulfillment operations.
				</p>
			</div>

			<Tabs defaultValue="inbound" className="space-y-6 flex flex-col">
				<TabsList
					variant="line"
					className="justify-start gap-2 overflow-x-auto p-0"
				>
					<TabsTrigger value="inbound" className="px-3">
						Inbound
					</TabsTrigger>
					<TabsTrigger value="outbound" className="px-3">
						Outbound
					</TabsTrigger>
					<TabsTrigger value="transfer" className="px-3">
						Transfer
					</TabsTrigger>
					<TabsTrigger value="manifest" className="px-3">
						Manifest
					</TabsTrigger>
					<TabsTrigger value="fulfill" className="px-3">
						Fulfill
					</TabsTrigger>
				</TabsList>

				<TabsContent value="inbound">
					<InboundTab />
				</TabsContent>
				<TabsContent value="outbound">
					<OutboundTab />
				</TabsContent>
				<TabsContent value="transfer">
					<TransferTab />
				</TabsContent>
				<TabsContent value="manifest">
					<ManifestTab />
				</TabsContent>
				<TabsContent value="fulfill">
					<FulfillTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
