"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function TransferDetailPage() {
	const params = useParams<{ id: string }>();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const queryClient = useQueryClient();

	const query = useQuery({
		...orpc.orders.getTransfer.queryOptions({
			input: { organizationId, transferId: params.id },
		}),
		enabled: Boolean(organizationId && params.id),
	});

	const completeMutation = useMutation(orpc.orders.completeTransfer.mutationOptions());

	const transfer = query.data?.transfer;

	if (query.isLoading) {
		return <div className="container max-w-2xl py-8 mx-auto text-sm text-muted-foreground">Loading...</div>;
	}

	if (!transfer) {
		return (
			<div className="container max-w-2xl py-8 mx-auto">
				<p className="text-sm text-muted-foreground">Transfer not found.</p>
				<Button variant="link" asChild className="px-0 mt-2">
					<Link href="/app/orders">← Back to Orders</Link>
				</Button>
			</div>
		);
	}

	const handleComplete = async () => {
		try {
			await completeMutation.mutateAsync({ organizationId, transferId: transfer.id });
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.getTransfer.key(),
			});
			await queryClient.invalidateQueries({ queryKey: orpc.orders.listTransfers.key() });
			toast.success("Transfer marked as complete.");
		} catch {
			toast.error("Failed to complete transfer.");
		}
	};

	return (
		<div className="container max-w-2xl py-8 mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/orders">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-semibold tracking-tight">
							{transfer.referenceNumber ?? transfer.id.slice(0, 10)}
						</h1>
						<Badge variant="outline">{transfer.status}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">Internal Transfer</p>
				</div>
				{transfer.status !== "COMPLETED" && transfer.status !== "CANCELLED" && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleComplete}
						disabled={completeMutation.isPending}
					>
						<CheckCircleIcon className="mr-1.5 size-4" />
						{completeMutation.isPending ? "Completing..." : "Mark Complete"}
					</Button>
				)}
			</div>

			<Card className="border rounded-2xl">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Transfer Details</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-2 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Warehouse</span>
						<span className="font-medium">{transfer.warehouse?.name ?? "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">SKU</span>
						<span>{transfer.inventoryItem?.sku?.name ?? "—"} ({transfer.inventoryItem?.sku?.sku ?? "—"})</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Quantity</span>
						<span className="font-medium">{Number(transfer.quantity)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">From Storage Unit</span>
						<span className="font-mono text-xs">{transfer.fromStorageUnit?.code ?? "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">To Storage Unit</span>
						<span className="font-mono text-xs">{transfer.toStorageUnit?.code ?? "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Started At</span>
						<span>{transfer.startedAt ? new Date(transfer.startedAt).toLocaleString() : "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Completed At</span>
						<span>{transfer.completedAt ? new Date(transfer.completedAt).toLocaleString() : "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Performed By</span>
						<span>{transfer.performedBy?.name ?? "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Created At</span>
						<span>{new Date(transfer.createdAt).toLocaleString()}</span>
					</div>
					{transfer.notes && (
						<div className="pt-2 border-t">
							<p className="text-muted-foreground text-xs mb-1">Notes</p>
							<p>{transfer.notes}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
