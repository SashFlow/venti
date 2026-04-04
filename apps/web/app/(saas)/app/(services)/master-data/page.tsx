import { Database } from "lucide-react";
import Link from "next/link";

const masterDataSubModules = [
	{
		title: "Products",
		url: "/app/master-data/products",
		description: "Manage product master data and catalog",
	},
	{
		title: "Customers",
		url: "/app/master-data/customers",
		description: "Customer information and hierarchy management",
	},
	{
		title: "Suppliers",
		url: "/app/master-data/suppliers",
		description: "Vendor and supplier data management",
	},
	{
		title: "Locations",
		url: "/app/master-data/locations",
		description: "Manage business locations and addresses",
	},
	{
		title: "Data Quality",
		url: "/app/master-data/quality",
		description: "Monitor and improve data quality",
	},
];

export default function MasterDataPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Database className="h-8 w-8 text-indigo-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Master Data Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Maintain accurate and consistent business data across
						your organization
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{masterDataSubModules.map((module) => (
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
