import { TrendingUp } from "lucide-react";
import Link from "next/link";

const salesSubModules = [
	{
		title: "Quotations",
		url: "/app/sales/quotes",
		description: "Create and manage sales quotations",
	},
	{
		title: "Orders",
		url: "/app/sales/orders",
		description: "Process and track sales orders",
	},
	{
		title: "Pricing & Discounts",
		url: "/app/sales/pricing",
		description: "Manage pricing strategies and discount rules",
	},
	{
		title: "Contracts",
		url: "/app/sales/contracts",
		description: "Handle sales contracts and agreements",
	},
	{
		title: "Order Fulfillment",
		url: "/app/sales/fulfillment",
		description: "Track order fulfillment and delivery",
	},
];

export default function SalesPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<TrendingUp className="h-8 w-8 text-purple-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Sales & Order Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Track your sales performance and order pipeline
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{salesSubModules.map((module) => (
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
