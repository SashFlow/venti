import type { ReactNode } from "react";

interface MasterDataLayoutProps {
	children: ReactNode;
}

export default function MasterDataLayout({ children }: MasterDataLayoutProps) {
	return (
		<div className="master-data-service">
			<div className="service-header">
				<h1 className="text-2xl font-bold">Master Data Management</h1>
				<p className="text-muted-foreground">
					Centralized management of critical business data
				</p>
			</div>
			<div className="service-content">{children}</div>
		</div>
	);
}
