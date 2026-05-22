"use client";

import { ScanInput } from "@/modules/wms/scanner/shared/ScanInput";
import { ScanResult } from "@/modules/wms/scanner/shared/ScanResult";
import { StepProgress } from "@/modules/wms/scanner/shared/StepProgress";
import { BigButton } from "@/modules/wms/scanner/shared/BigButton";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Package2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Step = "SCAN_BIN" | "SCAN_SKU" | "CONFIRM_QTY";

interface FlashState {
	type: "success" | "error";
	message: string;
}

export default function PickExecutePage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const { waveId } = useParams<{ waveId: string }>();
	const router = useRouter();

	const [step, setStep] = useState<Step>("SCAN_BIN");
	const [scannedBin, setScannedBin] = useState<string | null>(null);
	const [pickedQty, setPickedQty] = useState<number>(0);
	const [flash, setFlash] = useState<FlashState | null>(null);
	const [isShortPick, setIsShortPick] = useState(false);

	const pickListQuery = useQuery({
		...orpc.orders.getPickList.queryOptions({
			input: { organizationId, waveId },
		}),
		enabled: Boolean(organizationId && waveId),
	});

	const confirmMutation = useMutation(
		orpc.orders.confirmPickLine.mutationOptions(),
	);

	const wave = pickListQuery.data?.wave;
	// Current line = first PENDING or IN_PROGRESS line (already sorted by pickSequence)
	const currentLine = wave?.lines.find(
		(l: any) => l.status === "PENDING" || l.status === "IN_PROGRESS",
	);

	const stepLabels = ["Scan Bin", "Scan SKU", "Qty"];
	const stepIndex = step === "SCAN_BIN" ? 0 : step === "SCAN_SKU" ? 1 : 2;

	function showFlash(type: "success" | "error", message: string) {
		setFlash({ type, message });
	}

	function handleScan(barcode: string) {
		if (!currentLine) return;

		if (step === "SCAN_BIN") {
			const expected =
				currentLine.storageUnit?.barcode ??
				currentLine.storageUnit?.code;
			if (!expected || barcode === expected) {
				showFlash(
					"success",
					`Bin confirmed: ${currentLine.storageUnit?.code}`,
				);
				setTimeout(() => {
					setScannedBin(barcode);
					setStep("SCAN_SKU");
					setFlash(null);
				}, 500);
			} else {
				showFlash("error", `Wrong bin. Expected: ${expected}`);
				setTimeout(() => setFlash(null), 800);
			}
		} else if (step === "SCAN_SKU") {
			const sku = currentLine.salesOrderLine.sku;
			if (barcode === sku.gtin || barcode === sku.skuCode) {
				showFlash("success", `SKU confirmed: ${sku.skuCode}`);
				setTimeout(() => {
					setPickedQty(currentLine.qtyToPick);
					setStep("CONFIRM_QTY");
					setFlash(null);
				}, 500);
			} else {
				showFlash("error", `Wrong item. Expected: ${sku.skuCode}`);
				setTimeout(() => setFlash(null), 800);
			}
		}
	}

	async function handleConfirm() {
		if (!currentLine || !organizationId) return;

		try {
			const result = await confirmMutation.mutateAsync({
				organizationId,
				waveId,
				waveLineId: currentLine.id,
				pickedQty: isShortPick ? pickedQty : currentLine.qtyToPick,
				fromStorageUnitId: currentLine.storageUnit?.id ?? "",
				inventoryItemId: currentLine.storageUnit?.id ?? "", // will be resolved server-side
			});

			if (result.waveComplete) {
				toast.success("Wave complete! 🎉");
				router.push("/app/scanner/pick-list");
				return;
			}

			// Advance to next line
			setStep("SCAN_BIN");
			setScannedBin(null);
			setIsShortPick(false);
			setPickedQty(0);
			showFlash("success", "Line picked!");
			setTimeout(() => setFlash(null), 500);
			pickListQuery.refetch();
		} catch (err: any) {
			toast.error(err?.message ?? "Failed to confirm pick");
		}
	}

	if (pickListQuery.isPending) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!wave) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				Wave not found.
			</div>
		);
	}

	if (!currentLine) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
				<CheckCircle2 className="w-16 h-16 text-green-500" />
				<p className="text-xl font-bold">Wave Complete!</p>
				<p className="text-sm text-muted-foreground">
					All {wave.totalLines} lines picked.
				</p>
				<BigButton
					onClick={() => router.push("/app/scanner/pick-list")}
				>
					Back to Waves
				</BigButton>
			</div>
		);
	}

	const sku = currentLine.salesOrderLine.sku;

	return (
		<div className="flex flex-col gap-4 p-4">
			{flash && (
				<ScanResult
					type={flash.type}
					message={flash.message}
					onDismiss={() => setFlash(null)}
				/>
			)}

			{/* Wave progress header */}
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs text-muted-foreground">
						{wave.waveNumber}
					</p>
					<p className="text-sm font-semibold">
						{wave.pickedLines}/{wave.totalLines} lines
					</p>
				</div>
				<div className="text-right">
					<p className="text-xs text-muted-foreground">Bin</p>
					<p className="font-mono font-bold text-sm">
						{currentLine.storageUnit?.code ?? "–"}
					</p>
				</div>
			</div>

			{/* Step progress */}
			<StepProgress steps={stepLabels} currentStep={stepIndex} />

			{/* SKU card */}
			<div className="rounded-xl border bg-card p-4 space-y-2">
				<div className="flex items-center gap-2">
					<Package2 className="w-5 h-5 text-muted-foreground" />
					<span className="font-bold text-sm">{sku.skuCode}</span>
				</div>
				<p className="text-sm text-muted-foreground">{sku.name}</p>
				<p className="text-2xl font-bold">
					{currentLine.qtyToPick}{" "}
					<span className="text-sm font-normal text-muted-foreground">
						to pick
					</span>
				</p>
			</div>

			{/* Step-specific content */}
			{step === "SCAN_BIN" && (
				<div className="space-y-3">
					<p className="text-center text-sm font-medium">
						Scan bin{" "}
						<span className="font-mono bg-muted px-1 rounded">
							{currentLine.storageUnit?.code}
						</span>
					</p>
					<ScanInput onScan={handleScan} />
				</div>
			)}

			{step === "SCAN_SKU" && (
				<div className="space-y-3">
					<p className="text-center text-sm font-medium">
						Now scan item{" "}
						<span className="font-mono bg-muted px-1 rounded">
							{sku.skuCode}
						</span>
					</p>
					<ScanInput onScan={handleScan} />
				</div>
			)}

			{step === "CONFIRM_QTY" && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-card p-4 space-y-3">
						<p className="font-semibold text-sm">
							Confirm Quantity
						</p>
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={() =>
									setPickedQty((q) => Math.max(0, q - 1))
								}
								className="w-12 h-12 rounded-xl bg-muted text-xl font-bold hover:bg-muted/80"
							>
								−
							</button>
							<input
								type="number"
								value={pickedQty}
								min={0}
								max={currentLine.qtyToPick}
								onChange={(e) =>
									setPickedQty(Number(e.target.value))
								}
								className="flex-1 text-center text-3xl font-bold border rounded-xl py-3 bg-background"
							/>
							<button
								type="button"
								onClick={() =>
									setPickedQty((q) =>
										Math.min(currentLine.qtyToPick, q + 1),
									)
								}
								className="w-12 h-12 rounded-xl bg-muted text-xl font-bold hover:bg-muted/80"
							>
								+
							</button>
						</div>
					</div>

					{pickedQty < currentLine.qtyToPick && (
						<div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
							<AlertTriangle className="w-4 h-4 flex-shrink-0" />
							Short pick: {currentLine.qtyToPick - pickedQty}{" "}
							unit(s) missing
						</div>
					)}

					<BigButton
						onClick={handleConfirm}
						disabled={confirmMutation.isPending || pickedQty <= 0}
					>
						{confirmMutation.isPending
							? "Saving…"
							: pickedQty < currentLine.qtyToPick
								? `Confirm Short Pick (${pickedQty}/${currentLine.qtyToPick})`
								: "Confirm Pick ✓"}
					</BigButton>

					<BigButton
						variant="secondary"
						onClick={() => setStep("SCAN_BIN")}
					>
						← Re-scan Bin
					</BigButton>
				</div>
			)}
		</div>
	);
}
