export default function MaintenancePage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Maintenance</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage equipment maintenance and preventive care
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Maintenance Schedule
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Plan and schedule maintenance activities
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Schedule
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Work Orders</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create and track maintenance work orders
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Orders
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Equipment History
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track maintenance history and performance
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View History
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Upcoming Maintenance
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Scheduled maintenance tasks and overdue items will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
