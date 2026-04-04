import type { ReactNode } from "react";

interface CRMLayoutProps {
	children: ReactNode;
}

export default function CRMLayout({ children }: CRMLayoutProps) {
	return (
		<div className="crm-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">
					Customer Relationship Management
				</h1>
				<p className="text-muted-foreground">
					Build and maintain strong customer relationships
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
