import { Boxes } from "lucide-react";
import Link from "next/link";

const assetsSubModules = [
	{
		title: "Asset Register",
		url: "/app/assets/register",
		description: "Maintain comprehensive asset registry",
	},
	{
		title: "Fixed Assets",
		url: "/app/assets/fixed",
		description: "Manage fixed asset inventory",
	},
	{
		title: "Depreciation",
		url: "/app/assets/depreciation",
		description: "Calculate and track asset depreciation",
	},
	{
		title: "Maintenance Schedule",
		url: "/app/assets/maintenance",
		description: "Schedule and track asset maintenance",
	},
	{
		title: "Asset Disposal",
		url: "/app/assets/disposal",
		description: "Manage asset disposal and retirement",
	},
];

export default function AssetsPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Boxes className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Asset Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your asset operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{assetsSubModules.map((module) => (
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
