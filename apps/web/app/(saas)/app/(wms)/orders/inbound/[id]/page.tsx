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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

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
	const queryClient = useQueryClient();

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

	const totalCost = order.lines.reduce(
		(sum, l) => sum + Number(l.unitCost ?? 0) * Number(l.orderedQty),
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
								{order.expectedDate
									? new Date(
											order.expectedDate,
										).toLocaleDateString()
									: "—"}
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
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Approved By
							</span>
							<span>{order.approvedBy?.name ?? "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Closed At
							</span>
							<span>
								{order.closedAt
									? new Date(
											order.closedAt,
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
							<span className="font-medium">
								{order.lines.length}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Ordered Qty
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
								Total Received Qty
							</span>
							<span>
								{order.lines.reduce(
									(s, l) => s + Number(l.receivedQty ?? 0),
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
									? `$${totalCost.toFixed(2)}`
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
									Received
								</TableHead>
								<TableHead className="text-right">
									Unit Cost
								</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Exp. Date</TableHead>
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
										{Number(line.receivedQty ?? 0)}
									</TableCell>
									<TableCell className="text-right">
										{line.unitCost
											? `$${Number(line.unitCost).toFixed(2)}`
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
									<TableCell className="text-xs text-muted-foreground">
										{line.expectedDate
											? new Date(
													line.expectedDate,
												).toLocaleDateString()
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
