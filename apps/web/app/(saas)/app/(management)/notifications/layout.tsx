import type { ReactNode } from "react";

interface NotificationLayoutProps {
	children: ReactNode;
}

export default function NotificationLayout({
	children,
}: NotificationLayoutProps) {
	return (
		<div className="notification-system">
			<div className="system-header">
				<h1 className="text-2xl font-bold">Notification System</h1>
				<p className="text-muted-foreground">
					Manage notification templates, channels, and delivery logs
				</p>
			</div>
			<div className="system-content">{children}</div>
		</div>
	);
}
