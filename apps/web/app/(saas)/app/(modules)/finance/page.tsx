import { Calculator } from "lucide-react";
import Link from "next/link";

const financeSubModules = [
	{
		title: "General Ledger",
		url: "/app/finance/gl",
		description: "Manage chart of accounts and general ledger entries",
	},
	{
		title: "Accounts Payable",
		url: "/app/finance/ap",
		description: "Track vendor bills and manage payments",
	},
	{
		title: "Accounts Receivable",
		url: "/app/finance/ar",
		description: "Manage customer invoices and collections",
	},
	{
		title: "Billing & Invoicing",
		url: "/app/finance/billing",
		description: "Create and send invoices to customers",
	},
	{
		title: "Tax Management",
		url: "/app/finance/tax",
		description: "Handle tax calculations and compliance",
	},
	{
		title: "Expenses",
		url: "/app/finance/expenses",
		description: "Track and approve employee expenses",
	},
	{
		title: "Budgeting",
		url: "/app/finance/budgeting",
		description: "Create and monitor budgets",
	},
	{
		title: "Cash & Treasury",
		url: "/app/finance/treasury",
		description: "Manage cash flow and treasury operations",
	},
];

export default function FinancePage() {
	return (
		<div className="space-y-8">
			<div className="flex items-center gap-3">
				<Calculator className="h-8 w-8 text-blue-600" />
				<div>
					<h2 className="text-xl font-semibold">
						Finance & Accounting Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Overview of your financial operations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{financeSubModules.map((module) => (
					<Link
						key={module.url}
						href={module.url}
						className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
					>
						<h3 className="text-lg font-medium mb-2">
							{module.title}
						</h3>
						<p className="text-sm text-gray-600">
							{module.description}
						</p>
					</Link>
				))}
			</div>
		</div>
	);
}
