export default function PlanningPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Production Planning</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Plan and schedule manufacturing operations and resources
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Production Schedule
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create and manage production schedules
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Schedule
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Capacity Planning
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Plan resource capacity and allocation
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Plan Capacity
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Material Planning
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Plan material requirements and procurement
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						MRP Analysis
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Production Overview
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Current production status and upcoming schedules will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
