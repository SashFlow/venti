"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
	Loader2Icon,
	MoreVerticalIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImportProductsDialog } from "./components/ImportProductsDialog";
import { useProductsContext } from "./lib/products-context";

const ITEMS_PER_PAGE = 20;

function ProductsPage() {
	const { organizationId, search, setSearch, page, setPage } =
		useProductsContext();

	const [isImportOpen, setIsImportOpen] = useState(false);
	const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
		new Set(),
	);
	const [expandedSkuIds, setExpandedSkuIds] = useState<Set<string>>(
		new Set(),
	);
	const [productToDelete, setProductToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const queryClient = useQueryClient();

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

	const deleteMutation = useMutation(orpc.products.delete.mutationOptions());

	const products = data?.products ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

	const toggleProductExpansion = (id: string) => {
		const newSet = new Set(expandedProductIds);
		if (newSet.has(id)) newSet.delete(id);
		else newSet.add(id);
		setExpandedProductIds(newSet);
	};

	const toggleSkuExpansion = (id: string) => {
		const newSet = new Set(expandedSkuIds);
		if (newSet.has(id)) newSet.delete(id);
		else newSet.add(id);
		setExpandedSkuIds(newSet);
	};

	const handleDelete = async () => {
		if (!organizationId || !productToDelete) return;
		try {
			await deleteMutation.mutateAsync({
				organizationId,
				id: productToDelete.id,
			});
			toast.success("Product deleted successfully");
			queryClient.invalidateQueries({
				queryKey: orpc.products.list.key(),
			});
		} catch (error) {
			toast.error("Failed to delete product");
		} finally {
			setProductToDelete(null);
		}
	};

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
								<TableHead className="w-10" />
								<TableHead>Name</TableHead>
								<TableHead>Tags</TableHead>
								<TableHead>Variants (SKUs)</TableHead>
								<TableHead className="w-14" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending && (
								<TableRow>
									<TableCell
										colSpan={5}
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
										colSpan={5}
										className="h-14 text-center text-muted-foreground"
									>
										No products found.
									</TableCell>
								</TableRow>
							)}
							{products.map((product) => (
								<React.Fragment key={product.id}>
									<TableRow className="group">
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() =>
													toggleProductExpansion(
														product.id,
													)
												}
											>
												{expandedProductIds.has(
													product.id,
												) ? (
													<ChevronDownIcon className="h-4 w-4" />
												) : (
													<ChevronRightIcon className="h-4 w-4" />
												)}
											</Button>
										</TableCell>
										<TableCell className="font-medium">
											{product.name}
										</TableCell>
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
										<TableCell className="text-sm text-muted-foreground">
											{product.skus?.length || 0} SKU(s)
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 opacity-0 group-hover:opacity-100"
													>
														<MoreVerticalIcon className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem asChild>
														<Link
															href={`/app/products/${product.id}/edit`}
														>
															<PencilIcon className="mr-2 h-4 w-4" />
															Edit
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onClick={() =>
															setProductToDelete({
																id: product.id,
																name: product.name,
															})
														}
													>
														<TrashIcon className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
									{expandedProductIds.has(product.id) && (
										<TableRow className="bg-muted/30">
											<TableCell
												colSpan={5}
												className="p-0"
											>
												<div className="pl-14 pr-6 py-4">
													{product.skus &&
													product.skus.length > 0 ? (
														<div className="rounded-md border bg-card overflow-hidden">
															<Table>
																<TableHeader className="bg-muted/50">
																	<TableRow>
																		<TableHead className="w-10" />
																		<TableHead>
																			SKU
																			Code
																		</TableHead>
																		<TableHead className="text-right">
																			Price
																		</TableHead>
																		<TableHead className="text-right">
																			Quantity
																		</TableHead>
																	</TableRow>
																</TableHeader>
																<TableBody>
																	{product.skus.map(
																		(
																			sku: any,
																		) => {
																			const totalQty =
																				sku.balances?.reduce(
																					(
																						acc: number,
																						bal: any,
																					) =>
																						acc +
																						Number(
																							bal.quantityAvailable ||
																								0,
																						),
																					0,
																				) ||
																				0;
																			const hasMetadataOrDimensions =
																				sku.metadata ||
																				sku.length ||
																				sku.width ||
																				sku.height ||
																				sku.weight;

																			return (
																				<React.Fragment
																					key={
																						sku.id
																					}
																				>
																					<TableRow>
																						<TableCell>
																							<Button
																								variant="ghost"
																								size="icon"
																								className="h-6 w-6"
																								onClick={() =>
																									toggleSkuExpansion(
																										sku.id,
																									)
																								}
																								disabled={
																									!hasMetadataOrDimensions
																								}
																							>
																								{expandedSkuIds.has(
																									sku.id,
																								) ? (
																									<ChevronDownIcon className="h-4 w-4" />
																								) : (
																									<ChevronRightIcon className="h-4 w-4" />
																								)}
																							</Button>
																						</TableCell>
																						<TableCell className="font-mono text-xs">
																							{
																								sku.code
																							}
																						</TableCell>
																						<TableCell className="text-right">
																							{sku.unitPrice
																								? `$${Number(sku.unitPrice).toFixed(2)}`
																								: "-"}
																						</TableCell>
																						<TableCell className="text-right font-medium">
																							{
																								totalQty
																							}
																						</TableCell>
																					</TableRow>
																					{expandedSkuIds.has(
																						sku.id,
																					) && (
																						<TableRow className="bg-muted/10">
																							<TableCell
																								colSpan={
																									4
																								}
																								className="p-0"
																							>
																								<div className="pl-14 py-3 pr-4 text-xs">
																									<div className="grid grid-cols-2 gap-4">
																										{/* Dimensions */}
																										<div>
																											<p className="font-semibold text-muted-foreground mb-1 uppercase text-[10px]">
																												Dimensions
																											</p>
																											<div className="space-y-1">
																												{sku.length ||
																												sku.width ||
																												sku.height ? (
																													<p>
																														{Number(
																															sku.length ||
																																0,
																														)}{" "}
																														x{" "}
																														{Number(
																															sku.width ||
																																0,
																														)}{" "}
																														x{" "}
																														{Number(
																															sku.height ||
																																0,
																														)}{" "}
																														(L
																														x
																														W
																														x
																														H)
																													</p>
																												) : (
																													<p className="text-muted-foreground">
																														Not
																														specified
																													</p>
																												)}
																												{sku.weight && (
																													<p>
																														Weight:{" "}
																														{Number(
																															sku.weight,
																														)}
																													</p>
																												)}
																											</div>
																										</div>
																										{/* Metadata */}
																										<div>
																											<p className="font-semibold text-muted-foreground mb-1 uppercase text-[10px]">
																												Properties
																											</p>
																											{sku.metadata &&
																											Object.keys(
																												sku.metadata,
																											)
																												.length >
																												0 ? (
																												<ul className="space-y-1">
																													{Object.entries(
																														sku.metadata,
																													).map(
																														([
																															key,
																															val,
																														]) => (
																															<li
																																key={
																																	key
																																}
																															>
																																<span className="text-muted-foreground">
																																	{
																																		key
																																	}
																																	:
																																</span>{" "}
																																{String(
																																	val,
																																)}
																															</li>
																														),
																													)}
																												</ul>
																											) : (
																												<p className="text-muted-foreground">
																													No
																													properties
																												</p>
																											)}
																										</div>
																									</div>
																								</div>
																							</TableCell>
																						</TableRow>
																					)}
																				</React.Fragment>
																			);
																		},
																	)}
																</TableBody>
															</Table>
														</div>
													) : (
														<p className="text-sm text-muted-foreground">
															No SKUs configured
															for this product.
														</p>
													)}
												</div>
											</TableCell>
										</TableRow>
									)}
								</React.Fragment>
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

			<AlertDialog
				open={!!productToDelete}
				onOpenChange={(open) => !open && setProductToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the product{" "}
							<strong>{productToDelete?.name}</strong> and all its
							SKUs. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90"
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && (
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
							)}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

export default ProductsPage;
