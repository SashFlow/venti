"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { cn } from "@repo/ui/utils";
import { CheckCircle2, MapPin } from "lucide-react";
import { ScanInput } from "./ScanInput";

export type PickStop = {
	lineId: string;
	sequence: number;
	locationCode: string;
	skuCode: string;
	barcode?: string | null;
	qtyToPick: number;
	qtyPicked: number;
};

export function PickLineCard({
	stop,
	isActive,
	isComplete,
	onConfirm,
	confirming,
}: {
	stop: PickStop;
	isActive: boolean;
	isComplete: boolean;
	onConfirm: (scanCode?: string) => void;
	confirming?: boolean;
}) {
	const remaining = Math.max(0, stop.qtyToPick - stop.qtyPicked);

	return (
		<Card
			className={cn(
				"transition-all",
				isActive && "ring-2 ring-primary border-primary",
				isComplete && "opacity-60",
			)}
		>
			<CardContent className="p-4 space-y-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2">
						<span
							className={cn(
								"flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
								isComplete
									? "bg-green-600 text-white"
									: isActive
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground",
							)}
						>
							{isComplete ? (
								<CheckCircle2 className="size-4" />
							) : (
								stop.sequence
							)}
						</span>
						<div>
							<p className="font-mono font-semibold">{stop.skuCode}</p>
							<p className="text-sm text-muted-foreground flex items-center gap-1">
								<MapPin className="size-3" />
								{stop.locationCode}
							</p>
						</div>
					</div>
					<div className="text-right text-sm">
						<p className="font-medium">
							{stop.qtyPicked} / {stop.qtyToPick}
						</p>
						<p className="text-muted-foreground">picked</p>
					</div>
				</div>

				{isActive && !isComplete && (
					<>
						<ScanInput
							expectedCode={stop.skuCode}
							expectedBarcode={stop.barcode}
							onScanMatch={(code) => onConfirm(code)}
							onScanMismatch={() => {}}
							disabled={confirming}
						/>
						<Button
							className="w-full"
							onClick={() => onConfirm()}
							disabled={confirming || remaining <= 0}
						>
							{confirming ? "Confirming…" : `Confirm pick (${remaining})`}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}
