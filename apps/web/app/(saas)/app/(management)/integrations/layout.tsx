import type { ReactNode } from "react";

interface IntegrationLayoutProps {
	children: ReactNode;
}

export default function IntegrationLayout({
	children,
}: IntegrationLayoutProps) {
	return (
		<div className="integration-system">
			<div className="system-header">
				<h1 className="text-2xl font-bold">Integration Management</h1>
				<p className="text-muted-foreground">
					Connect with external applications and manage data flows
				</p>
			</div>
			<div className="system-content">{children}</div>
		</div>
	);
}
