"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const TAG_FILTER_CLASS =
	"h-8 rounded-md border border-input bg-muted/40 px-3 text-xs font-semibold text-foreground/80";
const PAGE_SIZE = 20;

function formatDate(date: Date | string | null | undefined) {
	if (!date) {
		return "-";
	}

	return new Date(date).toLocaleDateString();
}

function statusPill(status: string) {
	return (
		<span className="inline-flex rounded-full border bg-muted/30 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
			{status.replaceAll("_", " ")}
		</span>
	);
}

function CompactPager({
	page,
	onPrev,
	onNext,
	disablePrev,
	disableNext,
}: {
	page: number;
	onPrev: () => void;
	onNext: () => void;
	disablePrev?: boolean;
	disableNext?: boolean;
}) {
	return (
		<div className="ml-auto flex items-center gap-1">
			<Button
				variant="outline"
				size="icon"
				className="size-8"
				onClick={onPrev}
				disabled={disablePrev}
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
				disabled={disableNext}
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

function TableFeedbackRow({
	loading,
	error,
	empty,
	colSpan,
	emptyText,
}: {
	loading: boolean;
	error: boolean;
	empty: boolean;
	colSpan: number;
	emptyText: string;
}) {
	if (loading) {
		return (
			<TableRow>
				<TableCell
					colSpan={colSpan}
					className="h-12 text-muted-foreground"
				>
					Loading...
				</TableCell>
			</TableRow>
		);
	}

	if (error) {
		return (
			<TableRow>
				<TableCell colSpan={colSpan} className="h-12 text-destructive">
					Could not load data right now.
				</TableCell>
			</TableRow>
		);
	}

	if (empty) {
		return (
			<TableRow>
				<TableCell
					colSpan={colSpan}
					className="h-12 text-muted-foreground"
				>
					{emptyText}
				</TableCell>
			</TableRow>
		);
	}

	return null;
}

export function InboundTabContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const offset = (page - 1) * PAGE_SIZE;

	const { data, isPending, isError } = useQuery({
		...orpc.orders.listInbound.queryOptions({
			input: {
				organizationId,
				query: search.trim() || undefined,
				limit: PAGE_SIZE,
				offset,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const orders = data?.orders ?? [];
	const total = data?.total ?? 0;
	const canNext = offset + PAGE_SIZE < total;

	return (
		<TabsContent value="inbound">
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-3xl font-semibold tracking-tight">
							Purchase Orders
						</h2>
						<p className="text-xs text-muted-foreground">
							{total} total purchase orders
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Import"
						>
							<UploadIcon className="size-4" />
						</Button>
						<Button variant="outline" size="sm">
							Discrepancies
						</Button>
						<Button size="sm" asChild>
							<Link href="/app/orders/inbound/new">Create</Link>
						</Button>
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
									onChange={(event) => {
										setPage(1);
										setSearch(event.target.value);
									}}
									placeholder="Search PO number, supplier, or warehouse"
									className="h-8 pl-9"
								/>
							</div>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<CalendarIcon className="mr-1.5 size-3.5" />
								Create Date
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<TagIcon className="mr-1.5 size-3.5" />
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Order Status
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Any Vendor
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Any Warehouse
							</Button>
							<CompactPager
								page={page}
								onPrev={() =>
									setPage((current) =>
										Math.max(1, current - 1),
									)
								}
								onNext={() => setPage((current) => current + 1)}
								disablePrev={page === 1}
								disableNext={!canNext}
							/>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>Vendor</TableHead>
									<TableHead>Warehouse</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Delivery Date</TableHead>
									<TableHead className="text-right">
										Lines
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableFeedbackRow
									loading={isPending}
									error={isError}
									empty={
										!isPending &&
										!isError &&
										orders.length === 0
									}
									colSpan={7}
									emptyText="No purchase orders found."
								/>
								{orders.map((order) => (
									<TableRow
										key={order.id}
										className="hover:bg-muted/30 cursor-pointer"
										onClick={() =>
											router.push(
												`/app/orders/inbound/${order.id}`,
											)
										}
									>
										<TableCell>
											{statusPill(order.status)}
										</TableCell>
										<TableCell>
											{order.supplier.name}
										</TableCell>
										<TableCell>
											{order.warehouse.name}
										</TableCell>
										<TableCell className="font-medium">
											{order.poNumber}
										</TableCell>
										<TableCell>
											{formatDate(order.createdAt)}
										</TableCell>
										<TableCell>
											{formatDate(order.expectedDate)}
										</TableCell>
										<TableCell className="text-right">
											{order._count.lines}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<GuideActions
					title="No purchase orders yet...Let's change that"
					guideLabel="View Purchase Orders Guide"
					primaryActionLabel="Create Purchase Order"
					primaryActionHref="/app/orders/inbound/new"
					secondaryActionLabel="Sync Shopify Vendors"
					secondaryActionHref="/app/vendors/import"
					heroTitle="Purchase Orders and Put Away"
				/>
			</div>
		</TabsContent>
	);
}

export function OutboundTabContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
	const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
	const [isBulkUpdatingOrders, setIsBulkUpdatingOrders] = useState(false);
	const offset = (page - 1) * PAGE_SIZE;

	const updateOutboundStatusMutation = useMutation(
		orpc.orders.updateOutboundStatus.mutationOptions(),
	);
	const bulkUpdateOutboundStatusMutation = useMutation(
		orpc.orders.bulkUpdateOutboundStatus.mutationOptions(),
	);

	const { data, isPending, isError } = useQuery({
		...orpc.orders.listOutbound.queryOptions({
			input: {
				organizationId,
				query: search.trim() || undefined,
				limit: PAGE_SIZE,
				offset,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const orders = data?.orders ?? [];
	const total = data?.total ?? 0;
	const canNext = offset + PAGE_SIZE < total;
	const selectableOrders = orders.filter(
		(order) =>
			!["FULLY_SHIPPED", "CANCELLED", "CLOSED"].includes(order.status),
	);
	const isAllOrdersSelected =
		selectableOrders.length > 0 &&
		selectableOrders.every((order) => selectedOrderIds.includes(order.id));

	const handleMarkShipped = async (order: {
		id: string;
		orderNumber: string;
	}) => {
		if (!organizationId) {
			return;
		}

		setUpdatingOrderId(order.id);

		try {
			await updateOutboundStatusMutation.mutateAsync({
				organizationId,
				orderId: order.id,
				status: "FULLY_SHIPPED",
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listOutbound.key(),
			});

			toast.success(`Order ${order.orderNumber} marked as shipped.`);
		} catch {
			toast.error("Failed to update outbound order status.");
		} finally {
			setUpdatingOrderId(null);
		}
	};

	const handleToggleAllOrders = (checked: boolean) => {
		if (!checked) {
			setSelectedOrderIds([]);
			return;
		}

		setSelectedOrderIds(selectableOrders.map((order) => order.id));
	};

	const handleToggleOrder = (orderId: string, checked: boolean) => {
		setSelectedOrderIds((previous) => {
			if (checked) {
				return previous.includes(orderId)
					? previous
					: [...previous, orderId];
			}

			return previous.filter((id) => id !== orderId);
		});
	};

	const handleBulkMarkShipped = async () => {
		if (!organizationId || selectedOrderIds.length === 0) {
			return;
		}

		const targetOrders = selectableOrders.filter((order) =>
			selectedOrderIds.includes(order.id),
		);

		if (targetOrders.length === 0) {
			return;
		}

		setIsBulkUpdatingOrders(true);

		try {
			const result = await bulkUpdateOutboundStatusMutation.mutateAsync({
				organizationId,
				orderIds: targetOrders.map((order) => order.id),
				status: "FULLY_SHIPPED",
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listOutbound.key(),
			});

			setSelectedOrderIds([]);

			if (result.skipped > 0) {
				toast.warning(
					`${result.updated} orders updated, ${result.skipped} skipped (already shipped/closed/cancelled or unavailable).`,
				);
			} else {
				toast.success(
					`${result.updated} outbound orders marked as shipped.`,
				);
			}
		} catch {
			toast.error("Failed to update one or more outbound orders.");
		} finally {
			setIsBulkUpdatingOrders(false);
		}
	};

	return (
		<TabsContent value="outbound">
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-3xl font-semibold tracking-tight">
							Outbound Orders
						</h2>
						<p className="text-xs text-muted-foreground">
							{total} total outbound orders
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Import"
						>
							<UploadIcon className="size-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								void handleBulkMarkShipped();
							}}
							disabled={
								selectedOrderIds.length === 0 ||
								isBulkUpdatingOrders ||
								bulkUpdateOutboundStatusMutation.isPending
							}
						>
							Ship Selected
						</Button>
						<Button variant="outline" size="sm" asChild>
							<Link href="/app/orders/fulfill/new">Fulfill</Link>
						</Button>
						<Button size="sm" asChild>
							<Link href="/app/orders/outbound/new">Create</Link>
						</Button>
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
									onChange={(event) => {
										setPage(1);
										setSearch(event.target.value);
									}}
									placeholder="Search order number, customer, or warehouse"
									className="h-8 pl-9"
								/>
							</div>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<CalendarIcon className="mr-1.5 size-3.5" />
								Create Date
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<TagIcon className="mr-1.5 size-3.5" />
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Order Status
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Any Warehouse
							</Button>
							<CompactPager
								page={page}
								onPrev={() =>
									setPage((current) =>
										Math.max(1, current - 1),
									)
								}
								onNext={() => setPage((current) => current + 1)}
								disablePrev={page === 1}
								disableNext={!canNext}
							/>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox
											aria-label="Select all outbound orders"
											checked={isAllOrdersSelected}
											onCheckedChange={(checked) => {
												handleToggleAllOrders(
													Boolean(checked),
												);
											}}
										/>
									</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Warehouse</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Deliver At</TableHead>
									<TableHead>Source</TableHead>
									<TableHead className="text-right">
										Lines
									</TableHead>
									<TableHead className="text-right">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableFeedbackRow
									loading={isPending}
									error={isError}
									empty={
										!isPending &&
										!isError &&
										orders.length === 0
									}
									colSpan={10}
									emptyText="No outbound orders found."
								/>
								{orders.map((order) => (
									<TableRow
										key={order.id}
										className="hover:bg-muted/30 cursor-pointer"
										onClick={(e) => {
											if (
												(
													e.target as HTMLElement
												).closest(
													'[role="checkbox"]',
												) ||
												(e.target as HTMLElement)
													.tagName === "BUTTON"
											)
												return;
											router.push(
												`/app/orders/outbound/${order.id}`,
											);
										}}
									>
										<TableCell>
											<Checkbox
												aria-label={`Select outbound order ${order.orderNumber}`}
												checked={selectedOrderIds.includes(
													order.id,
												)}
												onCheckedChange={(checked) => {
													handleToggleOrder(
														order.id,
														Boolean(checked),
													);
												}}
												disabled={
													[
														"FULLY_SHIPPED",
														"CANCELLED",
														"CLOSED",
													].includes(order.status) ||
													isBulkUpdatingOrders
												}
											/>
										</TableCell>
										<TableCell>
											{statusPill(order.status)}
										</TableCell>
										<TableCell>
											{order.customerName ?? "-"}
										</TableCell>
										<TableCell>
											{order.warehouse.name}
										</TableCell>
										<TableCell className="font-medium">
											{order.orderNumber}
										</TableCell>
										<TableCell>
											{formatDate(order.createdAt)}
										</TableCell>
										<TableCell>
											{formatDate(order.requiredByDate)}
										</TableCell>
										<TableCell>
											{order.customerRef ?? "-"}
										</TableCell>
										<TableCell className="text-right">
											{order._count.lines}
										</TableCell>
										<TableCell className="text-right">
											{[
												"FULLY_SHIPPED",
												"CANCELLED",
												"CLOSED",
											].includes(order.status) ? (
												<span className="text-muted-foreground text-xs">
													-
												</span>
											) : (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														void handleMarkShipped({
															id: order.id,
															orderNumber:
																order.orderNumber,
														});
													}}
													disabled={
														isBulkUpdatingOrders ||
														(updateOutboundStatusMutation.isPending &&
															updatingOrderId ===
																order.id)
													}
												>
													Ship
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<GuideActions
					title="No orders yet...Let's change that"
					guideLabel="View the Orders Guide"
					primaryActionLabel="Create Outbound Order"
					primaryActionHref="/app/orders/outbound/new"
					secondaryActionLabel="Connect Shopify"
					secondaryActionHref="/app/integrations"
					heroTitle="Simple Order Fulfillment"
				/>
			</div>
		</TabsContent>
	);
}

export function TransferTabContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [completingTransferId, setCompletingTransferId] = useState<
		string | null
	>(null);
	const offset = (page - 1) * PAGE_SIZE;

	const completeTransferMutation = useMutation(
		orpc.orders.completeTransfer.mutationOptions(),
	);

	const { data, isPending, isError } = useQuery({
		...orpc.orders.listTransfers.queryOptions({
			input: {
				organizationId,
				query: search.trim() || undefined,
				limit: PAGE_SIZE,
				offset,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const transfers = data?.transfers ?? [];
	const total = data?.total ?? 0;
	const canNext = offset + PAGE_SIZE < total;

	const handleCompleteTransfer = async (transfer: {
		id: string;
		referenceNumber: string | null;
	}) => {
		if (!organizationId) {
			return;
		}

		setCompletingTransferId(transfer.id);

		try {
			await completeTransferMutation.mutateAsync({
				organizationId,
				transferId: transfer.id,
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listTransfers.key(),
			});

			toast.success(
				`Transfer ${transfer.referenceNumber ?? transfer.id.slice(0, 10)} completed.`,
			);
		} catch {
			toast.error("Failed to complete transfer.");
		} finally {
			setCompletingTransferId(null);
		}
	};

	return (
		<TabsContent value="transfer">
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-3xl font-semibold tracking-tight">
							Transfers
						</h2>
						<p className="text-xs text-muted-foreground">
							{total} total transfer movements
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Import"
						>
							<UploadIcon className="size-4" />
						</Button>
						<Button variant="outline" size="sm">
							Discrepancies
						</Button>
						<Button size="sm" asChild>
							<Link href="/app/orders/transfers/new">
								Create Transfer
							</Link>
						</Button>
					</div>
				</div>

				<Card className="rounded-2xl border">
					<CardContent className="p-0">
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<div className="relative w-full max-w-md">
								<SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={search}
									onChange={(event) => {
										setPage(1);
										setSearch(event.target.value);
									}}
									placeholder="Search transfer reference or warehouse"
									className="h-8 pl-9"
								/>
							</div>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<CalendarIcon className="mr-1.5 size-3.5" />
								Create Date
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<TagIcon className="mr-1.5 size-3.5" />
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Order Status
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Origin
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Destination
							</Button>
							<CompactPager
								page={page}
								onPrev={() =>
									setPage((current) =>
										Math.max(1, current - 1),
									)
								}
								onNext={() => setPage((current) => current + 1)}
								disablePrev={page === 1}
								disableNext={!canNext}
							/>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>Origin</TableHead>
									<TableHead>Destination</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Completed At</TableHead>
									<TableHead className="text-right">
										Qty
									</TableHead>
									<TableHead className="text-right">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableFeedbackRow
									loading={isPending}
									error={isError}
									empty={
										!isPending &&
										!isError &&
										transfers.length === 0
									}
									colSpan={8}
									emptyText="No transfers found."
								/>
								{transfers.map((transfer) => (
									<TableRow
										key={transfer.id}
										className="hover:bg-muted/30 cursor-pointer"
										onClick={(e) => {
											if (
												(e.target as HTMLElement)
													.tagName === "BUTTON"
											)
												return;
											router.push(
												`/app/orders/transfers/${transfer.id}`,
											);
										}}
									>
										<TableCell>
											{statusPill(transfer.status)}
										</TableCell>
										<TableCell>
											{transfer.fromStorageUnit?.code ??
												"-"}
										</TableCell>
										<TableCell>
											{transfer.toStorageUnit?.code ??
												"-"}
										</TableCell>
										<TableCell className="font-medium">
											{transfer.referenceNumber ??
												transfer.id.slice(0, 10)}
										</TableCell>
										<TableCell>
											{formatDate(transfer.createdAt)}
										</TableCell>
										<TableCell>
											{formatDate(transfer.completedAt)}
										</TableCell>
										<TableCell className="text-right">
											{transfer.quantity.toString()}
										</TableCell>
										<TableCell className="text-right">
											{[
												"COMPLETED",
												"CANCELLED",
												"FAILED",
											].includes(transfer.status) ? (
												<span className="text-muted-foreground text-xs">
													-
												</span>
											) : (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														void handleCompleteTransfer(
															{
																id: transfer.id,
																referenceNumber:
																	transfer.referenceNumber,
															},
														);
													}}
													disabled={
														completeTransferMutation.isPending &&
														completingTransferId ===
															transfer.id
													}
												>
													Complete
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
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
					secondaryActionHref="/app/orders/transfers/new"
					heroTitle="How To Transfer Stock"
				/>
			</div>
		</TabsContent>
	);
}

export function ManifestTabContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const offset = (page - 1) * PAGE_SIZE;

	const { data, isPending, isError } = useQuery({
		...orpc.orders.listManifests.queryOptions({
			input: {
				organizationId,
				limit: PAGE_SIZE,
				offset,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const manifests = data?.manifests ?? [];
	const total = data?.total ?? 0;
	const canNext = offset + PAGE_SIZE < total;

	return (
		<TabsContent value="manifest">
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-3xl font-semibold tracking-tight">
							Manifests
						</h2>
						<p className="text-xs text-muted-foreground">
							{total} manifest records
						</p>
					</div>
					<Button size="sm" asChild>
						<Link href="/app/orders/manifests/new">
							Create Shipment
						</Link>
					</Button>
				</div>

				<Card className="rounded-2xl border">
					<CardContent className="p-0">
						<div className="flex items-center justify-end gap-2 border-b px-4 py-2">
							<CompactPager
								page={page}
								onPrev={() =>
									setPage((current) =>
										Math.max(1, current - 1),
									)
								}
								onNext={() => setPage((current) => current + 1)}
								disablePrev={page === 1}
								disableNext={!canNext}
							/>
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Created At</TableHead>
									<TableHead>Carrier</TableHead>
									<TableHead>Manifest Ref</TableHead>
									<TableHead># Shipments</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableFeedbackRow
									loading={isPending}
									error={isError}
									empty={
										!isPending &&
										!isError &&
										manifests.length === 0
									}
									colSpan={4}
									emptyText="No manifests generated yet."
								/>
								{manifests.map((manifest) => (
									<TableRow
										key={manifest.id}
										className="hover:bg-muted/30 cursor-pointer"
										onClick={() =>
											router.push(
												`/app/orders/manifests/${manifest.id}`,
											)
										}
									>
										<TableCell>
											{formatDate(manifest.createdAt)}
										</TableCell>
										<TableCell>
											{manifest.carrier?.name ??
												"Unassigned"}
										</TableCell>
										<TableCell className="font-medium">
											{manifest.shipmentNumber}
										</TableCell>
										<TableCell>
											{manifest.shipmentsCount}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	);
}

export function FulfillTabContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const queryClient = useQueryClient();
	const [batchPage, setBatchPage] = useState(1);
	const [shipmentPage, setShipmentPage] = useState(1);
	const [updatingShipmentId, setUpdatingShipmentId] = useState<string | null>(
		null,
	);
	const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>(
		[],
	);
	const [isBulkUpdatingShipments, setIsBulkUpdatingShipments] =
		useState(false);

	const batchOffset = (batchPage - 1) * PAGE_SIZE;
	const shipmentOffset = (shipmentPage - 1) * PAGE_SIZE;

	const batchesQuery = useQuery({
		...orpc.orders.listFulfillmentBatches.queryOptions({
			input: {
				organizationId,
				limit: PAGE_SIZE,
				offset: batchOffset,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const shipmentsQuery = useQuery({
		...orpc.orders.listFulfillmentShipments.queryOptions({
			input: {
				organizationId,
				limit: PAGE_SIZE,
				offset: shipmentOffset,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const batches = batchesQuery.data?.batches ?? [];
	const batchesTotal = batchesQuery.data?.total ?? 0;
	const unbatchedShipments = shipmentsQuery.data?.shipments ?? [];
	const shipmentsTotal = shipmentsQuery.data?.total ?? 0;

	const updateShipmentStatusMutation = useMutation(
		orpc.orders.updateShipmentStatus.mutationOptions(),
	);
	const bulkUpdateShipmentStatusesMutation = useMutation(
		orpc.orders.bulkUpdateShipmentStatuses.mutationOptions(),
	);

	const canNextBatches = batchOffset + PAGE_SIZE < batchesTotal;
	const canNextShipments = shipmentOffset + PAGE_SIZE < shipmentsTotal;
	const actionableShipments = unbatchedShipments.filter(
		(shipment) =>
			shipment.status === "PENDING" ||
			shipment.status === "READY_TO_SHIP",
	);
	const isAllShipmentsSelected =
		actionableShipments.length > 0 &&
		actionableShipments.every((shipment) =>
			selectedShipmentIds.includes(shipment.id),
		);

	const handleProgressShipment = async (shipment: {
		id: string;
		shipmentNumber: string;
		status: string;
	}) => {
		if (!organizationId) {
			return;
		}

		const nextStatus =
			shipment.status === "PENDING"
				? "READY_TO_SHIP"
				: shipment.status === "READY_TO_SHIP"
					? "DISPATCHED"
					: null;

		if (!nextStatus) {
			return;
		}

		setUpdatingShipmentId(shipment.id);

		try {
			await updateShipmentStatusMutation.mutateAsync({
				organizationId,
				shipmentId: shipment.id,
				status: nextStatus,
			});

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.orders.listFulfillmentShipments.key(),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.orders.listManifests.key(),
				}),
			]);

			toast.success(`Shipment ${shipment.shipmentNumber} updated.`);
		} catch {
			toast.error("Failed to update shipment status.");
		} finally {
			setUpdatingShipmentId(null);
		}
	};

	const handleToggleAllShipments = (checked: boolean) => {
		if (!checked) {
			setSelectedShipmentIds([]);
			return;
		}

		setSelectedShipmentIds(
			actionableShipments.map((shipment) => shipment.id),
		);
	};

	const handleToggleShipment = (shipmentId: string, checked: boolean) => {
		setSelectedShipmentIds((previous) => {
			if (checked) {
				return previous.includes(shipmentId)
					? previous
					: [...previous, shipmentId];
			}

			return previous.filter((id) => id !== shipmentId);
		});
	};

	const getNextShipmentStatus = (status: string) => {
		if (status === "PENDING") {
			return "READY_TO_SHIP" as const;
		}

		if (status === "READY_TO_SHIP") {
			return "DISPATCHED" as const;
		}

		return null;
	};

	const handleBulkProgressShipments = async () => {
		if (!organizationId || selectedShipmentIds.length === 0) {
			return;
		}

		const targetShipments = actionableShipments.filter((shipment) =>
			selectedShipmentIds.includes(shipment.id),
		);

		if (targetShipments.length === 0) {
			return;
		}

		setIsBulkUpdatingShipments(true);

		try {
			const result = await bulkUpdateShipmentStatusesMutation.mutateAsync(
				{
					organizationId,
					updates: targetShipments
						.map((shipment) => {
							const nextStatus = getNextShipmentStatus(
								shipment.status,
							);

							if (!nextStatus) {
								return null;
							}

							return {
								shipmentId: shipment.id,
								status: nextStatus,
							};
						})
						.filter(
							(
								update,
							): update is {
								shipmentId: string;
								status: "READY_TO_SHIP" | "DISPATCHED";
							} => update !== null,
						),
				},
			);

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: orpc.orders.listFulfillmentShipments.key(),
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.orders.listManifests.key(),
				}),
			]);

			setSelectedShipmentIds([]);

			if (result.skipped > 0) {
				toast.warning(
					`${result.updated} shipments progressed, ${result.skipped} skipped (unavailable or no longer eligible).`,
				);
			} else {
				toast.success(`${result.updated} shipments progressed.`);
			}
		} catch {
			toast.error("Failed to update one or more shipments.");
		} finally {
			setIsBulkUpdatingShipments(false);
		}
	};

	return (
		<TabsContent value="fulfill">
			<div className="space-y-6">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<h2 className="text-3xl font-semibold tracking-tight">
							Fulfill
						</h2>
						<p className="text-xs text-muted-foreground">
							{batchesTotal} batches • {shipmentsTotal} pending
							shipments
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								void handleBulkProgressShipments();
							}}
							disabled={
								selectedShipmentIds.length === 0 ||
								isBulkUpdatingShipments ||
								bulkUpdateShipmentStatusesMutation.isPending
							}
						>
							Progress Selected
						</Button>
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
					<CardHeader className="border-b px-4 py-3">
						<div className="flex items-center justify-between gap-3">
							<CardTitle className="text-sm font-semibold uppercase tracking-wider">
								Batches
							</CardTitle>
							<div className="flex gap-2">
								<Button size="sm" variant="outline">
									Merge Batches
								</Button>
								<Button size="sm" asChild>
									<Link href="/app/orders/fulfill/new">
										New Wave
									</Link>
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Batch Status
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<CalendarIcon className="mr-1.5 size-3.5" />
								Create Date
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<CalendarIcon className="mr-1.5 size-3.5" />
								Delivery Date
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Any Priority
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
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
								disablePrev={batchPage === 1}
								disableNext={!canNextBatches}
							/>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Assignee</TableHead>
									<TableHead>Orders</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Deliver At</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">
										Lines
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableFeedbackRow
									loading={batchesQuery.isPending}
									error={batchesQuery.isError}
									empty={
										!batchesQuery.isPending &&
										!batchesQuery.isError &&
										batches.length === 0
									}
									colSpan={7}
									emptyText="No batches available."
								/>
								{batches.map((batch) => (
									<TableRow
										key={batch.id}
										className="hover:bg-muted/30 cursor-pointer"
										onClick={() =>
											router.push(
												`/app/orders/fulfill/${batch.id}`,
											)
										}
									>
										<TableCell className="font-medium">
											{batch.waveNumber}
										</TableCell>
										<TableCell>
											{batch.releasedBy?.name ??
												"Unassigned"}
										</TableCell>
										<TableCell>
											{batch._count.salesOrders}
										</TableCell>
										<TableCell>
											{formatDate(batch.createdAt)}
										</TableCell>
										<TableCell>
											{formatDate(batch.completedAt)}
										</TableCell>
										<TableCell>
											{statusPill(batch.status)}
										</TableCell>
										<TableCell className="text-right">
											{batch._count.lines}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border">
					<CardHeader className="border-b px-4 py-3">
						<CardTitle className="text-sm font-semibold uppercase tracking-wider">
							Unbatched Shipments
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="border-b px-4 py-2 text-xs font-semibold">
							No Filters
						</div>
						<div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Payment Status
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<TagIcon className="mr-1.5 size-3.5" />
								Order Tags
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								<TagIcon className="mr-1.5 size-3.5" />
								Product Tags
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Fulfillment Status
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Delivery Method
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Shipping Methods
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Item SKUs
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
								Order Sources
							</Button>
							<Button
								variant="outline"
								className={TAG_FILTER_CLASS}
							>
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
								disablePrev={shipmentPage === 1}
								disableNext={!canNextShipments}
							/>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox
											aria-label="Select all fulfill shipments"
											checked={isAllShipmentsSelected}
											onCheckedChange={(checked) => {
												handleToggleAllShipments(
													Boolean(checked),
												);
											}}
										/>
									</TableHead>
									<TableHead>Shipment ID</TableHead>
									<TableHead>Method</TableHead>
									<TableHead>Stage</TableHead>
									<TableHead>Deliver At</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Created At</TableHead>
									<TableHead>Order Source</TableHead>
									<TableHead className="text-right">
										Action
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableFeedbackRow
									loading={shipmentsQuery.isPending}
									error={shipmentsQuery.isError}
									empty={
										!shipmentsQuery.isPending &&
										!shipmentsQuery.isError &&
										unbatchedShipments.length === 0
									}
									colSpan={9}
									emptyText="No unbatched shipments available."
								/>
								{unbatchedShipments.map((shipment) => (
									<TableRow
										key={shipment.id}
										className="hover:bg-muted/30 cursor-pointer"
										onClick={(e) => {
											if (
												(
													e.target as HTMLElement
												).closest(
													'[role="checkbox"]',
												) ||
												(e.target as HTMLElement)
													.tagName === "BUTTON"
											)
												return;
											router.push(
												`/app/orders/manifests/${shipment.id}`,
											);
										}}
									>
										<TableCell>
											<Checkbox
												aria-label={`Select shipment ${shipment.shipmentNumber}`}
												checked={selectedShipmentIds.includes(
													shipment.id,
												)}
												onCheckedChange={(checked) => {
													handleToggleShipment(
														shipment.id,
														Boolean(checked),
													);
												}}
												disabled={
													(shipment.status !==
														"PENDING" &&
														shipment.status !==
															"READY_TO_SHIP") ||
													isBulkUpdatingShipments
												}
											/>
										</TableCell>
										<TableCell className="font-medium">
											{shipment.shipmentNumber}
										</TableCell>
										<TableCell>Standard</TableCell>
										<TableCell>
											{statusPill(shipment.status)}
										</TableCell>
										<TableCell>
											{formatDate(shipment.scheduledAt)}
										</TableCell>
										<TableCell>
											{shipment.salesOrder.customerName ??
												"-"}
										</TableCell>
										<TableCell>
											{formatDate(shipment.createdAt)}
										</TableCell>
										<TableCell>
											{shipment.salesOrder.customerRef ??
												"-"}
										</TableCell>
										<TableCell className="text-right">
											{shipment.status === "PENDING" ||
											shipment.status ===
												"READY_TO_SHIP" ? (
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														void handleProgressShipment(
															{
																id: shipment.id,
																shipmentNumber:
																	shipment.shipmentNumber,
																status: shipment.status,
															},
														);
													}}
													disabled={
														isBulkUpdatingShipments ||
														(updateShipmentStatusMutation.isPending &&
															updatingShipmentId ===
																shipment.id)
													}
												>
													{shipment.status ===
													"PENDING"
														? "Ready"
														: "Dispatch"}
												</Button>
											) : (
												<span className="text-muted-foreground text-xs">
													-
												</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	);
}
