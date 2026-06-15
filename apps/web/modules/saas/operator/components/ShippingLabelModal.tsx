"use client";

import { Button } from "@repo/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/dialog";
import { Package } from "lucide-react";

export function ShippingLabelModal({
	open,
	onOpenChange,
	waveId,
	waveNumber,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	waveId: string;
	waveNumber: string;
}) {
	const tracking = `VTI-${waveId.slice(0, 8).toUpperCase()}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Shipping label (preview)</DialogTitle>
				</DialogHeader>
				<div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3 bg-muted/30">
					<Package className="size-10 mx-auto text-muted-foreground" />
					<p className="font-mono text-lg font-bold">{tracking}</p>
					<p className="text-sm text-muted-foreground">{waveNumber}</p>
					<div className="h-12 bg-[repeating-linear-gradient(90deg,#000_0_2px,#fff_2px_4px)] rounded" />
					<p className="text-xs text-muted-foreground">
						Placeholder — connect Zebra/Brother in org settings
					</p>
				</div>
				<Button variant="outline" className="w-full" onClick={() => window.print()}>
					Print preview
				</Button>
			</DialogContent>
		</Dialog>
	);
}
