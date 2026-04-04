import { Settings } from "lucide-react";
import Link from "next/link";

const configSubModules = [
	{
		title: "Global Settings",
		url: "/app/config/global",
		description: "System-wide configuration settings",
	},
	{
		title: "Module Settings",
		url: "/app/config/modules",
		description: "Configure individual module settings",
	},
	{
		title: "Feature Flags",
		url: "/app/config/features",
		description: "Enable or disable system features",
	},
];

export default function ConfigPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Settings className="h-8 w-8 text-gray-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Configuration Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Manage system settings and configurations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{configSubModules.map((module) => (
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
