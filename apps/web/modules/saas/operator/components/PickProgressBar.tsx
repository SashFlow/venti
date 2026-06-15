"use client";

import { Progress } from "@repo/ui/progress";

export function PickProgressBar({
	completed,
	total,
	percent,
}: {
	completed: number;
	total: number;
	percent: number;
}) {
	return (
		<div className="space-y-2">
			<div className="flex justify-between text-sm">
				<span className="text-muted-foreground">Pick progress</span>
				<span className="font-medium">
					{completed} / {total} lines ({percent}%)
				</span>
			</div>
			<Progress value={percent} className="h-2" />
		</div>
	);
}
