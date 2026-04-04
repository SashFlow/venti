import type { ReactNode } from "react";

interface HRLayoutProps {
	children: ReactNode;
}

export default function HRLayout({ children }: HRLayoutProps) {
	return (
		<div className="hr-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">
					Human Resource Management System
				</h1>
				<p className="text-muted-foreground">
					Manage your workforce and HR processes efficiently
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
