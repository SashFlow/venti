import { Briefcase } from "lucide-react";
import Link from "next/link";

const projectsSubModules = [
	{
		title: "Projects",
		url: "/app/projects/projects",
		description: "Manage and track project progress",
	},
	{
		title: "Tasks",
		url: "/app/projects/tasks",
		description: "Create and assign tasks to team members",
	},
	{
		title: "Resources",
		url: "/app/projects/resources",
		description: "Manage project resources and allocations",
	},
	{
		title: "Field Service",
		url: "/app/projects/field-service",
		description: "Coordinate field service operations",
	},
	{
		title: "Service Contracts",
		url: "/app/projects/contracts",
		description: "Manage service agreements and contracts",
	},
];

export default function ProjectsPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Briefcase className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Project & Service Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your projects and services
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{projectsSubModules.map((module) => (
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
