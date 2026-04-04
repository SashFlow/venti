import { Users } from "lucide-react";
import Link from "next/link";

const crmSubModules = [
	{
		title: "Leads",
		url: "/app/crm/leads",
		description: "Manage and track potential customers",
	},
	{
		title: "Opportunities",
		url: "/app/crm/opportunities",
		description: "Track sales opportunities and deals",
	},
	{
		title: "Customers",
		url: "/app/crm/customers",
		description: "Manage customer information and interactions",
	},
	{
		title: "Activities",
		url: "/app/crm/activities",
		description: "Log and schedule customer activities",
	},
	{
		title: "Support Tickets",
		url: "/app/crm/tickets",
		description: "Handle customer support requests",
	},
];

export default function CRMPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Users className="h-8 w-8 text-indigo-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Customer Relationship Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Manage your customer relationships and sales pipeline
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{crmSubModules.map((module) => (
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
