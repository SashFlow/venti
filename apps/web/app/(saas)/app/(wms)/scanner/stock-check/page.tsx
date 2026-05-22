"use client";

import { ScanInput } from "@/modules/wms/scanner/shared/ScanInput";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { Package2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function StockCheckPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const searchParams = useSearchParams();
	const warehouseId = searchParams.get("warehouseId") ?? "";
	const initial = searchParams.get("barcode") ?? "";

	const [barcode, setBarcode] = useState(initial);
	const [enabled, setEnabled] = useState(Boolean(initial));

	const lookupQuery = useQuery({
		...orpc.warehouse.scanner.scanItemLookup.queryOptions({
			input: { organizationId, warehouseId, barcode },
		}),
		enabled: enabled && Boolean(barcode && organizationId && warehouseId),
	});

	function handleScan(code: string) {
		setBarcode(code);
		setEnabled(true);
	}

	const data = lookupQuery.data;

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="space-y-1">
				<h1 className="text-2xl font-bold">Check Stock</h1>
				<p className="text-sm text-muted-foreground">
					Scan a bin or item to view inventory
				</p>
			</div>

			<ScanInput onScan={handleScan} />

			{lookupQuery.isPending && enabled && (
				<div className="h-24 bg-muted animate-pulse rounded-xl" />
			)}

			{data && (
				<div className="space-y-3">
					{/* Header info */}
					<div className="rounded-xl border bg-card p-4 space-y-1">
						<p className="text-xs text-muted-foreground font-mono">
							{barcode}
						</p>
						{data.resolvedAs === "sku" && (
							<>
								<p className="font-bold">{data.sku?.name}</p>
								<p className="text-xs text-muted-foreground">
									{data.sku?.skuCode}
								</p>
							</>
						)}
						{data.resolvedAs === "bin" && (
							<p className="font-bold">
								Bin: {data.storageUnit?.code}
							</p>
						)}
					</div>

					{/* Stock by location */}
					{data.balances && data.balances.length > 0 ? (
						<div className="space-y-2">
							<p className="text-sm font-semibold">
								Stock Locations
							</p>
							{data.balances.map((b: any) => (
								<div
									key={b.storageUnit?.id ?? b.sku?.id}
									className="rounded-xl border bg-card p-3 flex items-center justify-between text-sm"
								>
									<div>
										<p className="font-semibold font-mono">
											{data.resolvedAs === "sku"
												? b.storageUnit?.code
												: b.sku?.skuCode}
										</p>
										<p className="text-xs text-muted-foreground">
											{data.resolvedAs === "sku"
												? b.storageUnit?.name
												: b.sku?.name}
										</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold">
											{b.qtyAvailable}
										</p>
										<p className="text-xs text-muted-foreground">
											available
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex items-center gap-2 rounded-xl border border-dashed p-6 text-muted-foreground text-sm">
							<Package2 className="w-5 h-5" />
							<span>No inventory found</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
