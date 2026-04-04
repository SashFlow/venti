export default function PlanningPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Supply Planning</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Plan supply chain operations and procurement
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Supply Plan</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create and manage supply plans
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Create Plan
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Supplier Network
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage supplier relationships and capacity
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Network
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Risk Assessment
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Identify and mitigate supply chain risks
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Assess Risks
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Planning Overview</h3>
				<div className="text-sm text-gray-600">
					<p>
						Current supply plans and execution status will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
