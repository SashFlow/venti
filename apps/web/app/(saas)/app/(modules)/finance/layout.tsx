import type { ReactNode } from "react";

interface FinanceLayoutProps {
	children: ReactNode;
}

export default function FinanceLayout({ children }: FinanceLayoutProps) {
	return (
		<div className="finance-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">Finance & Accounting</h1>
				<p className="text-muted-foreground">
					Manage your financial operations and accounting processes
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
