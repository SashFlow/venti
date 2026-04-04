import type { ReactNode } from "react";

interface ProcurementLayoutProps {
	children: ReactNode;
}

export default function ProcurementLayout({
	children,
}: ProcurementLayoutProps) {
	return (
		<div className="procurement-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">
					Procurement & Purchase Management
				</h1>
				<p className="text-muted-foreground">
					Streamline your procurement processes and vendor management
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
