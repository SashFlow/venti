"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
	BundlesTabContent,
	type ImportField,
	ImportsTabContent,
	InventoryTabContent,
	LotsTabContent,
	type SKURow,
	SkuTabContent,
} from "./components/tab-contents";
import { useProductsContext } from "./lib/products-context";

const IMPORT_FIELDS: ImportField[] = [
	{
		column: "Factor",
		description:
			"How many units of this item are consumed (input) or produced (output)",
		required: true,
	},
	{
		column: "Kit Name",
		description:
			"Rows sharing the same Kit Name are grouped into a single kit",
		required: true,
	},
	{
		column: "Output",
		description:
			"TRUE for finished products, FALSE for ingredients consumed by the kit",
		required: true,
	},
	{ column: "Item Barcode", description: "-", required: false },
	{ column: "Kit Description", description: "-", required: false },
	{
		column: "SKU",
		description: "Identifies the item in this row",
		required: false,
	},
];

const ITEMS_PER_PAGE = 20;

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

	const deleteSKUMutation = useMutation(
		orpc.products.delete.mutationOptions(),
	);

	const skus = useMemo<SKURow[]>(() => {
		if (!data?.skus) return [];
		return data.skus.map((sku) => ({
			id: sku.id,
			name: sku.name,
			skuCode: sku.skuCode,
			lifecycle: sku.lifecycle,
		}));
	}, [data?.skus]);

	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, setPage, totalPages]);

	const onDeleteSKU = (sku: SKURow) => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		confirm({
			title: "Delete SKU",
			message: `Delete ${sku.name} (${sku.skuCode})? This action cannot be undone.`,
			destructive: true,
			onConfirm: async () => {
				await deleteSKUMutation.mutateAsync({
					organizationId,
					id: sku.id,
				});

				await invalidateProducts();
				toast.success("SKU deleted.");
			},
		});
	};

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Products
				</h1>
			</div>

			<Tabs defaultValue="sku" className="gap-4 flex flex-col">
				<TabsList
					variant="default"
					className="h-auto w-full justify-start overflow-x-auto"
				>
					<TabsTrigger
						value="sku"
						className="px-3 py-2 text-sm font-medium"
					>
						SKU
					</TabsTrigger>
					<TabsTrigger
						value="inventory"
						className="px-3 py-2 text-sm font-medium"
					>
						Inventory
					</TabsTrigger>
					<TabsTrigger
						value="lots"
						className="px-3 py-2 text-sm font-medium"
					>
						Lots
					</TabsTrigger>
					<TabsTrigger
						value="bundles"
						className="px-3 py-2 text-sm font-medium"
					>
						Bundles
					</TabsTrigger>
					<TabsTrigger
						value="imports"
						className="px-3 py-2 text-sm font-medium"
					>
						Imports
					</TabsTrigger>
				</TabsList>

				<SkuTabContent
					skus={skus}
					isLoading={isPending}
					search={search}
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
					onDelete={onDeleteSKU}
				/>
				<InventoryTabContent />
				<LotsTabContent />
				<BundlesTabContent />
				<ImportsTabContent importFields={IMPORT_FIELDS} />
			</Tabs>
		</div>
	);
}

export default ProductsPage;
