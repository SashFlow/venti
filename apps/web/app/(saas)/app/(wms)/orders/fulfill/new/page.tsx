"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const WAVE_TYPES = [
	{ value: "SINGLE_ORDER", label: "Single Order" },
	{ value: "BATCH", label: "Batch" },
	{ value: "ZONE", label: "Zone" },
	{ value: "CLUSTER", label: "Cluster" },
];

export default function CreateWavePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const [warehouseId, setWarehouseId] = useState("");
	const [waveNumber, setWaveNumber] = useState("");
	const [waveType, setWaveType] = useState("BATCH");
	const [notes, setNotes] = useState("");
	const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const warehousesQuery = useQuery({
		...orpc.warehouse.list.queryOptions({
			input: { organizationId, status: "active", limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const outboundQuery = useQuery({
		...orpc.orders.listOutbound.queryOptions({
			input: { organizationId, limit: 200, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const createMutation = useMutation(
		orpc.orders.createWave.mutationOptions(),
	);

	const warehouses = warehousesQuery.data?.warehouses ?? [];
	const salesOrders = outboundQuery.data?.orders ?? [];

	const toggleOrder = (id: string) => {
		setSelectedOrderIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!warehouseId) {
			toast.error("Warehouse is required.");
			return;
		}
		if (!waveNumber.trim()) {
			toast.error("Wave number is required.");
			return;
		}
		if (selectedOrderIds.length === 0) {
			toast.error("Select at least one sales order.");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await createMutation.mutateAsync({
				organizationId,
				warehouseId,
				waveNumber: waveNumber.trim(),
				type: waveType as "SINGLE_ORDER" | "BATCH" | "ZONE" | "CLUSTER",
				salesOrderIds: selectedOrderIds,
				notes: notes.trim() || undefined,
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listFulfillmentBatches.key(),
			});
			toast.success(`Wave ${result.wave.waveNumber} created.`);
			router.push(`/app/orders/fulfill/${result.wave.id}`);
		} catch {
			toast.error("Failed to create wave.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container max-w-2xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders?tab=fulfill">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						New Wave
					</h1>
					<p className="text-sm text-muted-foreground">
						Create a fulfillment wave from open sales orders.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Wave Details
						</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="warehouseId">
								Warehouse{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Select
								value={warehouseId}
								onValueChange={(value) => {
									if (value) {
										setWarehouseId(value);
									}
								}}
							>
								<SelectTrigger id="warehouseId">
									<SelectValue placeholder="Select warehouse">
										{warehouses.find(
											(w) => w.id === warehouseId,
										)?.name ?? "Select warehouse"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{warehouses.map((w) => (
										<SelectItem key={w.id} value={w.id}>
											{w.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="waveNumber">
								Wave Number{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="waveNumber"
								value={waveNumber}
								onChange={(e) => setWaveNumber(e.target.value)}
								placeholder="e.g. WV-2026-001"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="waveType">Wave Type</Label>
							<Select
								value={waveType}
								onValueChange={(value) => {
									if (value) {
										setWaveType(value);
									}
								}}
							>
								<SelectTrigger id="waveType">
									<SelectValue placeholder="Select type">
										{WAVE_TYPES.find(
											(t) => t.value === waveType,
										)?.label ?? "Select type"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{WAVE_TYPES.map((t) => (
										<SelectItem
											key={t.value}
											value={t.value}
										>
											{t.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="notes">Notes</Label>
							<Input
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Optional notes"
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Select Sales Orders{" "}
							<span className="text-muted-foreground font-normal text-sm">
								({selectedOrderIds.length} selected)
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 max-h-72 overflow-y-auto">
						{salesOrders.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No open sales orders found.
							</p>
						)}
						{salesOrders.map((o) => (
							<label
								key={o.id}
								className="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
							>
								<Checkbox
									checked={selectedOrderIds.includes(o.id)}
									onCheckedChange={() => toggleOrder(o.id)}
								/>
								<span className="text-sm font-medium">
									{o.orderNumber}
								</span>
								{o.customer?.name && (
									<span className="text-sm text-muted-foreground">
										— {o.customer.name}
									</span>
								)}
								<span className="ml-auto text-xs text-muted-foreground">
									{o.status}
								</span>
							</label>
						))}
					</CardContent>
				</Card>

				<div className="flex justify-end gap-3">
					<Button type="button" variant="outline" asChild>
						<Link href="/app/orders?tab=fulfill">Cancel</Link>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Wave"}
					</Button>
				</div>
			</form>
		</div>
	);
}
