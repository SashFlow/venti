import { Code2 } from "lucide-react";
import Link from "next/link";

const apisSubModules = [
	{
		title: "API Explorer",
		url: "/app/apis/explorer",
		description: "Test and explore available APIs",
	},
	{
		title: "API Keys",
		url: "/app/apis/keys",
		description: "Manage API authentication keys",
	},
	{
		title: "Rate Limits",
		url: "/app/apis/rate-limits",
		description: "Configure API rate limiting policies",
	},
	{
		title: "Logs",
		url: "/app/apis/logs",
		description: "Monitor API usage and performance",
	},
];

export default function APIsPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Code2 className="h-8 w-8 text-purple-600" />
				<div>
					<h2 className="text-xl font-semibold">APIs Dashboard</h2>
					<p className="text-sm text-muted-foreground">
						Explore, manage, and monitor your API integrations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{apisSubModules.map((module) => (
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
