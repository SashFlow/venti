export default function TreasuryPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Cash & Treasury</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage cash flow and treasury operations
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Cash Flow</h3>
					<p className="text-sm text-gray-600 mb-4">
						Monitor and forecast cash flow patterns
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Cash Flow
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Bank Accounts</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage bank accounts and reconciliations
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Accounts
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Cash Reports</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate treasury and cash management reports
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Reports
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Cash Position</h3>
				<div className="text-sm text-gray-600">
					<p>
						Current cash balances and treasury position will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
