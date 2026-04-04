import { GitBranch } from "lucide-react";
import Link from "next/link";

const workflowsSubModules = [
	{
		title: "Workflows",
		url: "/app/workflows/workflows",
		description: "Design and manage business workflows",
	},
	{
		title: "Triggers",
		url: "/app/workflows/triggers",
		description: "Configure workflow triggers and events",
	},
	{
		title: "Actions",
		url: "/app/workflows/actions",
		description: "Define workflow actions and steps",
	},
	{
		title: "Templates",
		url: "/app/workflows/templates",
		description: "Use pre-built workflow templates",
	},
	{
		title: "Logs",
		url: "/app/workflows/logs",
		description: "Monitor workflow execution and history",
	},
];

export default function WorkflowsPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<GitBranch className="h-8 w-8 text-emerald-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Workflows & Automations Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Automate business processes and streamline operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{workflowsSubModules.map((module) => (
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
