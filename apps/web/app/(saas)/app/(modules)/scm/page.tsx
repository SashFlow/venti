import { TrendingUp } from "lucide-react";
import Link from "next/link";

const scmSubModules = [
	{
		title: "Demand Forecasting",
		url: "/app/scm/forecasting",
		description: "Predict and analyze demand patterns",
	},
	{
		title: "Supply Planning",
		url: "/app/scm/planning",
		description: "Plan supply chain operations and logistics",
	},
	{
		title: "Logistics",
		url: "/app/scm/logistics",
		description: "Manage shipping and logistics operations",
	},
	{
		title: "Returns",
		url: "/app/scm/returns",
		description: "Handle product returns and reverse logistics",
	},
];

export default function SCMPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<TrendingUp className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Supply Chain Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your supply chain operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{scmSubModules.map((module) => (
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
