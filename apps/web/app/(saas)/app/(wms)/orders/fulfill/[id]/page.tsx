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

const TYPE_LABEL: Record<string, string> = {
	SINGLE_ORDER: "Single Order",
	BATCH: "Batch",
	ZONE: "Zone",
	CLUSTER: "Cluster",
};

export default function WaveDetailPage() {
	const params = useParams<{ id: string }>();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const query = useQuery({
		...orpc.orders.getWave.queryOptions({
			input: { organizationId, waveId: params.id },
		}),
		enabled: Boolean(organizationId && params.id),
	});

	const wave = query.data?.wave;

	if (query.isLoading) {
		return <div className="container max-w-4xl py-8 mx-auto text-sm text-muted-foreground">Loading...</div>;
	}

	if (!wave) {
		return (
			<div className="container max-w-4xl py-8 mx-auto">
				<p className="text-sm text-muted-foreground">Wave not found.</p>
				<Button variant="link" asChild className="px-0 mt-2">
					<Link href="/app/orders">← Back to Orders</Link>
				</Button>
			</div>
		);
	}

	const totalToPick = wave.lines.reduce((s, l) => s + Number(l.qtyToPick), 0);
	const totalPicked = wave.lines.reduce((s, l) => s + Number(l.qtyPicked ?? 0), 0);

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
						<h1 className="text-2xl font-semibold tracking-tight">{wave.waveNumber}</h1>
						<Badge variant="outline">{wave.status}</Badge>
						<Badge variant="secondary">{TYPE_LABEL[wave.type] ?? wave.type}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">Fulfillment Wave</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Wave Info</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Warehouse</span>
							<span className="font-medium">{wave.warehouse?.name ?? "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Released At</span>
							<span>{wave.releasedAt ? new Date(wave.releasedAt).toLocaleString() : "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Completed At</span>
							<span>{wave.completedAt ? new Date(wave.completedAt).toLocaleString() : "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Released By</span>
							<span>{wave.releasedBy?.name ?? "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Created At</span>
							<span>{new Date(wave.createdAt).toLocaleString()}</span>
						</div>
						{wave.notes && (
							<div className="pt-2 border-t">
								<p className="text-muted-foreground text-xs mb-1">Notes</p>
								<p>{wave.notes}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Pick Summary</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Sales Orders</span>
							<span className="font-medium">{wave.salesOrders.length}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total Pick Lines</span>
							<span className="font-medium">{wave.lines.length}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total Qty to Pick</span>
							<span>{totalToPick}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Total Qty Picked</span>
							<span>{totalPicked}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Progress</span>
							<span>{totalToPick > 0 ? `${Math.round((totalPicked / totalToPick) * 100)}%` : "—"}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border rounded-2xl">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Sales Orders in Wave</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Order #</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{wave.salesOrders.map((o) => (
								<TableRow key={o.id}>
									<TableCell className="pl-6">
										<Link href={`/app/orders/outbound/${o.id}`} className="underline text-primary text-sm">
											{o.orderNumber}
										</Link>
									</TableCell>
									<TableCell>{o.customerName ?? "—"}</TableCell>
									<TableCell>
										<Badge variant="outline" className="text-xs">{o.status}</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card className="border rounded-2xl">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Pick Lines</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Order #</TableHead>
								<TableHead>Line</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Product</TableHead>
								<TableHead className="text-right">To Pick</TableHead>
								<TableHead className="text-right">Picked</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{wave.lines.map((l) => (
								<TableRow key={l.id}>
									<TableCell className="pl-6 text-xs">
										{l.salesOrderLine?.salesOrder?.orderNumber ?? "—"}
									</TableCell>
									<TableCell>{l.salesOrderLine?.lineNumber ?? "—"}</TableCell>
									<TableCell className="font-mono text-xs">{l.salesOrderLine?.sku?.sku ?? "—"}</TableCell>
									<TableCell>{l.salesOrderLine?.sku?.name ?? "—"}</TableCell>
									<TableCell className="text-right">{Number(l.qtyToPick)}</TableCell>
									<TableCell className="text-right">{Number(l.qtyPicked ?? 0)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
