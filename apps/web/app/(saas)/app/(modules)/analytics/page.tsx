import { TrendingUp } from "lucide-react";
import Link from "next/link";

const analyticsSubModules = [
	{
		title: "Dashboards",
		url: "/app/analytics/dashboards",
		description: "Create and view interactive dashboards",
	},
	{
		title: "Reports",
		url: "/app/analytics/reports",
		description: "Generate and manage business reports",
	},
	{
		title: "Data Explorer",
		url: "/app/analytics/explorer",
		description: "Explore and analyze your data",
	},
	{
		title: "KPIs",
		url: "/app/analytics/kpis",
		description: "Track key performance indicators",
	},
];

export default function AnalyticsPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<TrendingUp className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Analytics & BI Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your business analytics
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{analyticsSubModules.map((module) => (
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
