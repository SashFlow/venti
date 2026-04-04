import type { ReactNode } from "react";

interface SCMLayoutProps {
	children: ReactNode;
}

export default function SCMLayout({ children }: SCMLayoutProps) {
	return (
		<div className="scm-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">Supply Chain</h1>
				<p className="text-muted-foreground">
					Manage your supply chain operations and logistics
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
