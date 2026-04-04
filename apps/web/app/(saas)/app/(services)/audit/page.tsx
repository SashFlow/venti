import { ClipboardList } from "lucide-react";
import Link from "next/link";

const auditSubModules = [
	{
		title: "Audit Logs",
		url: "/app/audit/logs",
		description: "View comprehensive system audit logs",
	},
	{
		title: "Change History",
		url: "/app/audit/changes",
		description: "Track data changes and modifications",
	},
	{
		title: "Access Logs",
		url: "/app/audit/access",
		description: "Monitor user access and activities",
	},
	{
		title: "Reports",
		url: "/app/audit/reports",
		description: "Generate audit and compliance reports",
	},
];

export default function AuditPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<ClipboardList className="h-8 w-8 text-green-600" />
				<div>
					<h2 className="text-xl font-semibold">Audit Dashboard</h2>
					<p className="text-sm text-muted-foreground">
						Monitor and track all system activities for compliance
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{auditSubModules.map((module) => (
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
