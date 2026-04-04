import { Database } from "lucide-react";
import Link from "next/link";

const searchSubModules = [
	{
		title: "Global Search",
		url: "/app/search/global",
		description: "Search across all data and content",
	},
	{
		title: "Index Management",
		url: "/app/search/index",
		description: "Manage search indexes and configurations",
	},
];

export default function SearchPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Database className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">Search Dashboard</h2>
					<p className="text-sm text-muted-foreground">
						Find and discover information across your organization
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{searchSubModules.map((module) => (
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
