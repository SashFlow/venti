"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/accordion";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
	Loader2Icon,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ImportProductsDialog } from "./components/ImportProductsDialog";
import { useProductsContext } from "./lib/products-context";

const ITEMS_PER_PAGE = 20;
const STATUS_OPTIONS = [
	{ label: "All", value: "" },
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
];
const PRODUCT_TYPE_OPTIONS = [
	{ label: "All", value: "" },
	{ label: "Type 1", value: "type1" },
	{ label: "Type 2", value: "type2" },
];
const TAG_OPTIONS = [
	{ label: "All", value: "" },
	{ label: "Tag 1", value: "tag1" },
	{ label: "Tag 2", value: "tag2" },
];

function ProductsPage() {
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();
	const {
		organizationId,
		search,
		setSearch,
		page,
		setPage,
		invalidateProducts,
	} = useProductsContext();

	const [isImportOpen, setIsImportOpen] = useState(false);
	const [status, setStatus] = useState("");
	const [productType, setProductType] = useState("");
	const [tag, setTag] = useState("");
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");

	const { data, isPending } = useQuery({
		...orpc.products.list.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				query: search.trim() || undefined,
				status,
				productType,
				tag,
				minPrice: minPrice ? Number(minPrice) : undefined,
				maxPrice: maxPrice ? Number(maxPrice) : undefined,
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
					<div className="grid gap-3 md:grid-cols-6">
						<Input
							placeholder="Search by name or code..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className="md:col-span-2"
						/>
						<Select
							value={status}
							onValueChange={setStatus}
							className="md:col-span-1"
						>
							<SelectTrigger>
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								{STATUS_OPTIONS.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
									>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={productType}
							onValueChange={setProductType}
							className="md:col-span-1"
						>
							<SelectTrigger>
								<SelectValue placeholder="Product Type" />
							</SelectTrigger>
							<SelectContent>
								{PRODUCT_TYPE_OPTIONS.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
									>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={tag}
							onValueChange={setTag}
							className="md:col-span-1"
						>
							<SelectTrigger>
								<SelectValue placeholder="Product Tag" />
							</SelectTrigger>
							<SelectContent>
								{TAG_OPTIONS.map((opt) => (
									<SelectItem
										key={opt.value}
										value={opt.value}
									>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="flex gap-2 md:col-span-1">
							<Input
								placeholder="$ Min"
								value={minPrice}
								onChange={(e) => setMinPrice(e.target.value)}
								type="number"
							/>
							<span className="self-center">-</span>
							<Input
								placeholder="$ Max"
								value={maxPrice}
								onChange={(e) => setMaxPrice(e.target.value)}
								type="number"
							/>
						</div>
					</div>

					<Accordion type="multiple" className="mt-4">
						{isPending && (
							<div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
								<Loader2Icon className="size-4 animate-spin" />
								Loading products...
							</div>
						)}
						{!isPending && products.length === 0 && (
							<div className="text-center text-muted-foreground py-8">
								No products found.
							</div>
						)}
						{products.map((product) => (
							<AccordionItem
								key={product.id}
								value={product.id}
								className="border-b"
							>
								<AccordionTrigger className="flex w-full items-center justify-between px-2 py-3">
									<div className="flex flex-row gap-6 items-center w-full">
										<span className="font-semibold min-w-[80px]">
											{product.code}
										</span>
										<span className="flex-1">
											{product.name}
										</span>
										<span className="flex flex-wrap gap-1 min-w-[120px]">
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
										</span>
										<span className="text-sm min-w-[80px]">
											{product.skus?.length || 0} SKU(s)
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="bg-muted/30 px-4 py-4">
									{product.skus && product.skus.length > 0 ? (
										<div className="space-y-10">
											{product.skus.map((sku: any) => (
												<div
													key={sku.id}
													className="mb-10"
												>
													{/* Stat Cards */}
													<div className="grid grid-cols-4 gap-4 mb-6">
														<div className="rounded-lg border bg-background p-4 flex flex-col items-start">
															<span className="text-xs font-bold uppercase text-muted-foreground mb-2">
																In Company
															</span>
															<span className="text-2xl font-semibold">
																{sku.inCompany ??
																	0}
															</span>
														</div>
														<div className="rounded-lg border bg-background p-4 flex flex-col items-start">
															<span className="text-xs font-bold uppercase text-muted-foreground mb-2">
																Committed
															</span>
															<span className="text-2xl font-semibold">
																{sku.committed ??
																	0}
															</span>
														</div>
														<div className="rounded-lg border bg-background p-4 flex flex-col items-start">
															<span className="text-xs font-bold uppercase text-muted-foreground mb-2">
																Expected
															</span>
															<span className="text-2xl font-semibold">
																{sku.expected ??
																	0}
															</span>
														</div>
														<div className="rounded-lg border bg-background p-4 flex flex-col items-start">
															<span className="text-xs font-bold uppercase text-muted-foreground mb-2">
																Avg Sales
															</span>
															<span className="text-2xl font-semibold">
																{sku.avgSales ?? (
																	<span className="text-base">
																		?/DAY
																	</span>
																)}
															</span>
														</div>
													</div>
													{/* Chart Placeholder */}
													<div
														className="w-full h-40 rounded-lg mb-6 flex items-end"
														style={{
															background:
																"linear-gradient(180deg, rgba(56,189,248,0.18) 0%, rgba(59,130,246,0.10) 60%, rgba(30,41,59,0.00) 100%)",
														}}
													>
														<ResponsiveContainer
															width="100%"
															height="100%"
														>
															<LineChart
																data={
																	Array.isArray(
																		sku.inventoryHistory,
																	) &&
																	sku
																		.inventoryHistory
																		.length >
																		0
																		? sku.inventoryHistory
																		: [
																				{
																					date: "",
																					qty:
																						sku.inCompany ??
																						0,
																				},
																				{
																					date: "",
																					qty:
																						sku.inCompany ??
																						0,
																				},
																			]
																}
																margin={{
																	top: 10,
																	right: 30,
																	left: 0,
																	bottom: 0,
																}}
															>
																<CartesianGrid strokeDasharray="3 3" />
																<XAxis
																	dataKey="date"
																	tick={{
																		fontSize: 10,
																	}}
																/>
																<YAxis
																	tick={{
																		fontSize: 10,
																	}}
																/>
																<Tooltip />
																<Line
																	type="monotone"
																	dataKey="qty"
																	stroke="#2563eb"
																	strokeWidth={
																		2
																	}
																	dot={false}
																	isAnimationActive={
																		false
																	}
																/>
															</LineChart>
														</ResponsiveContainer>
													</div>
													{/* Bin/Location Table */}
													{(() => {
														const filteredBins = (
															sku.bins ?? [
																{
																	bin: "bin 1",
																	lvl: 1,
																	shelf: "First Shelf",
																	warehouse:
																		"Bengaluru",
																	qty:
																		sku.inCompany ??
																		0,
																},
															]
														).filter(
															(bin: any) =>
																bin.qty &&
																bin.qty !== 0,
														);
														if (
															filteredBins.length ===
															0
														)
															return null;
														return (
															<div className="overflow-x-auto">
																<table className="min-w-full text-sm border rounded-lg bg-background">
																	<thead>
																		<tr className="border-b">
																			<th className="px-3 py-2 text-left font-semibold">
																				BIN
																			</th>
																			<th className="px-3 py-2 text-left font-semibold">
																				LVL
																			</th>
																			<th className="px-3 py-2 text-left font-semibold">
																				SHELF
																			</th>
																			<th className="px-3 py-2 text-left font-semibold">
																				WAREHOUSE
																			</th>
																			<th className="px-3 py-2 text-left font-semibold">
																				QTY
																			</th>
																		</tr>
																	</thead>
																	<tbody>
																		{filteredBins.map(
																			(
																				bin: any,
																				idx: number,
																			) => (
																				<tr
																					key={
																						idx
																					}
																					className="border-b hover:bg-muted/40"
																				>
																					<td className="px-3 py-2">
																						{
																							bin.bin
																						}
																					</td>
																					<td className="px-3 py-2">
																						{
																							bin.lvl
																						}
																					</td>
																					<td className="px-3 py-2">
																						{
																							bin.shelf
																						}
																					</td>
																					<td className="px-3 py-2">
																						{
																							bin.warehouse
																						}
																					</td>
																					<td className="px-3 py-2">
																						{
																							bin.qty
																						}
																					</td>
																				</tr>
																			),
																		)}
																	</tbody>
																</table>
															</div>
														);
													})()}
												</div>
											))}
										</div>
									) : (
										<div className="text-xs text-muted-foreground">
											Product details and SKUs go here.
										</div>
									)}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
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
