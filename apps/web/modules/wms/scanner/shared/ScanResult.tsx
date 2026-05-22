"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@repo/ui/lib/utils";

interface ScanResultProps {
	type: "success" | "error";
	message: string;
	/** Auto-dismiss after this many milliseconds (default 600) */
	duration?: number;
	onDismiss?: () => void;
}

/**
 * Full-screen flash overlay shown immediately after a scan completes.
 * Colour-codes success (green) vs. error (red) and auto-dismisses.
 */
export function ScanResult({
	type,
	message,
	duration = 600,
	onDismiss,
}: ScanResultProps) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const t = setTimeout(() => {
			setVisible(false);
			onDismiss?.();
		}, duration);
		return () => clearTimeout(t);
	}, [duration, onDismiss]);

	if (!visible) return null;

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in-0",
				type === "success" ? "bg-green-600/90" : "bg-red-600/90",
			)}
		>
			{type === "success" ? (
				<CheckCircle className="w-16 h-16 text-white" />
			) : (
				<XCircle className="w-16 h-16 text-white" />
			)}
			<p className="text-white text-xl font-semibold text-center px-6">
				{message}
			</p>
		</div>
	);
}
