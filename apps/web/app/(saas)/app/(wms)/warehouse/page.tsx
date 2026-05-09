import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { BoxIcon, PlusIcon } from "lucide-react";

const DATE_TICKS = [
	"07/04",
	"09/04",
	"11/04",
	"13/04",
	"15/04",
	"17/04",
	"19/04",
	"21/04",
	"23/04",
	"25/04",
	"27/04",
	"29/04",
	"01/05",
	"03/05",
	"05/05",
	"07/05",
];

function DashboardPanel({
	title,
	children,
	rightSlot,
	contentClassName,
}: {
	title: string;
	children?: React.ReactNode;
	rightSlot?: React.ReactNode;
	contentClassName?: string;
}) {
	return (
		<Card className="rounded-md">
			<CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
				<CardTitle className="text-xs font-semibold uppercase tracking-wide text-foreground/90">
					{title}
				</CardTitle>
				{rightSlot}
			</CardHeader>
			<CardContent className={contentClassName ?? "p-0"}>
				{children}
			</CardContent>
		</Card>
	);
}

function TimelinePlaceholder() {
	return (
		<>
			<div className="flex h-full flex-col px-6 pb-4 pt-5">
				<div className="h-px w-full bg-border" />
				<div className="mt-auto grid grid-cols-8 gap-2 text-center text-[10px] font-medium text-muted-foreground sm:grid-cols-16">
					{DATE_TICKS.map((tick) => (
						<span key={tick}>{tick}</span>
					))}
				</div>
			</div>
		</>
	);
}

export default function WarehousePage() {
	return (
		<div className="container mx-auto max-w-7xl space-y-3 py-3">
			<div className="grid gap-3 lg:grid-cols-2">
				<DashboardPanel title="Quick Actions" contentClassName="p-0">
					<div className="min-h-[352px]">
						<button
							type="button"
							className="flex w-full items-center gap-3 border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/80 transition-colors hover:bg-muted/40"
						>
							<BoxIcon className="size-4 text-foreground/70" />
							Fulfill Orders
						</button>
						<button
							type="button"
							className="flex w-full items-center gap-3 border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/80 transition-colors hover:bg-muted/40"
						>
							<PlusIcon className="size-4 text-foreground/70" />
							Adjust Inventory
						</button>
					</div>
				</DashboardPanel>

				<DashboardPanel title="Stock Replenishment" contentClassName="p-0">
					<div className="min-h-[352px] px-4 pt-3">
						<div className="grid grid-cols-3 border-b pb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
							<p>Item</p>
							<p>Source</p>
							<p>Inventory</p>
						</div>
					</div>
				</DashboardPanel>
			</div>

			<div className="grid gap-3 lg:grid-cols-2">
				<DashboardPanel
					title="Outbound"
					rightSlot={
						<div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-foreground/85">
							<p>
								Created: <span className="text-blue-500">0</span>
							</p>
							<p>
								Fulfilled: <span className="text-amber-500">0</span>
							</p>
						</div>
					}
					contentClassName="h-[318px] p-0"
				>
					<div className="h-full">
						<TimelinePlaceholder />
					</div>
				</DashboardPanel>

				<DashboardPanel
					title="Inbound"
					rightSlot={
						<div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-foreground/85">
							<p>
								Created: <span className="text-blue-500">0</span>
							</p>
							<p>
								Checked In: <span className="text-amber-500">0</span>
							</p>
						</div>
					}
					contentClassName="h-[318px] p-0"
				>
					<div className="h-full">
						<TimelinePlaceholder />
					</div>
				</DashboardPanel>
			</div>
		</div>
	);
}
