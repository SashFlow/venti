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

const PRIORITY_OPTIONS = [
	{ value: "CRITICAL", label: "Critical" },
	{ value: "HIGH", label: "High" },
	{ value: "NORMAL", label: "Normal" },
	{ value: "LOW", label: "Low" },
];

type OrderLine = {
	id: string;
	skuId: string;
	orderedQty: string;
	unitPrice: string;
};

function newLine(): OrderLine {
	return {
		id: crypto.randomUUID(),
		skuId: "",
		orderedQty: "",
		unitPrice: "",
	};
}

export default function CreateOutboundOrderPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const [orderNumber, setOrderNumber] = useState("");
	const [warehouseId, setWarehouseId] = useState("");
	const [customerId, setCustomerId] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerRef, setCustomerRef] = useState("");
	const [priority, setPriority] = useState("NORMAL");
	const [requestedShipDate, setRequestedShipDate] = useState("");
	const [requiredByDate, setRequiredByDate] = useState("");
	const [notes, setNotes] = useState("");
	const [lines, setLines] = useState<OrderLine[]>([newLine()]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const warehousesQuery = useQuery({
		...orpc.warehouse.list.queryOptions({
			input: { organizationId, status: "active", limit: 100, offset: 0 },
		}),
		enabled: Boolean(organizationId),
	});

	const customersQuery = useQuery({
		...orpc.customers.list.queryOptions({
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
		orpc.orders.createSalesOrder.mutationOptions(),
	);

	const warehouses = warehousesQuery.data?.warehouses ?? [];
	const customers = customersQuery.data?.customers ?? [];
	const skuOptions = (skusQuery.data?.products ?? []).flatMap((product) =>
		product.skus.map((sku) => ({
			id: sku.id,
			name: product.name,
			code: sku.code,
		})),
	);

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

		if (!orderNumber.trim()) {
			toast.error("Order number is required.");
			return;
		}
		if (!warehouseId) {
			toast.error("Warehouse is required.");
			return;
		}
		if (!customerId) {
			toast.error("Customer is required.");
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
				orderNumber: orderNumber.trim(),
				warehouseId,
				customerId,
				customerName: customerName.trim() || undefined,
				customerEmail: customerEmail.trim() || undefined,
				customerRef: customerRef.trim() || undefined,
				priority: priority as "CRITICAL" | "HIGH" | "NORMAL" | "LOW",
				requestedShipDate: requestedShipDate
					? new Date(requestedShipDate)
					: undefined,
				requiredByDate: requiredByDate
					? new Date(requiredByDate)
					: undefined,
				notes: notes.trim() || undefined,
				lines: validLines.map((l) => ({
					skuId: l.skuId,
					orderedQty: Number(l.orderedQty),
					unitPrice: l.unitPrice ? Number(l.unitPrice) : undefined,
				})),
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listOutbound.key(),
			});
			toast.success(`Sales order ${result.order.orderNumber} created.`);
			router.push(`/app/orders/outbound/${result.order.id}`);
		} catch {
			toast.error("Failed to create sales order.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container max-w-4xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders?tab=outbound">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						New Sales Order
					</h1>
					<p className="text-sm text-muted-foreground">
						Create an outbound order for a customer.
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
							<Label htmlFor="orderNumber">
								Order Number{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="orderNumber"
								value={orderNumber}
								onChange={(e) => setOrderNumber(e.target.value)}
								placeholder="e.g. SO-2026-001"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="warehouseId">
								Warehouse{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Select
								value={warehouseId}
								onValueChange={(value) => {
									if (value) setWarehouseId(value);
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
							<Label htmlFor="customerId">
								Customer{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Select
								value={customerId}
								onValueChange={(v) => {
									if (!v) return;
									setCustomerId(v);
									const c = customers.find((x) => x.id === v);
									if (c) setCustomerName(c.name);
								}}
							>
								<SelectTrigger id="customerId">
									<SelectValue placeholder="Select customer">
										{customers.find(
											(c) => c.id === customerId,
										)?.name ?? "Select customer"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{customers.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="priority">Priority</Label>
							<Select
								value={priority}
								onValueChange={(value) => {
									if (value) setPriority(value);
								}}
							>
								<SelectTrigger id="priority">
									<SelectValue placeholder="Select priority">
										{PRIORITY_OPTIONS.find(
											(o) => o.value === priority,
										)?.label ?? "Select priority"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{PRIORITY_OPTIONS.map((o) => (
										<SelectItem
											key={o.value}
											value={o.value}
										>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="customerName">Customer Name</Label>
							<Input
								id="customerName"
								value={customerName}
								onChange={(e) =>
									setCustomerName(e.target.value)
								}
								placeholder="Override or enter manually"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="customerEmail">
								Customer Email
							</Label>
							<Input
								id="customerEmail"
								type="email"
								value={customerEmail}
								onChange={(e) =>
									setCustomerEmail(e.target.value)
								}
								placeholder="customer@example.com"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="customerRef">
								Customer Reference
							</Label>
							<Input
								id="customerRef"
								value={customerRef}
								onChange={(e) => setCustomerRef(e.target.value)}
								placeholder="External reference number"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="requestedShipDate">
								Requested Ship Date
							</Label>
							<Input
								id="requestedShipDate"
								type="date"
								value={requestedShipDate}
								onChange={(e) =>
									setRequestedShipDate(e.target.value)
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="requiredByDate">
								Required By Date
							</Label>
							<Input
								id="requiredByDate"
								type="date"
								value={requiredByDate}
								onChange={(e) =>
									setRequiredByDate(e.target.value)
								}
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
										onValueChange={(v) => {
											if (v) {
												handleLineChange(
													line.id,
													"skuId",
													v,
												);
											}
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select product">
												{line.skuId
													? skuOptions.find(
															(s) =>
																s.id ===
																line.skuId,
														)?.name
													: "Select product"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{skuOptions.map((s) => (
												<SelectItem
													key={s.id}
													value={s.id}
												>
													{s.name} ({s.code})
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
									<Label>Unit Price</Label>
									<Input
										type="number"
										min="0"
										step="any"
										value={line.unitPrice}
										onChange={(e) =>
											handleLineChange(
												line.id,
												"unitPrice",
												e.target.value,
											)
										}
										placeholder="0.00"
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
						<Link href="/app/orders?tab=outbound">Cancel</Link>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Sales Order"}
					</Button>
				</div>
			</form>
		</div>
	);
}
