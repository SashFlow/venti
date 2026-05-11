"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	BinReplenishmentTabContent,
	BundlesTabContent,
	CycleCountTabContent,
	InventoryTabContent,
	LayoutTabContent,
	LogsTabContent,
	OrdersTabContent,
	ReplenishInventoryTabContent,
	SettingsTabContent,
} from "./components/tab-contents";

export default function WarehouseDetailsPage() {
	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-6">
			<Tabs defaultValue="settings" className="space-y-4">
				<TabsList
					variant="line"
					className="h-auto justify-start gap-2 overflow-x-auto rounded-none px-0 pb-0"
				>
					<TabsTrigger
						value="layout"
						className="px-3 py-2 text-sm font-medium"
					>
						Layout
					</TabsTrigger>
					<TabsTrigger
						value="settings"
						className="px-3 py-2 text-sm font-medium"
					>
						Settings
					</TabsTrigger>
					<TabsTrigger
						value="inventory"
						className="px-3 py-2 text-sm font-medium"
					>
						Inventory
					</TabsTrigger>
					<TabsTrigger
						value="cycle-count"
						className="px-3 py-2 text-sm font-medium"
					>
						Cycle Count
					</TabsTrigger>
					<TabsTrigger
						value="logs"
						className="px-3 py-2 text-sm font-medium"
					>
						Logs
					</TabsTrigger>
					<TabsTrigger
						value="replenish-inventory"
						className="px-3 py-2 text-sm font-medium"
					>
						Replenish Inventory
					</TabsTrigger>
					<TabsTrigger
						value="bin-replenishment"
						className="px-3 py-2 text-sm font-medium"
					>
						Bin Replenishment
					</TabsTrigger>
					<TabsTrigger
						value="bundles"
						className="px-3 py-2 text-sm font-medium"
					>
						Bundles
					</TabsTrigger>
					<TabsTrigger
						value="orders"
						className="px-3 py-2 text-sm font-medium"
					>
						Orders
					</TabsTrigger>
				</TabsList>

				<LayoutTabContent />
				<SettingsTabContent />
				<InventoryTabContent />
				<CycleCountTabContent />
				<LogsTabContent />
				<ReplenishInventoryTabContent />
				<BinReplenishmentTabContent />
				<BundlesTabContent />
				<OrdersTabContent />
			</Tabs>
		</div>
	);
}
