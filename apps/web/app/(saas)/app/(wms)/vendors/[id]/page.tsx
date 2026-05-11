"use client";

import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import {
	ItemsTabContent,
	PurchaseOrdersTabContent,
	SettingsTabContent,
	type PurchaseOrderRow,
	type VendorItemRow,
	type VendorProfile,
} from "./components/tab-contents";

const INITIAL_VENDOR: VendorProfile = {
	name: "AFDEWFA",
	prefix: "AFD",
	email: "sahil@gmail.com",
	phone: "1234567890",
	communicationPreference: "none",
	representativeName: "",
	accountNumber: "",
	notes: "",
	brands: "",
	shipping: {
		address1: "AWEFAWEF",
		address2: "AWEFAW",
		city: "FAWEFAWEF",
		country: "us",
		state: "al",
		zip: "10000",
	},
};

const PLACEHOLDER_ITEMS: VendorItemRow[] = [];
const PLACEHOLDER_PURCHASE_ORDERS: PurchaseOrderRow[] = [];

export default function VendorDetailPage() {
	const [vendor, setVendor] = useState(INITIAL_VENDOR);
	const [selectedItem, setSelectedItem] = useState("item-001");
	const [vendorSku, setVendorSku] = useState("");
	const [unitCost, setUnitCost] = useState("9.999");
	const [step, setStep] = useState("1");
	const [itemNote, setItemNote] = useState("");
	const [itemSearch, setItemSearch] = useState("");
	const [purchaseOrderSearch, setPurchaseOrderSearch] = useState("");

	const filteredItems = useMemo(() => {
		if (!itemSearch.trim()) {
			return PLACEHOLDER_ITEMS;
		}

		const query = itemSearch.toLowerCase();
		return PLACEHOLDER_ITEMS.filter((row) => {
			return (
				row.item.toLowerCase().includes(query) ||
				row.sku.toLowerCase().includes(query) ||
				row.vendorSku.toLowerCase().includes(query)
			);
		});
	}, [itemSearch]);

	const filteredPurchaseOrders = useMemo(() => {
		if (!purchaseOrderSearch.trim()) {
			return PLACEHOLDER_PURCHASE_ORDERS;
		}

		const query = purchaseOrderSearch.toLowerCase();
		return PLACEHOLDER_PURCHASE_ORDERS.filter((row) => {
			return (
				row.id.toLowerCase().includes(query) ||
				row.status.toLowerCase().includes(query) ||
				row.warehouse.toLowerCase().includes(query)
			);
		});
	}, [purchaseOrderSearch]);

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex w-full justify-between items-center">
				<div className="mb-8">
					<h1 className="font-semibold text-2xl tracking-tight">
						Settings
					</h1>
					<p className="mt-2 text-muted-foreground">
						Manage account preferences, notifications, tokens, and
						webhooks.
					</p>
				</div>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Delete vendor"
						>
							<Trash2Icon className="size-4" />
						</Button>
						<Button>Update</Button>
					</div>
				</div>
			</div>
			<Tabs defaultValue="items" className="flex flex-col">
				<TabsList
					variant="line"
					className="justify-start gap-2 overflow-x-auto p-0"
				>
					<TabsTrigger value="items" className="px-3">
						Items
					</TabsTrigger>
					<TabsTrigger value="purchase-orders" className="px-3">
						Purchase Orders
					</TabsTrigger>
					<TabsTrigger value="settings" className="px-3">
						Settings
					</TabsTrigger>
				</TabsList>

				<ItemsTabContent
					selectedItem={selectedItem}
					setSelectedItem={setSelectedItem}
					vendorSku={vendorSku}
					setVendorSku={setVendorSku}
					unitCost={unitCost}
					setUnitCost={setUnitCost}
					step={step}
					setStep={setStep}
					itemNote={itemNote}
					setItemNote={setItemNote}
					itemSearch={itemSearch}
					setItemSearch={setItemSearch}
					filteredItems={filteredItems}
				/>
				<PurchaseOrdersTabContent
					purchaseOrderSearch={purchaseOrderSearch}
					setPurchaseOrderSearch={setPurchaseOrderSearch}
					filteredPurchaseOrders={filteredPurchaseOrders}
				/>
				<SettingsTabContent vendor={vendor} setVendor={setVendor} />
			</Tabs>
		</div>
	);
}
