import { cn } from "@repo/ui/utils";
import { ClipboardList, ScanLine, User } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";

const NAV = [
	{ href: "/operator", label: "Tasks", icon: ClipboardList },
	{ href: "/operator/scan", label: "Scan", icon: ScanLine },
	{ href: "/operator/profile", label: "Profile", icon: User },
];

export default function OperatorLayout({ children }: PropsWithChildren) {
	return (
		<div className="flex min-h-dvh flex-col bg-background">
			<header className="sticky top-0 z-20 border-b border-border bg-surface-elevated px-4 py-3">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Operator Mode
						</p>
						<h1 className="text-lg font-semibold">Venti WMS</h1>
					</div>
					<Link
						href="/app/home"
						className="text-xs text-primary underline"
					>
						Admin
					</Link>
				</div>
			</header>

			<main className="flex-1 overflow-auto p-4 pb-24">{children}</main>

			<nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface-elevated">
				<div className="mx-auto grid max-w-lg grid-cols-3">
					{NAV.map(({ href, label, icon: Icon }) => (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex flex-col items-center gap-1 py-3 text-[11px] font-medium text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon className="size-5" />
							{label}
						</Link>
					))}
				</div>
			</nav>
		</div>
	);
}
