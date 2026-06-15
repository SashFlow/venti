"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/utils";
import { Camera, ScanLine } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type ScanInputProps = {
	expectedCode?: string;
	expectedBarcode?: string | null;
	onScanMatch: (code: string) => void;
	onScanMismatch?: (code: string) => void;
	placeholder?: string;
	disabled?: boolean;
};

function normalize(code: string) {
	return code.trim().toUpperCase();
}

function matchesExpected(
	code: string,
	expectedCode?: string,
	expectedBarcode?: string | null,
) {
	const scan = normalize(code);
	if (!scan) return false;
	if (expectedCode && normalize(expectedCode) === scan) return true;
	if (expectedBarcode && normalize(expectedBarcode) === scan) return true;
	return false;
}

function playBeep() {
	try {
		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.frequency.value = 880;
		gain.gain.value = 0.08;
		osc.start();
		osc.stop(ctx.currentTime + 0.12);
	} catch {
		// audio optional
	}
}

export function ScanInput({
	expectedCode,
	expectedBarcode,
	onScanMatch,
	onScanMismatch,
	placeholder = "Scan or type barcode…",
	disabled,
}: ScanInputProps) {
	const [value, setValue] = useState("");
	const [shake, setShake] = useState(false);
	const [cameraOn, setCameraOn] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const submit = useCallback(
		(raw: string) => {
			const code = raw.trim();
			if (!code) return;

			if (
				expectedCode &&
				!matchesExpected(code, expectedCode, expectedBarcode)
			) {
				setShake(true);
				setTimeout(() => setShake(false), 500);
				if (typeof navigator !== "undefined" && navigator.vibrate) {
					navigator.vibrate([80, 40, 80]);
				}
				onScanMismatch?.(code);
				return;
			}

			playBeep();
			if (typeof navigator !== "undefined" && navigator.vibrate) {
				navigator.vibrate(50);
			}
			onScanMatch(code);
			setValue("");
		},
		[expectedCode, expectedBarcode, onScanMatch, onScanMismatch],
	);

	const toggleCamera = async () => {
		if (cameraOn) {
			const stream = videoRef.current?.srcObject as MediaStream | null;
			stream?.getTracks().forEach((t) => t.stop());
			setCameraOn(false);
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
			setCameraOn(true);
		} catch {
			inputRef.current?.focus();
		}
	};

	return (
		<div className="space-y-2">
			<div
				className={cn(
					"flex gap-2",
					shake && "animate-[shake_0.4s_ease-in-out]",
				)}
			>
				<div className="relative flex-1">
					<ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						ref={inputRef}
						value={value}
						onChange={(e) => setValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								submit(value);
							}
						}}
						placeholder={placeholder}
						disabled={disabled}
						className="pl-9 font-mono"
						autoComplete="off"
						inputMode="text"
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={toggleCamera}
					disabled={disabled}
					title="Camera scan stub"
				>
					<Camera className="size-4" />
				</Button>
				<Button
					type="button"
					onClick={() => submit(value)}
					disabled={disabled || !value.trim()}
				>
					Scan
				</Button>
			</div>
			{cameraOn && (
				<div className="rounded-lg border overflow-hidden bg-black/90">
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted
						className="w-full max-h-32 object-cover"
					/>
					<p className="text-[10px] text-center text-muted-foreground py-1 px-2">
						Camera preview — use hardware wedge or type barcode above
					</p>
				</div>
			)}
			<style jsx global>{`
				@keyframes shake {
					0%,
					100% {
						transform: translateX(0);
					}
					20%,
					60% {
						transform: translateX(-6px);
					}
					40%,
					80% {
						transform: translateX(6px);
					}
				}
			`}</style>
		</div>
	);
}
