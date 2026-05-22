import type { ReactNode } from "react";

/**
 * Scanner layout: full-screen mobile-first layout without the normal sidebar.
 * Renders a thin header bar, then fills the remaining viewport with `children`.
 */
export default function ScannerLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			<header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
				<a
					href="/app/home"
					className="text-muted-foreground hover:text-foreground transition-colors text-sm"
				>
					← Home
				</a>
				<span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground ml-auto">
					Scanner
				</span>
			</header>
			<main className="flex-1 flex flex-col">{children}</main>
		</div>
	);
}
