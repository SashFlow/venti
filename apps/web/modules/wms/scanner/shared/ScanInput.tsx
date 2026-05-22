"use client";

import { useCallback, useEffect, useRef } from "react";
import { useZxing } from "react-zxing";

interface ScanInputProps {
	onScan: (barcode: string) => void;
	/** When true the camera viewfinder is visible */
	active?: boolean;
}

/**
 * ScanInput renders a camera viewfinder using react-zxing for QR/barcode
 * scanning.  It also listens for keyboard-wedge input so hardware scanners
 * (which emulate a USB/BT keyboard) work without any camera usage.
 */
export function ScanInput({ onScan, active = true }: ScanInputProps) {
	const wedgeBufferRef = useRef("");
	const wedgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const { ref } = useZxing({
		paused: !active,
		onDecodeResult(result) {
			onScan(result.getText());
		},
	});

	// Keyboard-wedge listener: hardware scanners emit characters in rapid
	// succession followed by Enter. Collect them in a buffer and flush on Enter.
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			// Ignore if focus is inside an input/textarea/select
			const tag = (e.target as HTMLElement)?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
				return;

			if (e.key === "Enter") {
				const value = wedgeBufferRef.current.trim();
				if (value.length > 2) {
					onScan(value);
				}
				wedgeBufferRef.current = "";
			} else if (e.key.length === 1) {
				wedgeBufferRef.current += e.key;
				// Reset buffer if no new character arrives within 100 ms
				if (wedgeTimerRef.current) clearTimeout(wedgeTimerRef.current);
				wedgeTimerRef.current = setTimeout(() => {
					wedgeBufferRef.current = "";
				}, 100);
			}
		},
		[onScan],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	if (!active) return null;

	return (
		<div className="relative w-full aspect-video bg-black overflow-hidden rounded-lg">
			{/* biome-ignore lint/suspicious/noExplicitAny: react-zxing ref typing */}
			<video ref={ref as any} className="w-full h-full object-cover" />
			{/* Viewfinder overlay */}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<div className="w-48 h-32 border-2 border-white/80 rounded-lg" />
			</div>
		</div>
	);
}
