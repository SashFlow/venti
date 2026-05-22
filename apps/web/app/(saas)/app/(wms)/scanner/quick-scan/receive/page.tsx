"use client";

import { ScanInput } from "@/modules/wms/scanner/shared/ScanInput";
import { ScanResult } from "@/modules/wms/scanner/shared/ScanResult";
import { StepProgress } from "@/modules/wms/scanner/shared/StepProgress";
import { BigButton } from "@/modules/wms/scanner/shared/BigButton";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Step =
	| "SCAN_ITEM"
	| "VALIDATE"
	| "ENTER_QTY"
	| "CONFIRM_RECEIPT"
	| "SHOW_PUTAWAY"
	| "SCAN_DEST_BIN";

interface FlashState {
	type: "success" | "error";
	message: string;
}

export default function ReceivePage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const router = useRouter();
	const searchParams = useSearchParams();
	const warehouseId = searchParams.get("warehouseId") ?? "";

	const [step, setStep] = useState<Step>("SCAN_ITEM");
	const [scannedBarcode, setScannedBarcode] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [batchNumber, setBatchNumber] = useState("");
	const [flash, setFlash] = useState<FlashState | null>(null);
	const [receivedItemId, setReceivedItemId] = useState<string | null>(null);
	const [putawaySuggestions, setPutawaySuggestions] = useState<any[]>([]);

	const [scanQueryEnabled, setScanQueryEnabled] = useState(false);
	const scanQuery = useQuery({
		...orpc.warehouse.scanner.scanInboundItem.queryOptions({
			input: { organizationId, warehouseId, barcode: scannedBarcode },
		}),
		enabled:
			scanQueryEnabled &&
			Boolean(scannedBarcode && organizationId && warehouseId),
	});

	const receiptMutation = useMutation(
		orpc.warehouse.scanner.confirmInboundReceipt.mutationOptions(),
	);

	const putawayMutation = useMutation(
		orpc.warehouse.scanner.confirmPutaway.mutationOptions(),
	);

	function showFlash(type: "success" | "error", message: string) {
		setFlash({ type, message });
	}

	function handleScan(barcode: string) {
		setScannedBarcode(barcode);
		setScanQueryEnabled(true);
		setStep("VALIDATE");
	}

	async function handleConfirmReceipt() {
		const poLine = scanQuery.data?.poLine;
		const sku = scanQuery.data?.sku;
		if (!poLine || !sku) return;

		try {
			const result = await receiptMutation.mutateAsync({
				organizationId,
				warehouseId,
				poLineId: poLine.id,
				skuId: sku.id,
				quantity,
				batchNumber: batchNumber || undefined,
			});
			setPutawaySuggestions(result.putawaySuggestions ?? []);
			setStep("SHOW_PUTAWAY");
		} catch (err: any) {
			toast.error(err?.message ?? "Receipt failed");
		}
	}

	async function handlePutawayBinScan(barcode: string) {
		try {
			await putawayMutation.mutateAsync({
				organizationId,
				warehouseId,
				inventoryItemId: receivedItemId ?? "",
				destinationBinBarcode: barcode,
			});
			showFlash("success", "Item put away!");
			setTimeout(() => {
				// Loop for next item: reset to scan step
				setStep("SCAN_ITEM");
				setScannedBarcode("");
				setScanQueryEnabled(false);
				setQuantity(1);
				setBatchNumber("");
				setFlash(null);
			}, 700);
		} catch (err: any) {
			toast.error(err?.message ?? "Putaway failed");
		}
	}

	const stepLabels = ["Scan Item", "Validate", "Qty", "Receive", "Putaway"];
	const stepMap: Record<Step, number> = {
		SCAN_ITEM: 0,
		VALIDATE: 1,
		ENTER_QTY: 2,
		CONFIRM_RECEIPT: 3,
		SHOW_PUTAWAY: 4,
		SCAN_DEST_BIN: 4,
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			{flash && (
				<ScanResult
					type={flash.type}
					message={flash.message}
					onDismiss={() => setFlash(null)}
				/>
			)}

			<h1 className="text-xl font-bold">Inbound Receive</h1>
			<StepProgress steps={stepLabels} currentStep={stepMap[step]} />

			{step === "SCAN_ITEM" && (
				<div className="space-y-3">
					<p className="text-sm text-center text-muted-foreground">
						Scan item barcode or PO barcode
					</p>
					<ScanInput onScan={handleScan} />
				</div>
			)}

			{step === "VALIDATE" && (
				<div className="space-y-3">
					{scanQuery.isPending && (
						<div className="h-20 bg-muted animate-pulse rounded-xl" />
					)}
					{scanQuery.data?.found === false && (
						<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 space-y-2">
							<p className="font-semibold">Barcode not found</p>
							<p>{scannedBarcode}</p>
							<BigButton
								variant="secondary"
								onClick={() => setStep("SCAN_ITEM")}
							>
								Scan Again
							</BigButton>
						</div>
					)}
					{scanQuery.data?.found && (
						<div className="space-y-3">
							<div className="rounded-xl border bg-card p-4 space-y-2">
								<p className="font-bold">
									{scanQuery.data.sku?.name}
								</p>
								<p className="text-xs text-muted-foreground">
									{scanQuery.data.sku?.skuCode}
								</p>
								{scanQuery.data.poLine ? (
									<>
										<div className="h-px bg-border my-2" />
										<p className="text-xs font-semibold">
											Matched PO:{" "}
											{
												scanQuery.data.poLine
													.purchaseOrder.poNumber
											}
										</p>
										<p className="text-xs text-muted-foreground">
											Remaining:{" "}
											{scanQuery.data.poLine.remainingQty}{" "}
											units
										</p>
									</>
								) : (
									<p className="text-xs text-amber-600 font-medium">
										No open PO found — unexpected receipt
									</p>
								)}
							</div>
							<BigButton onClick={() => setStep("ENTER_QTY")}>
								Continue →
							</BigButton>
						</div>
					)}
				</div>
			)}

			{step === "ENTER_QTY" && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-card p-4 space-y-3">
						<p className="font-semibold text-sm">Enter Quantity</p>
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

					<div className="rounded-xl border bg-card p-3">
						<label className="text-xs text-muted-foreground">
							Batch # (optional)
						</label>
						<input
							type="text"
							value={batchNumber}
							onChange={(e) => setBatchNumber(e.target.value)}
							placeholder="e.g. BATCH-2026-001"
							className="w-full mt-1 px-3 py-2 text-sm border rounded-lg bg-background"
						/>
					</div>

					<BigButton onClick={() => setStep("CONFIRM_RECEIPT")}>
						Next: Confirm Receipt →
					</BigButton>
				</div>
			)}

			{step === "CONFIRM_RECEIPT" && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-card p-4 space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Item</span>
							<span className="font-bold">
								{scanQuery.data?.sku?.skuCode}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Quantity
							</span>
							<span className="font-bold">{quantity}</span>
						</div>
						{batchNumber && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									Batch
								</span>
								<span className="font-bold">{batchNumber}</span>
							</div>
						)}
					</div>
					<BigButton
						onClick={handleConfirmReceipt}
						disabled={receiptMutation.isPending}
					>
						{receiptMutation.isPending
							? "Receiving…"
							: "Confirm Receipt ✓"}
					</BigButton>
				</div>
			)}

			{step === "SHOW_PUTAWAY" && (
				<div className="space-y-4">
					<div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
						<CheckCircle2 className="w-5 h-5 flex-shrink-0" />
						<span>
							{quantity} unit(s) received. Now put them away.
						</span>
					</div>

					<p className="text-sm font-semibold">
						Suggested Putaway Locations
					</p>
					<div className="space-y-2">
						{putawaySuggestions.map((s: any) => (
							<div
								key={s.storageUnitId}
								className="rounded-xl border bg-card p-3 space-y-1 text-sm"
							>
								<p className="font-bold font-mono">
									{s.storageUnitCode}
								</p>
								{s.storageUnitName && (
									<p className="text-xs text-muted-foreground">
										{s.storageUnitName}
									</p>
								)}
								<div className="flex gap-3 text-xs text-muted-foreground">
									<span>
										~{Math.round(s.distanceMm / 1000)}m
									</span>
									<span>{s.fillRatePct}% full</span>
									{s.hasSameSku && (
										<span className="text-green-600 font-medium">
											★ Same SKU
										</span>
									)}
								</div>
							</div>
						))}
					</div>

					<p className="text-sm font-semibold mt-2">
						Scan destination bin to confirm
					</p>
					<ScanInput onScan={handlePutawayBinScan} />
				</div>
			)}
		</div>
	);
}
