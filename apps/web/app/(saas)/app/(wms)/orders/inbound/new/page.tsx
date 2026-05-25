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
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type OrderLine = {
	id: string;
	skuId: string;
	orderedQty: string;
	unitCost: string;
	expectedDate: string;
};

function newLine(): OrderLine {
	return {
		id: crypto.randomUUID(),
		skuId: "",
		orderedQty: "",
		unitCost: "",
		expectedDate: "",
	};
}

export default function CreateInboundOrderPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const [poNumber, setPoNumber] = useState("");
	const [warehouseId, setWarehouseId] = useState("");
	const [supplierId, setSupplierId] = useState("");
	const [expectedDate, setExpectedDate] = useState("");
	const [notes, setNotes] = useState("");
	const [lines, setLines] = useState<OrderLine[]>([newLine()]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const warehousesQuery = useQuery({
		...orpc.warehouse.list.queryOptions({
			input: { organizationId, status: "active", limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const suppliersQuery = useQuery({
		...orpc.masterData.list.queryOptions({
			input: { organizationId, limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const skusQuery = useQuery({
		...orpc.products.list.queryOptions({
			input: { organizationId, limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const createMutation = useMutation(
		orpc.orders.createPurchaseOrder.mutationOptions(),
	);

	const warehouses = warehousesQuery.data?.warehouses ?? [];
	const suppliers = suppliersQuery.data?.suppliers ?? [];
	const skus = skusQuery.data?.skus ?? [];

	const handleAddLine = () => setLines((prev) => [...prev, newLine()]);

	const handleRemoveLine = (id: string) =>
		setLines((prev) => prev.filter((l) => l.id !== id));

	const handleLineChange = <K extends keyof OrderLine>(
		id: string,
		field: K,
		value: OrderLine[K],
	) =>
		setLines((prev) =>
			prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
		);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!poNumber.trim()) {
			toast.error("PO number is required.");
			return;
		}
		if (!warehouseId) {
			toast.error("Warehouse is required.");
			return;
		}
		if (!supplierId) {
			toast.error("Supplier is required.");
			return;
		}
		const validLines = lines.filter((l) => l.skuId && l.orderedQty);
		if (validLines.length === 0) {
			toast.error("At least one valid line item is required.");
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await createMutation.mutateAsync({
				organizationId,
				poNumber: poNumber.trim(),
				warehouseId,
				supplierId,
				expectedDate: expectedDate ? new Date(expectedDate) : undefined,
				notes: notes.trim() || undefined,
				lines: validLines.map((l) => ({
					skuId: l.skuId,
					orderedQty: Number(l.orderedQty),
					unitCost: l.unitCost ? Number(l.unitCost) : undefined,
					expectedDate: l.expectedDate
						? new Date(l.expectedDate)
						: undefined,
				})),
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listInbound.key(),
			});
			toast.success(`Purchase order ${result.order.poNumber} created.`);
			router.push(`/app/orders/inbound/${result.order.id}`);
		} catch {
			toast.error("Failed to create purchase order.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container max-w-4xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders?tab=inbound">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						New Purchase Order
					</h1>
					<p className="text-sm text-muted-foreground">
						Create an inbound purchase order from a supplier.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Order Details
						</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="poNumber">
								PO Number{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="poNumber"
								value={poNumber}
								onChange={(e) => setPoNumber(e.target.value)}
								placeholder="e.g. PO-2026-001"
							/>
						</div>

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
							<Label htmlFor="supplierId">
								Supplier{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Select
								value={supplierId}
								onValueChange={setSupplierId}
							>
								<SelectTrigger id="supplierId">
									<SelectValue placeholder="Select supplier">
										{suppliers.find(
											(s) => s.id === supplierId,
										)?.name ?? "Select supplier"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{suppliers.map((s) => (
										<SelectItem key={s.id} value={s.id}>
											{s.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="expectedDate">
								Expected Delivery Date
							</Label>
							<Input
								id="expectedDate"
								type="date"
								value={expectedDate}
								onChange={(e) =>
									setExpectedDate(e.target.value)
								}
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="notes">Notes</Label>
							<Input
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Optional notes for this purchase order"
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="border rounded-2xl">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-base">Line Items</CardTitle>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={handleAddLine}
						>
							<PlusIcon className="mr-1.5 size-4" />
							Add Line
						</Button>
					</CardHeader>
					<CardContent className="space-y-3">
						{lines.map((line, index) => (
							<div
								key={line.id}
								className="grid items-end gap-3 border rounded-xl p-3 md:grid-cols-4"
							>
								<div className="space-y-2 md:col-span-2">
									<Label>
										SKU{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Select
										value={line.skuId}
										onValueChange={(v) =>
											handleLineChange(
												line.id,
												"skuId",
												v,
											)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select product">
												{line.skuId
													? skus.find(
															(s) =>
																s.id ===
																line.skuId,
														)?.name
													: "Select product"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{skus.map((s) => (
												<SelectItem
													key={s.id}
													value={s.id}
												>
													{s.name} ({s.sku})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>
										Qty{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										type="number"
										min="0.0001"
										step="any"
										value={line.orderedQty}
										onChange={(e) =>
											handleLineChange(
												line.id,
												"orderedQty",
												e.target.value,
											)
										}
										placeholder="0"
									/>
								</div>

								<div className="space-y-2">
									<Label>Unit Cost</Label>
									<Input
										type="number"
										min="0"
										step="any"
										value={line.unitCost}
										onChange={(e) =>
											handleLineChange(
												line.id,
												"unitCost",
												e.target.value,
											)
										}
										placeholder="0.00"
									/>
								</div>

								<div className="space-y-2">
									<Label>Expected Date</Label>
									<Input
										type="date"
										value={line.expectedDate}
										onChange={(e) =>
											handleLineChange(
												line.id,
												"expectedDate",
												e.target.value,
											)
										}
									/>
								</div>

								<div className="flex items-end justify-end">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() =>
											handleRemoveLine(line.id)
										}
										disabled={lines.length === 1}
										aria-label={`Remove line ${index + 1}`}
									>
										<Trash2Icon className="size-4 text-destructive" />
									</Button>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<div className="flex justify-end gap-3">
					<Button type="button" variant="outline" asChild>
						<Link href="/app/orders?tab=inbound">Cancel</Link>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Purchase Order"}
					</Button>
				</div>
			</form>
		</div>
	);
}
