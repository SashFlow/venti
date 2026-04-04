export default function ContractsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Contracts</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage sales contracts and customer agreements
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Create Contract
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Draft new customer contracts
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Contract
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Contract Templates
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage contract templates and clauses
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Templates
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Contract Renewals
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track contract renewals and expirations
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Renewals
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Active Contracts</h3>
				<div className="text-sm text-gray-600">
					<p>
						Currently active customer contracts and their status
						will appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
