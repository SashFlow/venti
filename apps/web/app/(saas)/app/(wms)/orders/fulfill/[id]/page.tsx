"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { useSession } from "@saas/auth/hooks/use-session";
import { parseRoutePlan } from "@saas/warehouse/lib/route-viz-types";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, MapIcon, Smartphone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_LABEL: Record<string, string> = {
	SINGLE_ORDER: "Single Order",
	BATCH: "Batch",
	ZONE: "Zone",
	CLUSTER: "Cluster",
};

type WaveLine = {
	id: string;
	qtyToPick: number | string;
	qtyPicked?: number | string | null;
	pickSequence?: number | null;
	pickerLabel?: string | null;
	cartId?: string | null;
	zoneCode?: string | null;
	location?: { code?: string } | null;
	salesOrderLine?: {
		lineNumber?: number | null;
		sku?: { sku?: string; name?: string } | null;
		salesOrder?: { orderNumber?: string } | null;
	} | null;
};

type WaveSalesOrder = {
	id: string;
	orderNumber: string;
	status: string;
	customerName?: string | null;
};

export default function WaveDetailPage() {
	const params = useParams<{ id: string }>();
	const queryClient = useQueryClient();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const [pickerCount, setPickerCount] = useState("3");
	const [releaseOpen, setReleaseOpen] = useState(false);

	const query = useQuery({
		...orpc.orders.getWave.queryOptions({
			input: { organizationId, waveId: params.id },
		}),
		enabled: Boolean(organizationId && params.id),
	});

	const releaseMutation = useMutation(
		orpc.orders.releaseWave.mutationOptions(),
	);

	const wave = query.data?.wave;
	const lines = (wave?.lines ?? []) as WaveLine[];
	const salesOrders = (wave?.salesOrders ?? []) as WaveSalesOrder[];
	const routePlan = parseRoutePlan(wave?.routePlan);

	const handleRelease = async () => {
		const count = Number(pickerCount);
		if (!count || count < 1) {
			toast.error("Picker count must be at least 1.");
			return;
		}
		try {
			const result = await releaseMutation.mutateAsync({
				organizationId,
				waveId: params.id,
				pickerCount: count,
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.getWave.key(),
			});
			setReleaseOpen(false);
			toast.success(
				`Wave released — ${result.routePlan.savingsPercent}% travel saved`,
			);
		} catch {
			toast.error("Failed to release wave.");
		}
	};

	if (query.isLoading) {
		return (
			<div className="container max-w-5xl py-8 mx-auto text-sm text-muted-foreground">
				Loading...
			</div>
		);
	}

	if (!wave) {
		return (
			<div className="container max-w-5xl py-8 mx-auto">
				<p className="text-sm text-muted-foreground">Wave not found.</p>
				<Button variant="link" asChild className="px-0 mt-2">
					<Link href="/app/orders">← Back to Orders</Link>
				</Button>
			</div>
		);
	}

	const totalToPick = lines.reduce((s, l) => s + Number(l.qtyToPick), 0);
	const totalPicked = lines.reduce(
		(s, l) => s + Number(l.qtyPicked ?? 0),
		0,
	);
	const warehouseId = wave.warehouse?.id;

	return (
		<div className="container max-w-5xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3 flex-wrap">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div className="flex-1 min-w-[200px]">
					<div className="flex items-center gap-2 flex-wrap">
						<h1 className="text-2xl font-semibold tracking-tight">
							{wave.waveNumber}
						</h1>
						<Badge variant="outline">{wave.status}</Badge>
						<Badge variant="secondary">
							{TYPE_LABEL[wave.type] ?? wave.type}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						Fulfillment Wave
					</p>
				</div>
				{wave.status === "CREATED" && (
					<Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
						<DialogTrigger asChild>
							<Button>Release wave</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Release wave</DialogTitle>
							</DialogHeader>
							<div className="space-y-2 py-2">
								<Label htmlFor="pickerCount">Picker count</Label>
								<Input
									id="pickerCount"
									type="number"
									min={1}
									max={10}
									value={pickerCount}
									onChange={(e) =>
										setPickerCount(e.target.value)
									}
								/>
								<p className="text-xs text-muted-foreground">
									Optimizes pick routes and assigns pickers to
									zones.
								</p>
							</div>
							<DialogFooter>
								<Button
									onClick={handleRelease}
									disabled={releaseMutation.isPending}
								>
									{releaseMutation.isPending
										? "Releasing..."
										: "Release & optimize"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
				{routePlan && warehouseId && (
					<>
						<Button variant="outline" asChild>
							<Link
								href={`/app/warehouse/${warehouseId}?tab=layout&view=3d&waveId=${wave.id}`}
							>
								<MapIcon className="size-4 mr-2" />
								View routes in 3D
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link
								href={`/operator/pick/${wave.id}?picker=1`}
							>
								<Smartphone className="size-4 mr-2" />
								Operator mode
							</Link>
						</Button>
					</>
				)}
			</div>

			{routePlan && (
				<Card className="border rounded-2xl border-primary/30">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Route optimization
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap items-baseline gap-2 text-lg">
							<span className="text-muted-foreground line-through">
								{routePlan.naiveDistanceM}m naive
							</span>
							<span className="font-semibold">
								→ {routePlan.optimizedDistanceM}m optimized
							</span>
							<Badge className="bg-green-600">
								−{routePlan.savingsPercent}%
							</Badge>
						</div>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Picker</TableHead>
									<TableHead>Zone</TableHead>
									<TableHead>Cart</TableHead>
									<TableHead className="text-right">
										Lines
									</TableHead>
									<TableHead className="text-right">
										Distance
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{routePlan.pickers.map((p) => (
									<TableRow key={p.label}>
										<TableCell>
											<span
												className="inline-block size-2 rounded-full mr-2"
												style={{
													backgroundColor: p.color,
												}}
											/>
											{p.label}
										</TableCell>
										<TableCell className="font-mono text-xs">
											{p.zoneCode}
										</TableCell>
										<TableCell>{p.cartId}</TableCell>
										<TableCell className="text-right">
											{p.lineCount}
										</TableCell>
										<TableCell className="text-right">
											{p.distanceM}m
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						{routePlan.warnings?.map((w) => (
							<p
								key={w}
								className="text-xs text-amber-600 dark:text-amber-400"
							>
								{w}
							</p>
						))}
					</CardContent>
				</Card>
			)}

			{routePlan && (
				<div className="grid gap-4 md:grid-cols-3">
					{routePlan.pickers.map((picker) => (
						<Card
							key={picker.label}
							className="border rounded-2xl"
							style={{
								borderTopWidth: 3,
								borderTopColor: picker.color,
							}}
						>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm">
									{picker.label} · {picker.cartId}
								</CardTitle>
								<p className="text-xs text-muted-foreground">
									{picker.zoneCode} · {picker.distanceM}m
								</p>
							</CardHeader>
							<CardContent className="space-y-1 max-h-48 overflow-auto">
								{picker.stops.map((stop) => (
									<div
										key={stop.lineId}
										className="text-xs flex gap-2"
									>
										<span className="text-muted-foreground w-4">
											{stop.sequence}
										</span>
										<span className="font-mono">
											{stop.locationCode}
										</span>
										<span className="truncate">
											{stop.skuCode}
										</span>
									</div>
								))}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<div className="grid gap-4 md:grid-cols-2">
				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Wave Info</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Warehouse
							</span>
							<span className="font-medium">
								{wave.warehouse?.name ?? "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Released At
							</span>
							<span>
								{wave.releasedAt
									? new Date(wave.releasedAt).toLocaleString()
									: "—"}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Released By
							</span>
							<span>{wave.releasedBy?.name ?? "—"}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Created At
							</span>
							<span>
								{new Date(wave.createdAt).toLocaleString()}
							</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border rounded-2xl">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">
							Pick Summary
						</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Sales Orders
							</span>
							<span className="font-medium">
								{salesOrders.length}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Pick Lines
							</span>
							<span className="font-medium">{lines.length}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Total Qty to Pick
							</span>
							<span>{totalToPick}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Progress
							</span>
							<span>
								{totalToPick > 0
									? `${Math.round((totalPicked / totalToPick) * 100)}%`
									: "—"}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border rounded-2xl">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Pick Lines</CardTitle>
				</CardHeader>
				<CardContent className="p-0 overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Seq</TableHead>
								<TableHead>Order #</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Bin</TableHead>
								<TableHead>Zone</TableHead>
								<TableHead>Picker</TableHead>
								<TableHead>Cart</TableHead>
								<TableHead className="text-right">
									To Pick
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{lines.map((l) => (
								<TableRow key={l.id}>
									<TableCell className="pl-6">
										{l.pickSequence ?? "—"}
									</TableCell>
									<TableCell className="text-xs">
										{l.salesOrderLine?.salesOrder
											?.orderNumber ?? "—"}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{l.salesOrderLine?.sku?.sku ?? "—"}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{l.location?.code ?? "—"}
									</TableCell>
									<TableCell className="text-xs">
										{l.zoneCode ?? "—"}
									</TableCell>
									<TableCell className="text-xs">
										{l.pickerLabel ?? "—"}
									</TableCell>
									<TableCell className="text-xs">
										{l.cartId ?? "—"}
									</TableCell>
									<TableCell className="text-right">
										{Number(l.qtyToPick)}
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
