import type { ReactNode } from "react";

interface SearchLayoutProps {
	children: ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
	return (
		<div className="search-service">
			<div className="service-header">
				<h1 className="text-2xl font-bold">Search</h1>
				<p className="text-muted-foreground">
					Global search capabilities and index management
				</p>
			</div>
			<div className="service-content">{children}</div>
		</div>
	);
}
