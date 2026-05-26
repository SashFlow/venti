import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/tooltip";
import type { ReactNode } from "react";

export function Tip({
	children,
	label,
	side = "top",
}: {
	children: ReactNode;
	label: ReactNode;
	side?: "top" | "right" | "bottom" | "left";
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side}>{label}</TooltipContent>
		</Tooltip>
	);
}
