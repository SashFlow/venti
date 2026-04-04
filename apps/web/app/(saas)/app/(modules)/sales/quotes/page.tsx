export default function QuotesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Quotations</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Create and manage customer quotations and proposals
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Create Quote</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate new customer quotations
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Quote
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Pending Quotes</h3>
					<p className="text-sm text-gray-600 mb-4">
						Review quotes awaiting customer response
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Follow Up
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Quote Templates
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage quotation templates and formats
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Manage Templates
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Recent Quotations</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recently created quotations and their status will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
