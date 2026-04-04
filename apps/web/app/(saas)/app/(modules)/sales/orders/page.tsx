export default function OrdersPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Orders</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage customer sales orders and order processing
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Create Order</h3>
					<p className="text-sm text-gray-600 mb-4">
						Process new customer orders
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Order
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Order Processing
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track orders through fulfillment pipeline
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Process Orders
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Order Analytics
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View order trends and performance metrics
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Analytics
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Active Sales Orders
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Currently processing sales orders and their status will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
