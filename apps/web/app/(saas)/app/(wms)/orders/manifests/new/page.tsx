"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
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

export default function CreateManifestPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const [warehouseId, setWarehouseId] = useState("");
	const [salesOrderId, setSalesOrderId] = useState("");
	const [shipmentNumber, setShipmentNumber] = useState("");
	const [carrierId, setCarrierId] = useState("");
	const [trackingNumber, setTrackingNumber] = useState("");
	const [scheduledAt, setScheduledAt] = useState("");
	const [notes, setNotes] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const warehousesQuery = useQuery({
		...orpc.warehouse.list.queryOptions({
			input: { organizationId, status: "active", limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const outboundQuery = useQuery({
		...orpc.orders.listOutbound.queryOptions({
			input: { organizationId, limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const createMutation = useMutation(
		orpc.orders.createShipment.mutationOptions(),
	);

	const warehouses = warehousesQuery.data?.warehouses ?? [];
	const salesOrders = outboundQuery.data?.orders ?? [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!warehouseId) {
			toast.error("Warehouse is required.");
			return;
		}
		if (!salesOrderId) {
			toast.error("Sales order is required.");
			return;
		}
		if (!shipmentNumber.trim()) {
			toast.error("Shipment number is required.");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await createMutation.mutateAsync({
				organizationId,
				warehouseId,
				salesOrderId,
				shipmentNumber: shipmentNumber.trim(),
				carrierId: carrierId.trim() || undefined,
				trackingNumber: trackingNumber.trim() || undefined,
				scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
				notes: notes.trim() || undefined,
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listManifests.key(),
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listFulfillmentShipments.key(),
			});
			toast.success(
				`Shipment ${result.shipment.shipmentNumber} created.`,
			);
			router.push(`/app/orders/manifests/${result.shipment.id}`);
		} catch {
			toast.error("Failed to create shipment.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container max-w-2xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders?tab=manifest">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						New Shipment
					</h1>
					<p className="text-sm text-muted-foreground">
						Create a shipment/manifest linked to a sales order.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Shipment Details
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
								onValueChange={setWarehouseId}
							>
								<SelectTrigger id="warehouseId">
									<SelectValue placeholder="Select warehouse" />
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
							<Label htmlFor="salesOrderId">
								Sales Order{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Select
								value={salesOrderId}
								onValueChange={setSalesOrderId}
							>
								<SelectTrigger id="salesOrderId">
									<SelectValue placeholder="Select sales order" />
								</SelectTrigger>
								<SelectContent>
									{salesOrders.map((o) => (
										<SelectItem key={o.id} value={o.id}>
											{o.orderNumber}{" "}
											{o.customerName
												? `— ${o.customerName}`
												: ""}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="shipmentNumber">
								Shipment Number{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="shipmentNumber"
								value={shipmentNumber}
								onChange={(e) =>
									setShipmentNumber(e.target.value)
								}
								placeholder="e.g. SHIP-2026-001"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="trackingNumber">
								Tracking Number
							</Label>
							<Input
								id="trackingNumber"
								value={trackingNumber}
								onChange={(e) =>
									setTrackingNumber(e.target.value)
								}
								placeholder="Carrier tracking number"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="scheduledAt">
								Scheduled Dispatch
							</Label>
							<Input
								id="scheduledAt"
								type="datetime-local"
								value={scheduledAt}
								onChange={(e) => setScheduledAt(e.target.value)}
							/>
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

				<div className="flex justify-end gap-3">
					<Button type="button" variant="outline" asChild>
						<Link href="/app/orders?tab=manifest">Cancel</Link>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Shipment"}
					</Button>
				</div>
			</form>
		</div>
	);
}
