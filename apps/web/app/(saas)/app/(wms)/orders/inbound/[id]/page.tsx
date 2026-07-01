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

const STATUS_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	DRAFT: "outline",
	PENDING: "secondary",
	APPROVED: "default",
	RECEIVING: "default",
	RECEIVED: "default",
	CLOSED: "secondary",
	CANCELLED: "destructive",
};

export default function InboundOrderDetailPage() {
	const params = useParams<{ id: string }>();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const query = useQuery({
		...orpc.orders.getPurchaseOrder.queryOptions({
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
					Purchase order not found.
				</p>
				<Button variant="link" asChild className="px-0 mt-2">
					<Link href="/app/orders">← Back to Orders</Link>
				</Button>
			</div>
		);
	}

	const items = order.items ?? [];
	const totalCost = items.reduce(
		(sum, item) =>
			sum + Number(item.unitPrice ?? 0) * Number(item.orderedQty),
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
							{order.poNumber}
						</h1>
						<Badge
							variant={STATUS_VARIANT[order.status] ?? "outline"}
						>
							{order.status}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						Purchase Order
					</p>
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
								Supplier
							</span>
							<span className="font-medium">
								{order.supplier?.name ?? "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Expected Date
							</span>
							<span>
								{order.expectedAt
									? new Date(
											order.expectedAt,
										).toLocaleDateString()
									: "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Created At
							</span>
							<span>
								{new Date(order.createdAt).toLocaleDateString()}
							</span>
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
							<span className="font-medium">{items.length}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Ordered Qty
							</span>
							<span>
								{items.reduce(
									(sum, item) =>
										sum + Number(item.orderedQty),
									0,
								)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Received Qty
							</span>
							<span>
								{items.reduce(
									(sum, item) =>
										sum + Number(item.receivedQty ?? 0),
									0,
								)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Est. Total Cost
							</span>
							<span className="font-medium">
								{totalCost > 0
									? `₹${totalCost.toFixed(2)}`
									: "—"}
							</span>
						</div>
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
								<TableHead className="pl-6">SKU</TableHead>
								<TableHead className="text-right">
									Ordered
								</TableHead>
								<TableHead className="text-right">
									Received
								</TableHead>
								<TableHead className="text-right">
									Unit Price
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((item) => (
								<TableRow key={item.id}>
									<TableCell className="pl-6 font-mono text-xs">
										{item.sku?.code ?? "—"}
									</TableCell>
									<TableCell className="text-right">
										{Number(item.orderedQty)}
									</TableCell>
									<TableCell className="text-right">
										{Number(item.receivedQty ?? 0)}
									</TableCell>
									<TableCell className="text-right">
										{item.unitPrice
											? `₹${Number(item.unitPrice).toFixed(2)}`
											: "—"}
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
