"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import {
	FulfillTabContent,
	InboundTabContent,
	ManifestTabContent,
	OutboundTabContent,
	TransferTabContent,
} from "./components/tab-contents";

export default function OrdersPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="space-y-1">
				<h1 className="text-3xl font-semibold tracking-tight">
					Orders
				</h1>
				<p className="text-muted-foreground">
					Manage inbound, outbound, transfer, manifest, and
					fulfillment operations.
				</p>
			</div>

			<Tabs defaultValue="inbound" className="space-y-6 flex flex-col">
				<TabsList
					variant="default"
					className="h-auto w-full justify-start overflow-x-auto"
				>
					<TabsTrigger value="inbound" className="h-10 px-3">
						Inbound
					</TabsTrigger>
					<TabsTrigger value="outbound" className="h-10 px-3">
						Outbound
					</TabsTrigger>
					<TabsTrigger value="transfer" className="h-10 px-3">
						Transfer
					</TabsTrigger>
					<TabsTrigger value="manifest" className="h-10 px-3">
						Manifest
					</TabsTrigger>
					<TabsTrigger value="fulfill" className="h-10 px-3">
						Fulfill
					</TabsTrigger>
				</TabsList>

				<InboundTabContent organizationId={organizationId} />
				<OutboundTabContent organizationId={organizationId} />
				<TransferTabContent organizationId={organizationId} />
				<ManifestTabContent organizationId={organizationId} />
				<FulfillTabContent organizationId={organizationId} />
			</Tabs>
		</div>
	);
}
