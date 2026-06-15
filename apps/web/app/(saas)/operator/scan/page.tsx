"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { ScanInput } from "@saas/operator/components/ScanInput";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OperatorScanPage() {
	const [lastScan, setLastScan] = useState<string | null>(null);
	const [activePick, setActivePick] = useState<string | null>(null);

	useEffect(() => {
		setActivePick(sessionStorage.getItem("operator.activeWaveId"));
		const stored = sessionStorage.getItem("operator.lastScan");
		if (stored) setLastScan(stored);
	}, []);

	return (
		<div className="space-y-4 max-w-lg mx-auto">
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Scan</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<ScanInput
						onScanMatch={(code) => {
							setLastScan(code);
							sessionStorage.setItem("operator.lastScan", code);
						}}
						placeholder="Scan barcode or SKU…"
					/>
					{lastScan && (
						<p className="text-sm">
							Last scan:{" "}
							<span className="font-mono font-medium">{lastScan}</span>
						</p>
					)}
					{activePick && (
						<p className="text-sm text-muted-foreground">
							Active pick wave:{" "}
							<Link
								href={`/operator/pick/${activePick}`}
								className="text-primary underline"
							>
								Continue picking
							</Link>
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
