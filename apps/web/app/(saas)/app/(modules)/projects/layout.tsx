import type { ReactNode } from "react";

interface ProjectsLayoutProps {
	children: ReactNode;
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
	return (
		<div className="projects-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">Project & Service</h1>
				<p className="text-muted-foreground">
					Manage your projects and service operations
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
