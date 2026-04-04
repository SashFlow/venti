export default function StockPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Stock Overview</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Monitor inventory levels and stock movements
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Current Stock Levels
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View real-time inventory levels
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Stock
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Low Stock Alerts
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Items requiring restocking
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						View Alerts
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Stock Valuation
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Current inventory value assessment
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Valuation
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Stock Movements
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recent inventory transactions and movements will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
