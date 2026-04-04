export default function OrdersPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Purchase Orders</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage purchase orders and vendor transactions
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Create PO</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate new purchase orders
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Order
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Pending Deliveries
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track orders awaiting delivery
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Track Orders
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Order History</h3>
					<p className="text-sm text-gray-600 mb-4">
						View completed and cancelled orders
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View History
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Active Purchase Orders
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Currently active purchase orders and their status will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
