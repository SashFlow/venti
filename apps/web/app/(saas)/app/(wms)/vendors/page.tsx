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
import {
	ArrowRightIcon,
	DownloadIcon,
	EllipsisIcon,
	FileSpreadsheetIcon,
	PlayIcon,
	PlusIcon,
	SearchIcon,
	UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const ITEMS_PER_PAGE = 20;

type Vendor = {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	accountNumber: string | null;
	openOrders: number;
};

// TODO: replace with real vendor list query
const PLACEHOLDER_VENDORS: Vendor[] = [];

export default function VendorsPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const filteredVendors = useMemo(() => {
		if (!search) {
			return PLACEHOLDER_VENDORS;
		}

		const q = search.toLowerCase();
		return PLACEHOLDER_VENDORS.filter((vendor) => {
			return (
				vendor.name.toLowerCase().includes(q) ||
				vendor.email?.toLowerCase().includes(q) ||
				vendor.phone?.includes(q) ||
				vendor.accountNumber?.toLowerCase().includes(q)
			);
		});
	}, [search]);

	const paginatedVendors = filteredVendors.slice(
		(page - 1) * ITEMS_PER_PAGE,
		page * ITEMS_PER_PAGE,
	);

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-3xl font-semibold tracking-tight">
					Vendors
				</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						aria-label="Upload vendors"
					>
						<UploadIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Download vendor template"
					>
						<DownloadIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Export vendor CSV"
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
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Account Number</TableHead>
								<TableHead className="text-right">
									Open Orders
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedVendors.map((vendor) => (
								<TableRow key={vendor.id}>
									<TableCell className="font-medium">
										{vendor.name}
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
								</TableRow>
							))}
							{paginatedVendors.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
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
						<span className="font-medium">{page}</span>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setPage((current) => current + 1)}
							disabled={
								filteredVendors.length <= page * ITEMS_PER_PAGE
							}
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
