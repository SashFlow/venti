"use client";

import { ScanInput } from "@/modules/wms/scanner/shared/ScanInput";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, Package2, QrCode, Scan } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function QuickScanPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const router = useRouter();
	const searchParams = useSearchParams();

	// The active warehouse is taken from URL param or session
	const warehouseId = searchParams.get("warehouseId") ?? "";

	const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
	const [lookupEnabled, setLookupEnabled] = useState(false);

	const lookupQuery = useQuery({
		...orpc.warehouse.scanner.scanItemLookup.queryOptions({
			input: {
				organizationId,
				warehouseId,
				barcode: scannedBarcode ?? "",
			},
		}),
		enabled:
			lookupEnabled &&
			Boolean(scannedBarcode && organizationId && warehouseId),
	});

	function handleScan(barcode: string) {
		setScannedBarcode(barcode);
		setLookupEnabled(true);
	}

	function navigateTo(
		action: "move" | "receive" | "transfer" | "stock-check",
	) {
		const params = new URLSearchParams({
			warehouseId,
			barcode: scannedBarcode ?? "",
		});
		router.push(`/app/scanner/quick-scan/${action}?${params.toString()}`);
	}

	const resolved = lookupQuery.data;

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="space-y-1">
				<h1 className="text-2xl font-bold">Quick Scan</h1>
				<p className="text-sm text-muted-foreground">
					Scan any barcode to see available actions
				</p>
			</div>

			<ScanInput onScan={handleScan} />

			{lookupQuery.isPending && lookupEnabled && (
				<div className="flex justify-center py-4">
					<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
				</div>
			)}

			{scannedBarcode && !lookupQuery.isPending && (
				<div className="rounded-xl border bg-card p-3 space-y-1">
					<p className="text-xs text-muted-foreground font-mono">
						{scannedBarcode}
					</p>
					{resolved?.resolvedAs === "sku" && (
						<p className="text-sm font-semibold">
							{resolved.sku?.name}{" "}
							<span className="text-muted-foreground text-xs">
								({resolved.sku?.skuCode})
							</span>
						</p>
					)}
					{resolved?.resolvedAs === "bin" && (
						<p className="text-sm font-semibold">
							Bin: {resolved.storageUnit?.code}
						</p>
					)}
					{resolved?.resolvedAs === "unknown" && (
						<p className="text-sm text-muted-foreground italic">
							Barcode not found in system
						</p>
					)}
				</div>
			)}

			{/* Action tiles — always visible so operator can still choose action */}
			<div className="grid grid-cols-2 gap-3">
				<ActionTile
					icon={<ArrowLeftRight className="w-7 h-7" />}
					label="Move"
					description="Bin to bin"
					color="bg-blue-600"
					onClick={() => navigateTo("move")}
				/>
				<ActionTile
					icon={<Package2 className="w-7 h-7" />}
					label="Receive"
					description="Inbound receipt"
					color="bg-green-600"
					onClick={() => navigateTo("receive")}
				/>
				<ActionTile
					icon={<Scan className="w-7 h-7" />}
					label="Transfer"
					description="Inter-warehouse"
					color="bg-violet-600"
					onClick={() => navigateTo("transfer")}
				/>
				<ActionTile
					icon={<QrCode className="w-7 h-7" />}
					label="Check Stock"
					description="View inventory"
					color="bg-amber-600"
					onClick={() => navigateTo("stock-check")}
				/>
			</div>
		</div>
	);
}

function ActionTile({
	icon,
	label,
	description,
	color,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	description: string;
	color: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-6 text-white ${color} hover:opacity-90 active:scale-95 transition-all shadow-sm`}
		>
			{icon}
			<span className="text-base font-bold">{label}</span>
			<span className="text-xs opacity-80">{description}</span>
		</button>
	);
}
