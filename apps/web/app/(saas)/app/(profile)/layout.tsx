import type { ReactNode } from "react";

interface ProfileLayoutProps {
	children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
	return (
		<div className="profile-section">
			<div className="profile-header">
				<h1 className="text-2xl font-bold">Profile</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences
				</p>
			</div>
			<div className="profile-content">{children}</div>
		</div>
	);
}
