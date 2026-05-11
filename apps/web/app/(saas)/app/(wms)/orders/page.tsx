"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	FulfillTabContent,
	InboundTabContent,
	ManifestTabContent,
	OutboundTabContent,
	TransferTabContent,
} from "./components/tab-contents";

export default function OrdersPage() {
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
					variant="line"
					className="justify-start gap-2 overflow-x-auto p-0"
				>
					<TabsTrigger value="inbound" className="px-3">
						Inbound
					</TabsTrigger>
					<TabsTrigger value="outbound" className="px-3">
						Outbound
					</TabsTrigger>
					<TabsTrigger value="transfer" className="px-3">
						Transfer
					</TabsTrigger>
					<TabsTrigger value="manifest" className="px-3">
						Manifest
					</TabsTrigger>
					<TabsTrigger value="fulfill" className="px-3">
						Fulfill
					</TabsTrigger>
				</TabsList>

				<InboundTabContent />
				<OutboundTabContent />
				<TransferTabContent />
				<ManifestTabContent />
				<FulfillTabContent />
			</Tabs>
		</div>
	);
}
