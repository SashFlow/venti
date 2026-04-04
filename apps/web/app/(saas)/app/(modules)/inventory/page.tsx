import { Boxes } from "lucide-react";
import Link from "next/link";

const inventorySubModules = [
	{
		title: "Stock Overview",
		url: "/app/inventory/stock",
		description: "View current stock levels and inventory status",
	},
	{
		title: "Warehouses",
		url: "/app/inventory/warehouses",
		description: "Manage warehouse locations and storage",
	},
	{
		title: "Transfers",
		url: "/app/inventory/transfers",
		description: "Track inventory transfers between locations",
	},
	{
		title: "Batch / Serial Tracking",
		url: "/app/inventory/tracking",
		description: "Track inventory by batch and serial numbers",
	},
	{
		title: "Cycle Counts",
		url: "/app/inventory/counts",
		description: "Perform inventory cycle counting",
	},
];

export default function InventoryPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Boxes className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Inventory & Warehouse Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your inventory operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{inventorySubModules.map((module) => (
					<Link
						key={module.url}
						href={module.url}
						className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
					>
						<h3 className="text-lg font-medium mb-2">
							{module.title}
						</h3>
						<p className="text-sm text-gray-600">
							{module.description}
						</p>
					</Link>
				))}
			</div>
		</div>
	);
}
