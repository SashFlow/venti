export default function PricingPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Pricing & Discounts</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage product pricing, discount rules and pricing
					strategies
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Price Lists</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage product pricing and price lists
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Manage Pricing
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Discount Rules</h3>
					<p className="text-sm text-gray-600 mb-4">
						Configure discount policies and promotions
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Setup Discounts
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Price Analytics
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Analyze pricing performance and trends
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Analytics
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Active Promotions</h3>
				<div className="text-sm text-gray-600">
					<p>
						Currently active discounts and promotional campaigns
						will appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
