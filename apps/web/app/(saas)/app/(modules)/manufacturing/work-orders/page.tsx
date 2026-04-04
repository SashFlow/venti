export default function WorkOrdersPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Work Orders</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Create and manage manufacturing work orders
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Create Work Order
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate new work orders for production
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Work Order
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Active Orders</h3>
					<p className="text-sm text-gray-600 mb-4">
						Monitor progress of active work orders
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Track Progress
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Work Order History
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View completed and archived work orders
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View History
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Work Order Queue</h3>
				<div className="text-sm text-gray-600">
					<p>
						Upcoming work orders and production priorities will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
