import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	BundlesTabContent,
	type ImportField,
	ImportsTabContent,
	InventoryTabContent,
	LotsTabContent,
	SkuTabContent,
} from "./components/tab-contents";

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

function ProductsPage() {
	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Products
				</h1>
			</div>

			<Tabs defaultValue="sku" className="gap-4 flex flex-col">
				<TabsList
					variant="line"
					className="h-auto justify-start gap-2 rounded-none px-0 pb-0"
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

				<SkuTabContent />
				<InventoryTabContent />
				<LotsTabContent />
				<BundlesTabContent />
				<ImportsTabContent importFields={IMPORT_FIELDS} />
			</Tabs>
		</div>
	);
}

export default ProductsPage;
