export default function ApprovalsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Approvals</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage procurement approval workflows and authorization
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Pending Approvals
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Review items awaiting your approval
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Review Queue
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Approval Rules</h3>
					<p className="text-sm text-gray-600 mb-4">
						Configure approval workflows and limits
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Rules
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Approval History
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View past approval decisions and audit trail
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View History
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Approval Dashboard</h3>
				<div className="text-sm text-gray-600">
					<p>
						Summary of approval metrics and pending items will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
