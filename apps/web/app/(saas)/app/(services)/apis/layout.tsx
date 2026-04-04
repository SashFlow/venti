import type { ReactNode } from "react";

interface APIsLayoutProps {
	children: ReactNode;
}

export default function APIsLayout({ children }: APIsLayoutProps) {
	return (
		<div className="apis-service">
			<div className="service-header">
				<h1 className="text-2xl font-bold">APIs</h1>
				<p className="text-muted-foreground">
					Manage and monitor API integrations and access
				</p>
			</div>
			<div className="service-content">{children}</div>
		</div>
	);
}
