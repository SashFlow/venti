import type { ReactNode } from "react";

interface AuditLayoutProps {
	children: ReactNode;
}

export default function AuditLayout({ children }: AuditLayoutProps) {
	return (
		<div className="audit-service">
			<div className="service-header">
				<h1 className="text-2xl font-bold">Audit</h1>
				<p className="text-muted-foreground">
					Track and monitor system activity and changes
				</p>
			</div>
			<div className="service-content">{children}</div>
		</div>
	);
}
