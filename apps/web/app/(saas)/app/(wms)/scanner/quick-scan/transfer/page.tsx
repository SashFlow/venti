"use client";

import { ScanInput } from "@/modules/wms/scanner/shared/ScanInput";
import { ScanResult } from "@/modules/wms/scanner/shared/ScanResult";
import { StepProgress } from "@/modules/wms/scanner/shared/StepProgress";
import { BigButton } from "@/modules/wms/scanner/shared/BigButton";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Step = "SCAN_ITEM" | "ENTER_QTY" | "CONFIRM";

interface FlashState {
	type: "success" | "error";
	message: string;
}

export default function TransferPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const router = useRouter();
	const searchParams = useSearchParams();
	const warehouseId = searchParams.get("warehouseId") ?? "";
	const initialBarcode = searchParams.get("barcode") ?? "";

	const [step, setStep] = useState<Step>(
		initialBarcode ? "ENTER_QTY" : "SCAN_ITEM",
	);
	const [scannedBarcode, setScannedBarcode] = useState(initialBarcode);
	const [transferOrderId, setTransferOrderId] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [flash, setFlash] = useState<FlashState | null>(null);

	const transferPickMutation = useMutation(
		orpc.warehouse.scanner.confirmTransferPick.mutationOptions(),
	);

	function handleScan(barcode: string) {
		setScannedBarcode(barcode);
		setStep("ENTER_QTY");
	}

	async function handleConfirm() {
		try {
			await transferPickMutation.mutateAsync({
				organizationId,
				warehouseId,
				barcode: scannedBarcode,
				transferOrderId,
				quantity,
			});
			setFlash({ type: "success", message: "Transfer pick confirmed!" });
			setTimeout(() => {
				router.push(
					`/app/scanner/quick-scan?warehouseId=${warehouseId}`,
				);
			}, 700);
		} catch (err: any) {
			toast.error(err?.message ?? "Transfer failed");
		}
	}

	const stepLabels = ["Scan Item", "Qty", "Confirm"];
	const stepIndex = step === "SCAN_ITEM" ? 0 : step === "ENTER_QTY" ? 1 : 2;

	return (
		<div className="flex flex-col gap-4 p-4">
			{flash && (
				<ScanResult
					type={flash.type}
					message={flash.message}
					onDismiss={() => setFlash(null)}
				/>
			)}

			<h1 className="text-xl font-bold">Transfer Pick</h1>
			<StepProgress steps={stepLabels} currentStep={stepIndex} />

			{step === "SCAN_ITEM" && (
				<div className="space-y-3">
					<p className="text-sm text-center text-muted-foreground">
						Scan item to transfer
					</p>
					<ScanInput onScan={handleScan} />
				</div>
			)}

			{step === "ENTER_QTY" && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-card p-3">
						<p className="text-xs text-muted-foreground">Scanned</p>
						<p className="font-mono font-bold text-sm">
							{scannedBarcode}
						</p>
					</div>

					<div className="rounded-xl border bg-card p-3">
						<label className="text-xs text-muted-foreground">
							Transfer Order ID (optional)
						</label>
						<input
							type="text"
							value={transferOrderId}
							onChange={(e) => setTransferOrderId(e.target.value)}
							placeholder="TO-XXXX"
							className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background"
						/>
					</div>

					<div className="rounded-xl border bg-card p-4 space-y-3">
						<p className="font-semibold text-sm">Quantity</p>
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={() =>
									setQuantity((q) => Math.max(1, q - 1))
								}
								className="w-12 h-12 rounded-xl bg-muted text-xl font-bold"
							>
								−
							</button>
							<input
								type="number"
								value={quantity}
								min={1}
								onChange={(e) =>
									setQuantity(Number(e.target.value))
								}
								className="flex-1 text-center text-3xl font-bold border rounded-xl py-3 bg-background"
							/>
							<button
								type="button"
								onClick={() => setQuantity((q) => q + 1)}
								className="w-12 h-12 rounded-xl bg-muted text-xl font-bold"
							>
								+
							</button>
						</div>
					</div>

					<BigButton onClick={() => setStep("CONFIRM")}>
						Review →
					</BigButton>
				</div>
			)}

			{step === "CONFIRM" && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Item barcode
							</span>
							<span className="font-mono font-bold">
								{scannedBarcode}
							</span>
						</div>
						{transferOrderId && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									Transfer Order
								</span>
								<span className="font-bold">
									{transferOrderId}
								</span>
							</div>
						)}
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Quantity
							</span>
							<span className="font-bold">{quantity}</span>
						</div>
					</div>

					<BigButton
						onClick={handleConfirm}
						disabled={transferPickMutation.isPending}
					>
						{transferPickMutation.isPending
							? "Confirming…"
							: "Confirm Transfer Pick ✓"}
					</BigButton>

					<BigButton
						variant="secondary"
						onClick={() => setStep("ENTER_QTY")}
					>
						← Edit
					</BigButton>
				</div>
			)}
		</div>
	);
}
