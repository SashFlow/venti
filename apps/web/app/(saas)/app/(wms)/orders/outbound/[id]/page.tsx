"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const PRIORITY_LABEL: Record<string, string> = {
	CRITICAL: "Critical",
	HIGH: "High",
	NORMAL: "Normal",
	LOW: "Low",
};

export default function OutboundOrderDetailPage() {
	const params = useParams<{ id: string }>();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const query = useQuery({
		...orpc.orders.getSalesOrder.queryOptions({
			input: { organizationId, orderId: params.id },
		}),
		enabled: Boolean(organizationId && params.id),
	});

	const order = query.data?.order;

	if (query.isLoading) {
		return (
			<div className="container max-w-4xl py-8 mx-auto text-sm text-muted-foreground">
				Loading...
			</div>
		);
	}

	if (!order) {
		return (
			<div className="container max-w-4xl py-8 mx-auto">
				<p className="text-sm text-muted-foreground">
					Sales order not found.
				</p>
				<Button variant="link" asChild className="px-0 mt-2">
					<Link href="/app/orders">← Back to Orders</Link>
				</Button>
			</div>
		);
	}

	const totalValue = order.lines.reduce(
		(sum, l) => sum + Number(l.unitPrice ?? 0) * Number(l.orderedQty),
		0,
	);

	return (
		<div className="container max-w-4xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-semibold tracking-tight">
							{order.orderNumber}
						</h1>
						<Badge variant="outline">{order.status}</Badge>
						{order.priority && order.priority !== "NORMAL" && (
							<Badge
								variant={
									order.priority === "CRITICAL" ||
									order.priority === "HIGH"
										? "destructive"
										: "secondary"
								}
							>
								{PRIORITY_LABEL[order.priority] ??
									order.priority}
							</Badge>
						)}
					</div>
					<p className="text-sm text-muted-foreground">Sales Order</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Order Info</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Warehouse
							</span>
							<span className="font-medium">
								{order.warehouse?.name ?? "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Customer
							</span>
							<span className="font-medium">
								{order.customerName ??
									order.customer?.name ??
									"—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Customer Email
							</span>
							<span>{order.customerEmail ?? "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Customer Ref
							</span>
							<span>{order.customerRef ?? "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Requested Ship
							</span>
							<span>
								{order.requestedShipDate
									? new Date(
											order.requestedShipDate,
										).toLocaleDateString()
									: "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Required By
							</span>
							<span>
								{order.requiredByDate
									? new Date(
											order.requiredByDate,
										).toLocaleDateString()
									: "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Shipped At
							</span>
							<span>
								{order.shippedAt
									? new Date(
											order.shippedAt,
										).toLocaleDateString()
									: "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Created By
							</span>
							<span>{order.createdBy?.name ?? "—"}</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Summary</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Lines
							</span>
							<span className="font-medium">
								{order.lines.length}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Ordered
							</span>
							<span>
								{order.lines.reduce(
									(s, l) => s + Number(l.orderedQty),
									0,
								)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Picked
							</span>
							<span>
								{order.lines.reduce(
									(s, l) => s + Number(l.pickedQty ?? 0),
									0,
								)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Shipped
							</span>
							<span>
								{order.lines.reduce(
									(s, l) => s + Number(l.shippedQty ?? 0),
									0,
								)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Est. Order Value
							</span>
							<span className="font-medium">
								{totalValue > 0
									? `$${totalValue.toFixed(2)}`
									: "—"}
							</span>
						</div>
						{order.notes && (
							<div className="pt-2 border-t">
								<p className="text-muted-foreground text-xs mb-1">
									Notes
								</p>
								<p>{order.notes}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="border rounded-2xl">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Line Items</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">#</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Product</TableHead>
								<TableHead>UOM</TableHead>
								<TableHead className="text-right">
									Ordered
								</TableHead>
								<TableHead className="text-right">
									Allocated
								</TableHead>
								<TableHead className="text-right">
									Picked
								</TableHead>
								<TableHead className="text-right">
									Shipped
								</TableHead>
								<TableHead className="text-right">
									Unit Price
								</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{order.lines.map((line) => (
								<TableRow key={line.id}>
									<TableCell className="pl-6">
										{line.lineNumber}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{line.sku?.sku ?? "—"}
									</TableCell>
									<TableCell>
										{line.sku?.name ?? "—"}
									</TableCell>
									<TableCell>
										{line.uom?.abbreviation ?? "—"}
									</TableCell>
									<TableCell className="text-right">
										{Number(line.orderedQty)}
									</TableCell>
									<TableCell className="text-right">
										{Number(line.allocatedQty ?? 0)}
									</TableCell>
									<TableCell className="text-right">
										{Number(line.pickedQty ?? 0)}
									</TableCell>
									<TableCell className="text-right">
										{Number(line.shippedQty ?? 0)}
									</TableCell>
									<TableCell className="text-right">
										{line.unitPrice
											? `$${Number(line.unitPrice).toFixed(2)}`
											: "—"}
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className="text-xs"
										>
											{line.status}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
