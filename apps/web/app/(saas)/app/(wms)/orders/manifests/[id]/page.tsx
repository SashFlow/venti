"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function ManifestDetailPage() {
	const params = useParams<{ id: string }>();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const queryClient = useQueryClient();

	const query = useQuery({
		...orpc.orders.getShipment.queryOptions({
			input: { organizationId, shipmentId: params.id },
		}),
		enabled: Boolean(organizationId && params.id),
	});

	const updateMutation = useMutation(
		orpc.orders.updateShipmentStatus.mutationOptions(),
	);

	const shipment = query.data?.shipment;

	if (query.isLoading) {
		return (
			<div className="container max-w-4xl py-8 mx-auto text-sm text-muted-foreground">
				Loading...
			</div>
		);
	}

	if (!shipment) {
		return (
			<div className="container max-w-4xl py-8 mx-auto">
				<p className="text-sm text-muted-foreground">
					Shipment not found.
				</p>
				<Button variant="link" asChild className="px-0 mt-2">
					<Link href="/app/orders">← Back to Orders</Link>
				</Button>
			</div>
		);
	}

	const handleShip = async () => {
		try {
			await updateMutation.mutateAsync({
				organizationId,
				shipmentId: shipment.id,
				status: "SHIPPED",
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.getShipment.key(),
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listManifests.key(),
			});
			toast.success("Shipment marked as shipped.");
		} catch {
			toast.error("Failed to update shipment status.");
		}
	};

	const handleDeliver = async () => {
		try {
			await updateMutation.mutateAsync({
				organizationId,
				shipmentId: shipment.id,
				status: "DELIVERED",
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.getShipment.key(),
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.listManifests.key(),
			});
			toast.success("Shipment marked as delivered.");
		} catch {
			toast.error("Failed to update shipment status.");
		}
	};

	const title =
		shipment.trackingNumber ?? `Shipment ${shipment.id.slice(0, 8)}`;

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
							{title}
						</h1>
						<Badge variant="outline">{shipment.status}</Badge>
					</div>
					<p className="text-sm text-muted-foreground">
						Shipment / Manifest
					</p>
				</div>
				<div className="flex gap-2">
					{(shipment.status === "PENDING" ||
						shipment.status === "PACKED") && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleShip}
							disabled={updateMutation.isPending}
						>
							<SendIcon className="mr-1.5 size-4" />
							Mark Shipped
						</Button>
					)}
					{shipment.status === "SHIPPED" && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleDeliver}
							disabled={updateMutation.isPending}
						>
							Mark Delivered
						</Button>
					)}
				</div>
			</div>

			<Card className="border rounded-2xl">
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Shipment Info</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-2 text-sm">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Warehouse</span>
						<span className="font-medium">
							{shipment.warehouse?.name ?? "—"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Sales Order</span>
						<span>
							{shipment.salesOrder ? (
								<Link
									href={`/app/orders/outbound/${shipment.salesOrder.id}`}
									className="underline text-primary"
								>
									{shipment.salesOrder.orderNumber}
								</Link>
							) : (
								"—"
							)}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Customer</span>
						<span>
							{shipment.salesOrder?.customer?.name ?? "—"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Carrier</span>
						<span>{shipment.carrier ?? "—"}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Tracking #</span>
						<span className="font-mono text-xs">
							{shipment.trackingNumber ?? "—"}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Shipped At</span>
						<span>
							{shipment.shippedAt
								? new Date(shipment.shippedAt).toLocaleString()
								: "—"}
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
