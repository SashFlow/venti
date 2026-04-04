export default function BillingPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Billing & Invoicing</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Create and send invoices to customers
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Create Invoice</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate new invoices for customers and services
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Invoice
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Invoice Templates
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage invoice templates and customization
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Templates
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Invoice Status</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track invoice delivery and payment status
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Status
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Recent Invoices</h3>
				<div className="text-sm text-gray-600">
					<p>
						Recently created invoices and their current status will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
