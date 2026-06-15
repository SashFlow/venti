"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, PackageOpen, ScanLine, Smartphone } from "lucide-react";
import Link from "next/link";

export default function OperatorHomePage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	const { data: inbound } = useQuery({
		...orpc.orders.listInbound.queryOptions({
			input: {
				organizationId,
				limit: 10,
				status: ["APPROVED", "IN_TRANSIT", "PARTIAL"],
			},
		}),
		enabled: Boolean(organizationId),
	});

	const openPos =
		inbound?.orders?.filter(
			(o: { status: string }) =>
				o.status === "APPROVED" ||
				o.status === "IN_TRANSIT" ||
				o.status === "PARTIAL",
		) ?? [];

	return (
		<div className="mx-auto max-w-lg space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Smartphone className="size-5" />
						Operator PWA
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground space-y-3">
					<p>
						Floor pick and receive workflows. Install from your browser
						menu (Add to Home Screen) for tablet use.
					</p>
					<div className="grid gap-2">
						<Button variant="outline" asChild className="justify-start gap-2">
							<Link href="/app/orders?tab=fulfill">
								<ClipboardList className="size-4" />
								Released waves (admin)
							</Link>
						</Button>
						<Button variant="outline" asChild className="justify-start gap-2">
							<Link href="/operator/scan">
								<ScanLine className="size-4" />
								Scan lookup
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm flex items-center gap-2">
						<PackageOpen className="size-4" />
						Open purchase orders
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{openPos.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No open POs. Create inbound orders in admin.
						</p>
					) : (
						openPos.slice(0, 5).map(
							(po: {
								id: string;
								poNumber: string;
								supplier?: { name: string };
							}) => (
								<Button
									key={po.id}
									variant="secondary"
									className="w-full justify-between"
									asChild
								>
									<Link href={`/operator/receive/${po.id}`}>
										<span>{po.poNumber}</span>
										<span className="text-xs text-muted-foreground">
											{po.supplier?.name ?? "Receive"}
										</span>
									</Link>
								</Button>
							),
						)
					)}
				</CardContent>
			</Card>
		</div>
	);
}
