export default function GeneralLedgerPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">General Ledger</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage chart of accounts and general ledger entries
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Chart of Accounts
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage your account structure and categories
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Manage Accounts
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Journal Entries
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create and manage general ledger journal entries
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						New Entry
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Trial Balance</h3>
					<p className="text-sm text-gray-600 mb-4">
						View trial balance and account summaries
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Report
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Recent Transactions
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recent general ledger transactions will appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
