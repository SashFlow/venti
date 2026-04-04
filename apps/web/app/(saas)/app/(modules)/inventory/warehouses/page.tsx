export default function WarehousesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Warehouses</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage warehouse facilities and storage locations
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Warehouse Directory
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View and manage all warehouses
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Warehouses
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Storage Optimization
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Optimize storage space utilization
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Optimize Storage
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Warehouse Reports
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Performance and utilization reports
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Reports
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Warehouse Activity</h3>
				<div className="text-sm text-gray-600">
					<p>
						Current warehouse activities and movements will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
