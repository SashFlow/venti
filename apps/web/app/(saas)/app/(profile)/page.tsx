import { User } from "lucide-react";
import Link from "next/link";

const profileSubModules = [
	{
		title: "Settings",
		url: "/app/profile/settings",
		description: "Manage your account settings and preferences",
	},
	{
		title: "Authentication",
		url: "/app/profile/authentication",
		description:
			"Configure security settings and two-factor authentication",
	},
	{
		title: "Activity",
		url: "/app/profile/activity",
		description: "View your recent account activity and login history",
	},
];

export default function ProfilePage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<User className="h-8 w-8 text-cyan-600" />
				<div>
					<h2 className="text-xl font-semibold">Profile Dashboard</h2>
					<p className="text-sm text-muted-foreground">
						Manage your account and personal settings
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{profileSubModules.map((module) => (
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
