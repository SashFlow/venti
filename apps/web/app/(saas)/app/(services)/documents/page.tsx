import { FileText } from "lucide-react";
import Link from "next/link";

const documentsSubModules = [
	{
		title: "Documents",
		url: "/app/documents/documents",
		description: "Browse and manage all documents",
	},
	{
		title: "Folders",
		url: "/app/documents/folders",
		description: "Organize documents in folder structures",
	},
	{
		title: "Templates",
		url: "/app/documents/templates",
		description: "Create and manage document templates",
	},
	{
		title: "Approvals",
		url: "/app/documents/approvals",
		description: "Handle document approval workflows",
	},
	{
		title: "Archive",
		url: "/app/documents/archive",
		description: "Access archived and historical documents",
	},
];

export default function DocumentsPage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<FileText className="h-8 w-8 text-orange-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Document & Content Management Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Efficiently manage documents, approvals, and content
						workflows
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{documentsSubModules.map((module) => (
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
