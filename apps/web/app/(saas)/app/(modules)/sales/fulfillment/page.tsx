export default function FulfillmentPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Order Fulfillment</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage order fulfillment and delivery processes
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Fulfillment Queue
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Process orders ready for fulfillment
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Process Queue
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Shipment Tracking
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track shipments and delivery status
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Track Shipments
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Delivery Performance
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Monitor fulfillment metrics and KPIs
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Metrics
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Today's Shipments</h3>
				<div className="text-sm text-gray-600">
					<p>
						Orders scheduled for shipment today and their status
						will appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
