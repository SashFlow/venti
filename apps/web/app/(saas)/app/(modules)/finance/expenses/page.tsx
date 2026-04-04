export default function ExpensesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Expenses</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Track and approve employee expenses
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Expense Reports
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create and manage employee expense reports
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Report
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Approvals</h3>
					<p className="text-sm text-gray-600 mb-4">
						Review and approve pending expense reports
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Review Pending
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Expense Categories
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage expense categories and policies
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Manage Categories
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Expense Reports
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recent expense submissions and approval status will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
