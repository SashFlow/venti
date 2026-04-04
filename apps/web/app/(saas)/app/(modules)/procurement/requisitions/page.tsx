export default function RequisitionsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Purchase Requisitions</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage purchase requests and requisition approvals
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Create Requisition
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Submit a new purchase requisition
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Requisition
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Pending Approvals
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Review requisitions awaiting approval
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Review & Approve
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						My Requisitions
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track status of submitted requisitions
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Status
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Requisitions
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recently submitted requisitions and status updates will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
