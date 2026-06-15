"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useSession } from "@saas/auth/hooks/use-session";
import { ScanInput } from "@saas/operator/components/ScanInput";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function OperatorReceivePage() {
	const params = useParams<{ poId: string }>();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const queryClient = useQueryClient();
	const [qtyByLine, setQtyByLine] = useState<Record<string, string>>({});
	const [lotByLine, setLotByLine] = useState<Record<string, string>>({});
	const [completed, setCompleted] = useState(false);
	const [activeLineId, setActiveLineId] = useState<string | null>(null);

	const { data, isPending } = useQuery({
		...orpc.orders.getPurchaseOrder.queryOptions({
			input: { organizationId, orderId: params.poId },
		}),
		enabled: Boolean(organizationId && params.poId),
	});

	const receiveMutation = useMutation(
		orpc.inbound.receiveInventory.mutationOptions(),
	);

	const order = data?.order;
	const warehouseId = order?.warehouse?.id;

	const suggestQuery = useQuery({
		...orpc.inbound.suggestPutaway.queryOptions({
			input: {
				organizationId,
				warehouseId: warehouseId ?? "",
				skuId: activeLineId
					? (order?.items.find((i) => i.id === activeLineId)?.sku.id ?? "")
					: (order?.items[0]?.sku.id ?? ""),
			},
		}),
		enabled: Boolean(
			organizationId && warehouseId && order?.items.length,
		),
	});

	const handleReceiveLine = async (itemId: string) => {
		const item = order?.items.find((i) => i.id === itemId);
		if (!item || !warehouseId) return;

		const qty = Number(qtyByLine[itemId] ?? 0);
		if (!qty || qty <= 0) {
			toast.error("Enter a valid quantity.");
			return;
		}

		const remaining =
			Number(item.orderedQty) - Number(item.receivedQty ?? 0);
		if (qty > remaining) {
			toast.error(`Max ${remaining} remaining on this line.`);
			return;
		}

		let locationId = suggestQuery.data?.locationId;
		if (!locationId) {
			const suggest = await queryClient.fetchQuery(
				orpc.inbound.suggestPutaway.queryOptions({
					input: {
						organizationId,
						warehouseId,
						skuId: item.sku.id,
					},
				}),
			);
			locationId = suggest.locationId;
		}

		try {
			await receiveMutation.mutateAsync({
				organizationId,
				warehouseId,
				locationId,
				skuId: item.sku.id,
				quantity: qty,
				purchaseUnitPrice: Number(item.unitPrice ?? 0),
				apportionedFreightCost: 0,
				purchaseOrderItemId: item.id,
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.getPurchaseOrder.key(),
			});
			toast.success(`Received ${qty} × ${item.sku.code}`);
			const allDone = order?.items.every((i) => {
				if (i.id === itemId) {
					return Number(i.receivedQty) + qty >= Number(i.orderedQty);
				}
				return Number(i.receivedQty) >= Number(i.orderedQty);
			});
			if (allDone) setCompleted(true);
		} catch {
			toast.error("Receive failed.");
		}
	};

	if (isPending) {
		return <p className="text-sm text-muted-foreground">Loading PO…</p>;
	}

	if (!order) {
		return <p className="text-sm text-destructive">PO not found.</p>;
	}

	if (completed) {
		return (
			<div className="flex flex-col items-center gap-4 py-12 text-center">
				<CheckCircle2 className="size-16 text-green-600" />
				<h2 className="text-xl font-semibold">Receive complete</h2>
				<p className="text-sm text-muted-foreground">
					{order.poNumber} — inventory updated.
				</p>
				<Button asChild>
					<Link href="/operator">Back to operator home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4 pb-8">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/operator">
						<ArrowLeft className="size-4" />
					</Link>
				</Button>
				<div>
					<h2 className="font-semibold">{order.poNumber}</h2>
					<p className="text-xs text-muted-foreground">
						{order.supplier?.name} · {order.warehouse?.name}
					</p>
				</div>
			</div>

			{suggestQuery.data && (
				<Card className="border-primary/30 bg-primary/5">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm flex items-center gap-2">
							<Package className="size-4" />
							Putaway suggestion
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm">
						<p className="font-mono font-medium">
							{suggestQuery.data.locationCode}
						</p>
						<p className="text-muted-foreground text-xs">
							{suggestQuery.data.reason}
						</p>
					</CardContent>
				</Card>
			)}

			<div className="space-y-3">
				{order.items.map((item) => {
					const remaining =
						Number(item.orderedQty) - Number(item.receivedQty ?? 0);
					if (remaining <= 0) return null;
					return (
						<Card
							key={item.id}
							className={
								activeLineId === item.id ? "ring-2 ring-primary" : ""
							}
							onClick={() => setActiveLineId(item.id)}
						>
							<CardContent className="p-4 space-y-3">
								<div className="flex justify-between">
									<p className="font-mono font-semibold">
										{item.sku.code}
									</p>
									<p className="text-sm text-muted-foreground">
										{Number(item.receivedQty)} / {Number(item.orderedQty)}{" "}
										rcvd
									</p>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<Label className="text-xs">Qty to receive</Label>
										<Input
											type="number"
											min={1}
											max={remaining}
											value={qtyByLine[item.id] ?? String(remaining)}
											onChange={(e) =>
												setQtyByLine((p) => ({
													...p,
													[item.id]: e.target.value,
												}))
											}
										/>
									</div>
									<div>
										<Label className="text-xs">Lot (optional)</Label>
										<Input
											value={lotByLine[item.id] ?? ""}
											onChange={(e) =>
												setLotByLine((p) => ({
													...p,
													[item.id]: e.target.value,
												}))
											}
											placeholder="LOT-…"
										/>
									</div>
								</div>
								<ScanInput
									expectedCode={item.sku.code}
									onScanMatch={() => setActiveLineId(item.id)}
									placeholder="Scan SKU to select line"
								/>
								<Button
									className="w-full"
									disabled={receiveMutation.isPending}
									onClick={() => handleReceiveLine(item.id)}
								>
									Receive line
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
