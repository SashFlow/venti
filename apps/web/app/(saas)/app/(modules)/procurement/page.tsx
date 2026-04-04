import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const procurementSubModules = [
	{
		title: "Vendors",
		url: "/app/procurement/vendors",
		description: "Manage vendor information and relationships",
	},
	{
		title: "Purchase Requisitions",
		url: "/app/procurement/requisitions",
		description: "Create and approve purchase requests",
	},
	{
		title: "Purchase Orders",
		url: "/app/procurement/orders",
		description: "Generate and track purchase orders",
	},
	{
		title: "RFQ / Quotations",
		url: "/app/procurement/rfq",
		description: "Request for quotations and vendor quotes",
	},
	{
		title: "Approvals",
		url: "/app/procurement/approvals",
		description: "Approval workflows for procurement processes",
	},
];

export default function ProcurementPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<ShoppingCart className="h-8 w-8 text-green-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Procurement & Purchase Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Manage your procurement and purchasing operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{procurementSubModules.map((module) => (
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
