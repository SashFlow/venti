import { ShieldCheck } from "lucide-react";
import Link from "next/link";

const iamSubModules = [
	{
		title: "Users",
		url: "/app/iam/users",
		description: "Manage user accounts and profiles",
	},
	{
		title: "Roles",
		url: "/app/iam/roles",
		description: "Define and manage user roles",
	},
	{
		title: "Permissions",
		url: "/app/iam/permissions",
		description: "Configure access permissions and policies",
	},
	{
		title: "Groups",
		url: "/app/iam/groups",
		description: "Organize users into groups",
	},
	{
		title: "Identity Providers",
		url: "/app/iam/providers",
		description: "Configure external identity providers",
	},
];

export default function IAMPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<ShieldCheck className="h-8 w-8 text-red-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Identity & Access Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Secure your system with proper identity and access
						controls
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{iamSubModules.map((module) => (
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
