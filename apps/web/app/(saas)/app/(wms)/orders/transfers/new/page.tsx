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

export default function CreateTransferPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const [warehouseId, setWarehouseId] = useState("");
	const [inventoryItemId, setInventoryItemId] = useState("");
	const [fromStorageUnitId, setFromStorageUnitId] = useState("");
	const [toStorageUnitId, setToStorageUnitId] = useState("");
	const [quantity, setQuantity] = useState("");
	const [referenceNumber, setReferenceNumber] = useState("");
	const [notes, setNotes] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const warehousesQuery = useQuery({
		...orpc.warehouse.list.queryOptions({
			input: { organizationId, status: "active", limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const createMutation = useMutation(orpc.orders.createTransfer.mutationOptions());

	const warehouses = warehousesQuery.data?.warehouses ?? [];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!warehouseId) { toast.error("Warehouse is required."); return; }
		if (!inventoryItemId.trim()) { toast.error("Inventory Item ID is required."); return; }
		if (!quantity || Number(quantity) <= 0) { toast.error("Quantity must be greater than zero."); return; }

		setIsSubmitting(true);
		try {
			const result = await createMutation.mutateAsync({
				organizationId,
				warehouseId,
				inventoryItemId: inventoryItemId.trim(),
				fromStorageUnitId: fromStorageUnitId.trim() || undefined,
				toStorageUnitId: toStorageUnitId.trim() || undefined,
				quantity: Number(quantity),
				referenceNumber: referenceNumber.trim() || undefined,
				notes: notes.trim() || undefined,
			});

			await queryClient.invalidateQueries({ queryKey: orpc.orders.listTransfers.key() });
			toast.success(`Transfer ${result.transfer.referenceNumber ?? result.transfer.id.slice(0, 10)} created.`);
			router.push(`/app/orders/transfers/${result.transfer.id}`);
		} catch {
			toast.error("Failed to create transfer.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container max-w-2xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders?tab=transfer">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">New Transfer</h1>
					<p className="text-sm text-muted-foreground">Create an internal inventory transfer movement.</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Transfer Details</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="warehouseId">
								Warehouse <span className="text-destructive">*</span>
							</Label>
							<Select value={warehouseId} onValueChange={setWarehouseId}>
								<SelectTrigger id="warehouseId">
									<SelectValue placeholder="Select warehouse" />
								</SelectTrigger>
								<SelectContent>
									{warehouses.map((w) => (
										<SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="referenceNumber">Reference Number</Label>
							<Input
								id="referenceNumber"
								value={referenceNumber}
								onChange={(e) => setReferenceNumber(e.target.value)}
								placeholder="e.g. TRF-2026-001"
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="inventoryItemId">
								Inventory Item ID <span className="text-destructive">*</span>
							</Label>
							<Input
								id="inventoryItemId"
								value={inventoryItemId}
								onChange={(e) => setInventoryItemId(e.target.value)}
								placeholder="Paste inventory item ID"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="fromStorageUnitId">From Storage Unit ID</Label>
							<Input
								id="fromStorageUnitId"
								value={fromStorageUnitId}
								onChange={(e) => setFromStorageUnitId(e.target.value)}
								placeholder="Origin storage unit ID"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="toStorageUnitId">To Storage Unit ID</Label>
							<Input
								id="toStorageUnitId"
								value={toStorageUnitId}
								onChange={(e) => setToStorageUnitId(e.target.value)}
								placeholder="Destination storage unit ID"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="quantity">
								Quantity <span className="text-destructive">*</span>
							</Label>
							<Input
								id="quantity"
								type="number"
								min="0.0001"
								step="any"
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								placeholder="0"
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
						<Link href="/app/orders?tab=transfer">Cancel</Link>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Transfer"}
					</Button>
				</div>
			</form>
		</div>
	);
}
