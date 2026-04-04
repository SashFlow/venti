export default function OpportunitiesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Opportunities</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Track sales opportunities and manage the sales pipeline
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Create Opportunity
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Add new sales opportunities
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Opportunity
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Pipeline View</h3>
					<p className="text-sm text-gray-600 mb-4">
						Visualize opportunities through sales stages
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						View Pipeline
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Sales Forecasting
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Forecast sales based on opportunity pipeline
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Forecast
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Hot Opportunities</h3>
				<div className="text-sm text-gray-600">
					<p>
						High-priority opportunities requiring immediate
						attention will appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
