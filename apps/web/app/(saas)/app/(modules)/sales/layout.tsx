import type { ReactNode } from "react";

interface SalesLayoutProps {
	children: ReactNode;
}

export default function SalesLayout({ children }: SalesLayoutProps) {
	return (
		<div className="sales-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">Sales & Order Management</h1>
				<p className="text-muted-foreground">
					Manage your sales processes and customer orders
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
