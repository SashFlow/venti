export default function TransfersPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Transfers</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage inventory transfers between locations
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Create Transfer
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Initiate new inventory transfers
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Transfer
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Pending Transfers
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track ongoing transfer requests
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Track Transfers
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Transfer History
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View completed transfer records
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View History
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Transfer Queue</h3>
				<div className="text-sm text-gray-600">
					<p>
						Active transfer requests and their status will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
