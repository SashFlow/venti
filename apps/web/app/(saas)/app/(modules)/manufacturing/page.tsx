import { Factory } from "lucide-react";
import Link from "next/link";

const manufacturingSubModules = [
	{
		title: "Production Planning",
		url: "/app/manufacturing/planning",
		description: "Plan and schedule production activities",
	},
	{
		title: "Work Orders",
		url: "/app/manufacturing/work-orders",
		description: "Create and manage work orders",
	},
	{
		title: "Bill of Materials",
		url: "/app/manufacturing/bom",
		description: "Manage product bills of materials",
	},
	{
		title: "Quality Control",
		url: "/app/manufacturing/quality",
		description: "Monitor quality assurance processes",
	},
	{
		title: "Maintenance",
		url: "/app/manufacturing/maintenance",
		description: "Schedule and track equipment maintenance",
	},
];

export default function ManufacturingPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Factory className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Manufacturing & Operations Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your manufacturing operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{manufacturingSubModules.map((module) => (
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
