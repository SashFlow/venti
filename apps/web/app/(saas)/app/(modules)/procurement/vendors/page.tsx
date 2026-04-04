export default function VendorsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Vendors</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage supplier relationships and vendor information
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Vendor Directory
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Browse and search all registered vendors
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						View Vendors
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Add New Vendor</h3>
					<p className="text-sm text-gray-600 mb-4">
						Register a new vendor in the system
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Add Vendor
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Vendor Performance
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track vendor performance metrics and ratings
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Reports
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Vendor Activity
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recent vendor registrations and updates will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
