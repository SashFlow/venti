import type { ReactNode } from "react";

interface ManufacturingLayoutProps {
	children: ReactNode;
}

export default function ManufacturingLayout({
	children,
}: ManufacturingLayoutProps) {
	return (
		<div className="manufacturing-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">
					Manufacturing & Operations
				</h1>
				<p className="text-muted-foreground">
					Manage your manufacturing operations and production
					processes
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
