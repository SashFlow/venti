"use client";

import { ScanInput } from "@/modules/wms/scanner/shared/ScanInput";
import { ScanResult } from "@/modules/wms/scanner/shared/ScanResult";
import { StepProgress } from "@/modules/wms/scanner/shared/StepProgress";
import { BigButton } from "@/modules/wms/scanner/shared/BigButton";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Step = "SCAN_SOURCE" | "SELECT_SKU_QTY" | "SCAN_DESTINATION" | "CONFIRM";

interface FlashState {
	type: "success" | "error";
	message: string;
}

export default function BinMovePage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const router = useRouter();
	const searchParams = useSearchParams();
	const warehouseId = searchParams.get("warehouseId") ?? "";
	const initialBarcode = searchParams.get("barcode") ?? "";

	const [step, setStep] = useState<Step>(
		initialBarcode ? "SELECT_SKU_QTY" : "SCAN_SOURCE",
	);
	const [sourceBinBarcode, setSourceBinBarcode] = useState(initialBarcode);
	const [destBinBarcode, setDestBinBarcode] = useState("");
	const [selectedSkuId, setSelectedSkuId] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [flash, setFlash] = useState<FlashState | null>(null);

	const binContentsQuery = useQuery({
		...orpc.warehouse.scanner.getBinContents.queryOptions({
			input: { organizationId, warehouseId, barcode: sourceBinBarcode },
		}),
		enabled: Boolean(sourceBinBarcode && organizationId && warehouseId),
	});

	const moveMutation = useMutation(
		orpc.warehouse.scanner.executeBinMove.mutationOptions(),
	);

	const contents =
		binContentsQuery.data?.storageUnit?.inventoryBalances ?? [];

	function showFlash(type: "success" | "error", message: string) {
		setFlash({ type, message });
	}

	function handleSourceScan(barcode: string) {
		setSourceBinBarcode(barcode);
		setStep("SELECT_SKU_QTY");
	}

	function handleDestScan(barcode: string) {
		setDestBinBarcode(barcode);
		setStep("CONFIRM");
	}

	async function handleConfirm() {
		try {
			await moveMutation.mutateAsync({
				organizationId,
				warehouseId,
				fromBinBarcode: sourceBinBarcode,
				toBinBarcode: destBinBarcode,
				skuId: selectedSkuId,
				quantity,
			});
			showFlash("success", `Moved ${quantity} unit(s) successfully`);
			setTimeout(() => {
				router.push(
					`/app/scanner/quick-scan?warehouseId=${warehouseId}`,
				);
			}, 700);
		} catch (err: any) {
			toast.error(err?.message ?? "Move failed");
		}
	}

	const stepLabels = [
		"Scan Source",
		"Select SKU + Qty",
		"Scan Dest",
		"Confirm",
	];
	const stepIndex =
		step === "SCAN_SOURCE"
			? 0
			: step === "SELECT_SKU_QTY"
				? 1
				: step === "SCAN_DESTINATION"
					? 2
					: 3;

	return (
		<div className="flex flex-col gap-4 p-4">
			{flash && (
				<ScanResult
					type={flash.type}
					message={flash.message}
					onDismiss={() => setFlash(null)}
				/>
			)}

			<h1 className="text-xl font-bold">Bin Move</h1>
			<StepProgress steps={stepLabels} currentStep={stepIndex} />

			{step === "SCAN_SOURCE" && (
				<div className="space-y-3">
					<p className="text-sm text-center text-muted-foreground">
						Scan the <strong>source bin</strong>
					</p>
					<ScanInput onScan={handleSourceScan} />
				</div>
			)}

			{step === "SELECT_SKU_QTY" && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-card p-3">
						<p className="text-xs text-muted-foreground mb-2">
							Source bin:{" "}
							<span className="font-mono font-bold">
								{binContentsQuery.data?.storageUnit?.code ??
									sourceBinBarcode}
							</span>
						</p>
						{binContentsQuery.isPending ? (
							<div className="h-12 bg-muted rounded animate-pulse" />
						) : contents.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No inventory at this bin.
							</p>
						) : (
							<div className="space-y-2">
								{contents.map((b: any) => (
									<button
										key={b.sku.id}
										type="button"
										onClick={() =>
											setSelectedSkuId(b.sku.id)
										}
										className={`w-full text-left rounded-lg border p-3 transition-colors ${
											selectedSkuId === b.sku.id
												? "border-blue-600 bg-blue-50"
												: "border-border bg-background"
										}`}
									>
										<p className="font-semibold text-sm">
											{b.sku.skuCode}
										</p>
										<p className="text-xs text-muted-foreground">
											{b.sku.name} · {b.qtyAvailable}{" "}
											available
										</p>
									</button>
								))}
							</div>
						)}
					</div>

					{selectedSkuId && (
						<>
							<div className="flex items-center gap-4 rounded-xl border bg-card p-4">
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
							<BigButton
								onClick={() => setStep("SCAN_DESTINATION")}
							>
								Next: Scan Destination →
							</BigButton>
						</>
					)}
				</div>
			)}

			{step === "SCAN_DESTINATION" && (
				<div className="space-y-3">
					<p className="text-sm text-center text-muted-foreground">
						Scan the <strong>destination bin</strong>
					</p>
					<ScanInput onScan={handleDestScan} />
					<BigButton
						variant="secondary"
						onClick={() => setStep("SELECT_SKU_QTY")}
					>
						← Back
					</BigButton>
				</div>
			)}

			{step === "CONFIRM" && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">From</span>
							<span className="font-mono font-bold">
								{binContentsQuery.data?.storageUnit?.code ??
									sourceBinBarcode}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">To</span>
							<span className="font-mono font-bold">
								{destBinBarcode}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Quantity
							</span>
							<span className="font-bold">{quantity}</span>
						</div>
					</div>

					<BigButton
						onClick={handleConfirm}
						disabled={moveMutation.isPending}
					>
						{moveMutation.isPending ? "Moving…" : "Confirm Move ✓"}
					</BigButton>

					<BigButton
						variant="secondary"
						onClick={() => setStep("SCAN_DESTINATION")}
					>
						← Change Destination
					</BigButton>
				</div>
			)}
		</div>
	);
}
