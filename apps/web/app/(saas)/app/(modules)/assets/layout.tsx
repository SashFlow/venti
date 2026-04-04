import type { ReactNode } from "react";

interface AssetsLayoutProps {
	children: ReactNode;
}

export default function AssetsLayout({ children }: AssetsLayoutProps) {
	return (
		<div className="assets-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">Asset Management</h1>
				<p className="text-muted-foreground">
					Manage your company assets and equipment
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
