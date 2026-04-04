export default function CustomersPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Customers</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage customer information and relationship history
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Customer Directory
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Browse and search customer database
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Customers
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Customer Segmentation
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Segment customers by criteria and behavior
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Segments
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Customer Health
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Monitor customer satisfaction and retention
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Health Dashboard
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Customer Interactions
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recent customer interactions and communications will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
