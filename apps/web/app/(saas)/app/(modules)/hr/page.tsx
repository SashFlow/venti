import { UserCog } from "lucide-react";
import Link from "next/link";

const hrSubModules = [
	{
		title: "Employees",
		url: "/app/hr/employees",
		description: "Manage employee records and information",
	},
	{
		title: "Payroll",
		url: "/app/hr/payroll",
		description: "Process payroll and salary calculations",
	},
	{
		title: "Attendance",
		url: "/app/hr/attendance",
		description: "Track employee attendance and time logs",
	},
	{
		title: "Recruitment",
		url: "/app/hr/recruitment",
		description: "Manage job postings and candidate applications",
	},
	{
		title: "Performance",
		url: "/app/hr/performance",
		description: "Monitor and evaluate employee performance",
	},
];

export default function HRPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<UserCog className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Human Resource Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your HR operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{hrSubModules.map((module) => (
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
