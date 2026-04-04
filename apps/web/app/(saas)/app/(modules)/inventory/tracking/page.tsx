export default function TrackingPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">
					Batch / Serial Tracking
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Track products by batch numbers and serial identifiers
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Batch Management
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create and manage product batches
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Manage Batches
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Serial Tracking
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track individual serial numbers
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Track Serials
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Traceability Reports
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate product traceability reports
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Reports
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Tracking Activity
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recent batch and serial tracking activities will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
