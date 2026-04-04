import type { ReactNode } from "react";

interface AnalyticsLayoutProps {
	children: ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
	return (
		<div className="analytics-module">
			<div className="module-header">
				<h1 className="text-2xl font-bold">Analytics & BI</h1>
				<p className="text-muted-foreground">
					Analyze your business data and generate insights
				</p>
			</div>
			<div className="module-content">{children}</div>
		</div>
	);
}
