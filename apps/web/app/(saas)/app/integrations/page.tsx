import { Plug } from "lucide-react";
import Link from "next/link";

const integrationSubModules = [
	{
		title: "Connected Apps",
		url: "/app/integrations/apps",
		description: "Manage connected third-party applications",
	},
	{
		title: "Webhooks",
		url: "/app/integrations/webhooks",
		description: "Configure webhook endpoints and triggers",
	},
];

export default function IntegrationPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Plug className="h-8 w-8 text-teal-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Integration Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Connect and integrate with external systems and services
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{integrationSubModules.map((module) => (
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
