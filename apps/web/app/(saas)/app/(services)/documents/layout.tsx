import type { ReactNode } from "react";

interface DocumentsLayoutProps {
	children: ReactNode;
}

export default function DocumentsLayout({ children }: DocumentsLayoutProps) {
	return (
		<div className="documents-service">
			<div className="service-header">
				<h1 className="text-2xl font-bold">
					Document & Content Management
				</h1>
				<p className="text-muted-foreground">
					Organize, manage, and control document workflows
				</p>
			</div>
			<div className="service-content">{children}</div>
		</div>
	);
}
