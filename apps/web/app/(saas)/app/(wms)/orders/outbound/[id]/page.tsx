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

	const items = order.items ?? [];

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
								{order.customer?.name ?? "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Ordered At
							</span>
							<span>
								{order.orderedAt
									? new Date(
											order.orderedAt,
										).toLocaleDateString()
									: "—"}
							</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Shipment</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-2 text-sm">
						{order.shipment ? (
							<>
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										Status
									</span>
									<Badge variant="outline">
										{order.shipment.status}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										Tracking #
									</span>
									<span className="font-mono text-xs">
										{order.shipment.trackingNumber ?? "—"}
									</span>
								</div>
							</>
						) : (
							<p className="text-muted-foreground">
								No shipment created yet.
							</p>
						)}
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Lines
							</span>
							<span className="font-medium">{items.length}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Ordered
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
								Total Picked
							</span>
							<span>
								{items.reduce(
									(sum, item) =>
										sum + Number(item.pickedQty ?? 0),
									0,
								)}
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
									Allocated
								</TableHead>
								<TableHead className="text-right">
									Picked
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
										{Number(item.allocatedQty ?? 0)}
									</TableCell>
									<TableCell className="text-right">
										{Number(item.pickedQty ?? 0)}
									</TableCell>
								</TableRow>
							))}
							{items.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center text-muted-foreground py-4"
									>
										No line items.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
