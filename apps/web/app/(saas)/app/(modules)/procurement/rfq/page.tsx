export default function RFQPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">RFQ / Quotations</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage request for quotations and vendor responses
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Create RFQ</h3>
					<p className="text-sm text-gray-600 mb-4">
						Send requests for quotations to vendors
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New RFQ
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Pending Quotes</h3>
					<p className="text-sm text-gray-600 mb-4">
						View and compare received quotations
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Review Quotes
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Quote Analysis</h3>
					<p className="text-sm text-gray-600 mb-4">
						Analyze and compare vendor quotations
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Compare Quotes
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Active RFQ Campaigns
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Currently active RFQs and received quotations will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
