export default function ForecastingPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Demand Forecasting</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Predict future demand and plan accordingly
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Create Forecast
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate new demand forecasts
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Forecast
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Forecast Models
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage forecasting algorithms and models
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Models
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Forecast Accuracy
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Analyze forecast performance and accuracy
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Accuracy
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Forecast Dashboard</h3>
				<div className="text-sm text-gray-600">
					<p>
						Current demand forecasts and trends will appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
