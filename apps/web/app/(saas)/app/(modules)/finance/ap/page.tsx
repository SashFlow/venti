export default function AccountsPayablePage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Accounts Payable</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Track vendor bills and manage payments
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Vendor Bills</h3>
					<p className="text-sm text-gray-600 mb-4">
						Record and manage vendor invoices and bills
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Record Bill
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Payments</h3>
					<p className="text-sm text-gray-600 mb-4">
						Process vendor payments and track payment status
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Make Payment
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Aging Reports</h3>
					<p className="text-sm text-gray-600 mb-4">
						View outstanding bills and payment aging analysis
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Report
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Pending Bills</h3>
				<div className="text-sm text-gray-600">
					<p>
						Outstanding vendor bills and payment due dates will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
