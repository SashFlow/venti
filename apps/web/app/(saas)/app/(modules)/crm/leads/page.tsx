export default function LeadsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Leads</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage potential customers and lead generation activities
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">New Lead</h3>
					<p className="text-sm text-gray-600 mb-4">
						Add new leads to the system
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Add Lead
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Lead Scoring</h3>
					<p className="text-sm text-gray-600 mb-4">
						View lead scores and qualification status
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Score Leads
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Lead Conversion
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Convert qualified leads to opportunities
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Convert Leads
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Lead Activity
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recently added leads and their current status will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
