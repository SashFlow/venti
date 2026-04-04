export default function QualityPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Quality Control</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage quality inspections and compliance processes
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Quality Inspections
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Perform and record quality inspections
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Inspection
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Quality Standards
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Define and manage quality criteria
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Standards
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Non-Conformance
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Handle quality issues and corrective actions
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Track Issues
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Quality Metrics</h3>
				<div className="text-sm text-gray-600">
					<p>
						Quality performance indicators and trend analysis will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
