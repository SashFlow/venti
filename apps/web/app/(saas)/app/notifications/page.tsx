import { Bell } from "lucide-react";
import Link from "next/link";

const notificationSubModules = [
	{
		title: "Templates",
		url: "/app/notifications/templates",
		description: "Create and manage notification templates",
	},
	{
		title: "Channels",
		url: "/app/notifications/channels",
		description: "Configure notification delivery channels",
	},
	{
		title: "Logs",
		url: "/app/notifications/logs",
		description: "View notification delivery logs and status",
	},
];

export default function NotificationPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Bell className="h-8 w-8 text-yellow-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Notification System Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Manage system notifications and communication channels
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{notificationSubModules.map((module) => (
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
