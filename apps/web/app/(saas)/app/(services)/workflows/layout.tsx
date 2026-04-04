import type { ReactNode } from "react";

interface WorkflowsLayoutProps {
	children: ReactNode;
}

export default function WorkflowsLayout({ children }: WorkflowsLayoutProps) {
	return (
		<div className="workflows-service">
			<div className="service-header">
				<h1 className="text-2xl font-bold">Workflows & Automations</h1>
				<p className="text-muted-foreground">
					Design and manage automated business processes
				</p>
			</div>
			<div className="service-content">{children}</div>
		</div>
	);
}
