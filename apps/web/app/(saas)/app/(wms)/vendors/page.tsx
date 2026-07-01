"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowRightIcon,
	DownloadIcon,
	EllipsisIcon,
	FileSpreadsheetIcon,
	Loader2Icon,
	PlayIcon,
	PlusIcon,
	SearchIcon,
	Trash2Icon,
	UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { readVendorMetadata } from "./lib/vendor-utils";
import { useVendorsContext } from "./lib/vendors-context";

const ITEMS_PER_PAGE = 20;

type Vendor = {
	id: string;
	code: string;
	name: string;
	email: string | null;
	phone: string | null;
	accountNumber: string | null;
	openOrders: number;
};

function downloadCsvFile(params: { fileName: string; csv: string }) {
	const blob = new Blob([params.csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = params.fileName;
	anchor.click();
	URL.revokeObjectURL(url);
}

export default function VendorsPage() {
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();
	const {
		organizationId,
		search,
		setSearch,
		page,
		setPage,
		invalidateVendors,
	} = useVendorsContext();

	const { data, isPending } = useQuery({
		...orpc.masterData.suppliers.list.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				query: search.trim() || undefined,
				limit: ITEMS_PER_PAGE,
				offset: (page - 1) * ITEMS_PER_PAGE,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const deleteSupplierMutation = useMutation(
		orpc.masterData.suppliers.delete.mutationOptions(),
	);

	const vendors = useMemo<Vendor[]>(() => {
		return (data?.suppliers ?? []).map((supplier) => {
			const metadata = readVendorMetadata(supplier.metadata);

			return {
				id: supplier.id,
				code: supplier.code,
				name: supplier.name,
				email: supplier.email,
				phone: supplier.phone,
				accountNumber: metadata.accountNumber || null,
				openOrders: supplier.openOrderCount ?? 0,
			};
		});
	}, [data?.suppliers]);

	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, setPage, totalPages]);

	const onDelete = (vendor: Vendor) => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		confirm({
			title: "Delete vendor",
			message: `Delete ${vendor.name}? This action cannot be undone.`,
			destructive: true,
			onConfirm: async () => {
				await deleteSupplierMutation.mutateAsync({
					organizationId,
					id: vendor.id,
				});

				await invalidateVendors();
				toast.success("Vendor deleted.");
			},
		});
	};

	const onDownloadTemplate = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		const result = await queryClient.fetchQuery(
			orpc.masterData.suppliers.importTemplate.queryOptions({
				input: { organizationId },
			}),
		);

		downloadCsvFile({ fileName: result.fileName, csv: result.csv });
	};

	const onExport = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		const result = await queryClient.fetchQuery(
			orpc.masterData.suppliers.export.queryOptions({
				input: {
					organizationId,
					query: search.trim() || undefined,
				},
			}),
		);

		downloadCsvFile({ fileName: result.fileName, csv: result.csv });
		toast.success(`Exported ${result.count} vendors.`);
	};

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-3xl font-semibold tracking-tight">
					Vendors
				</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" asChild>
						<Link
							href="/app/vendors/import"
							aria-label="Upload vendors"
						>
							<UploadIcon className="size-4" />
						</Link>
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Download vendor template"
						onClick={() => {
							void onDownloadTemplate();
						}}
					>
						<DownloadIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Export vendor CSV"
						onClick={() => {
							void onExport();
						}}
					>
						<FileSpreadsheetIcon className="size-4" />
					</Button>
					<Button asChild>
						<Link href="/app/vendors/create">
							<PlusIcon className="size-4" />
							Create Vendor
						</Link>
					</Button>
				</div>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					<div className="flex items-center gap-2 px-4 py-3 border-b">
						<SearchIcon className="size-4 text-muted-foreground shrink-0" />
						<Input
							className="h-8 border-0 shadow-none focus-visible:ring-0 px-0"
							placeholder="Filter"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
						/>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Code</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Account Number</TableHead>
								<TableHead className="text-right">
									Open Orders
								</TableHead>
								<TableHead className="w-16" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending && (
								<TableRow>
									<TableCell colSpan={7} className="h-14">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Loader2Icon className="size-4 animate-spin" />
											Loading vendors...
										</div>
									</TableCell>
								</TableRow>
							)}
							{vendors.map((vendor) => (
								<TableRow key={vendor.id}>
									<TableCell className="font-medium">
										<Link
											href={`/app/vendors/${vendor.id}`}
											className="hover:underline"
										>
											{vendor.name}
										</Link>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{vendor.code}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{vendor.email ?? "-"}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{vendor.phone ?? "-"}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{vendor.accountNumber ?? "-"}
									</TableCell>
									<TableCell className="text-right">
										{vendor.openOrders}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(vendor)}
											aria-label={`Delete ${vendor.name}`}
										>
											<Trash2Icon className="size-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
							{!isPending && vendors.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={7}
										className="h-14 text-muted-foreground"
									>
										No vendors yet.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					<div className="flex items-center justify-end gap-3 border-t px-4 py-3 text-sm">
						<Button
							variant="outline"
							size="icon"
							onClick={() =>
								setPage((current) => Math.max(1, current - 1))
							}
							disabled={page === 1}
						>
							<span aria-hidden>‹</span>
							<span className="sr-only">Previous page</span>
						</Button>
						<span className="font-medium">
							{page} / {totalPages}
						</span>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setPage((current) => current + 1)}
							disabled={page >= totalPages}
						>
							<span aria-hidden>›</span>
							<span className="sr-only">Next page</span>
						</Button>
						<Button
							variant="outline"
							size="icon"
							aria-label="More options"
						>
							<EllipsisIcon className="size-4" />
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-4 rounded-2xl bg-muted/30 p-6">
				<div className="space-y-1 text-center">
					<h2 className="text-4xl font-semibold tracking-tight">
						Add vendors...Purchase stock
					</h2>
					<Link
						href="/app/vendors/create"
						className="inline-flex items-center gap-2 text-xl font-semibold text-primary"
					>
						View the Vendor Setup Guide
						<ArrowRightIcon className="size-5" />
					</Link>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<Card className="rounded-xl border">
						<CardContent className="flex items-center justify-between py-5">
							<p className="text-2xl font-semibold tracking-tight">
								Create a New Vendor
							</p>
							<Button variant="ghost" size="icon" asChild>
								<Link href="/app/vendors/create">
									<ArrowRightIcon className="size-5" />
								</Link>
							</Button>
						</CardContent>
					</Card>
					<Card className="rounded-xl border">
						<CardContent className="flex items-center justify-between py-5">
							<p className="text-2xl font-semibold tracking-tight">
								Import Vendors from Shopify
							</p>
							<Button variant="ghost" size="icon" asChild>
								<Link href="/app/vendors/import">
									<ArrowRightIcon className="size-5" />
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>

				<Card className="overflow-hidden rounded-2xl border">
					<CardContent className="relative flex min-h-72 items-center justify-center bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 p-8 text-center text-white">
						<div className="space-y-3">
							<p className="text-5xl font-semibold tracking-tight md:text-6xl">
								How To Manage Vendors and Products
							</p>
							<p className="text-base text-slate-200">
								Quick vendor onboarding walkthrough for
								operations teams.
							</p>
						</div>
						<button
							type="button"
							className="absolute rounded-full bg-black/40 p-3 text-white backdrop-blur hover:bg-black/60"
							aria-label="Play vendor setup guide"
						>
							<PlayIcon className="size-8 fill-current" />
						</button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
