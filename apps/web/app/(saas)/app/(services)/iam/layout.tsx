import type { ReactNode } from "react";

interface IAMLayoutProps {
	children: ReactNode;
}

export default function IAMLayout({ children }: IAMLayoutProps) {
	return (
		<div className="iam-service">
			<div className="service-header">
				<h1 className="text-2xl font-bold">
					Identity & Access Management
				</h1>
				<p className="text-muted-foreground">
					Manage user identities, roles, and access permissions
				</p>
			</div>
			<div className="service-content">{children}</div>
		</div>
	);
}
