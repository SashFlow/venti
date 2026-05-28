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
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
	Loader2Icon,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ImportProductsDialog } from "./components/ImportProductsDialog";
import { useProductsContext } from "./lib/products-context";

const ITEMS_PER_PAGE = 20;

function ProductsPage() {
	const {
		organizationId,
		search,
		setSearch,
		page,
		setPage,
		invalidateProducts,
	} = useProductsContext();

	const [isImportOpen, setIsImportOpen] = useState(false);

	const { data, isPending } = useQuery({
		...orpc.products.list.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				query: search.trim() || undefined,
				limit: ITEMS_PER_PAGE,
				offset: (page - 1) * ITEMS_PER_PAGE,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const products = data?.products ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, setPage, totalPages]);

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					Products
				</h1>
			</div>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">All Products</CardTitle>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setIsImportOpen(true)}
						>
							<DownloadIcon className="w-4 h-4 mr-2" />
							Import
						</Button>
						<Button size="sm" asChild>
							<Link href="/app/products/create">
								<PlusIcon className="w-4 h-4 mr-2" />
								Create
							</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="grid gap-3 md:grid-cols-3">
						<Input
							placeholder="Search by name or code..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className="md:col-span-1"
						/>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Code</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Tracking Flags</TableHead>
								<TableHead>Variants (SKUs)</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="h-14 text-center"
									>
										<div className="flex items-center justify-center gap-2 text-muted-foreground">
											<Loader2Icon className="size-4 animate-spin" />
											Loading products...
										</div>
									</TableCell>
								</TableRow>
							)}
							{!isPending && products.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="h-14 text-center text-muted-foreground"
									>
										No products found.
									</TableCell>
								</TableRow>
							)}
							{products.map((product) => (
								<TableRow key={product.id}>
									<TableCell className="font-medium">
										{product.code}
									</TableCell>
									<TableCell>{product.name}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{product.isPerishable && (
												<span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
													Perishable
												</span>
											)}
											{product.isBatchTracked && (
												<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
													Batch
												</span>
											)}
											{product.isSerialTracked && (
												<span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800">
													Serial
												</span>
											)}
											{!product.isPerishable &&
												!product.isBatchTracked &&
												!product.isSerialTracked && (
													<span className="text-xs text-muted-foreground">
														None
													</span>
												)}
										</div>
									</TableCell>
									<TableCell className="text-sm">
										{product.skus?.length || 0} SKU(s)
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t p-4">
						<p className="text-sm text-muted-foreground">
							Page {page} of {totalPages}
						</p>
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setPage(page - 1)}
								disabled={page <= 1}
								aria-label="Previous page"
							>
								<ChevronLeftIcon className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setPage(page + 1)}
								disabled={page >= totalPages}
								aria-label="Next page"
							>
								<ChevronRightIcon className="size-4" />
							</Button>
						</div>
					</div>
				)}
			</Card>

			<ImportProductsDialog
				open={isImportOpen}
				onOpenChange={setIsImportOpen}
			/>
		</div>
	);
}

export default ProductsPage;
