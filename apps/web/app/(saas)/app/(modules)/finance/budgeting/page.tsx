export default function BudgetingPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Budgeting</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Create and monitor budgets
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Budget Creation
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create new budgets for departments and projects
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Create Budget
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Budget vs Actual
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Compare budgeted amounts to actual spending
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						View Analysis
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Budget Reports</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate budget performance and variance reports
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Reports
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Budget Performance</h3>
				<div className="text-sm text-gray-600">
					<p>
						Current budget performance and variance alerts will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
