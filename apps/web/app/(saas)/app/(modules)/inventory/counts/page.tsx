export default function CountsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Cycle Counts</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage physical inventory counts and reconciliation
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Schedule Count</h3>
					<p className="text-sm text-gray-600 mb-4">
						Plan and schedule cycle counts
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Schedule Count
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Count Execution
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Execute and record count results
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Execute Count
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Count Variances
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Review and resolve count discrepancies
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Review Variances
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Upcoming Counts</h3>
				<div className="text-sm text-gray-600">
					<p>
						Scheduled cycle counts and pending reviews will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
