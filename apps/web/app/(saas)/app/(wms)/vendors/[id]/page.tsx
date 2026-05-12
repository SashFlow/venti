"use client";

import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { buildVendorMetadata, readVendorMetadata } from "../lib/vendor-utils";
import { useVendorsContext } from "../lib/vendors-context";
import {
	ItemsTabContent,
	PurchaseOrdersTabContent,
	SettingsTabContent,
	type VendorProfile,
} from "./components/tab-contents";

const EMPTY_VENDOR: VendorProfile = {
	name: "",
	prefix: "",
	email: "",
	phone: "",
	communicationPreference: "none",
	representativeName: "",
	accountNumber: "",
	notes: "",
	brands: "",
	shipping: {
		address1: "",
		address2: "",
		city: "",
		country: "us",
		state: "al",
		zip: "",
	},
};

export default function VendorDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { confirm } = useConfirmationAlert();
	const { organizationId, invalidateVendors } = useVendorsContext();
	const vendorId = params.id as string;

	const [vendor, setVendor] = useState(EMPTY_VENDOR);

	const { data, isPending } = useQuery({
		...orpc.masterData.suppliers.get.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				id: vendorId,
			},
		}),
		enabled: Boolean(organizationId && vendorId),
	});

	const updateSupplierMutation = useMutation(
		orpc.masterData.suppliers.update.mutationOptions(),
	);
	const deleteSupplierMutation = useMutation(
		orpc.masterData.suppliers.delete.mutationOptions(),
	);

	useEffect(() => {
		const supplier = data?.supplier;
		if (!supplier) {
			return;
		}

		const metadata = readVendorMetadata(supplier.metadata);
		setVendor({
			name: supplier.name,
			prefix: supplier.code,
			email: supplier.email ?? "",
			phone: supplier.phone ?? "",
			communicationPreference: metadata.communicationPreference || "none",
			representativeName: metadata.representativeName,
			accountNumber: metadata.accountNumber,
			notes: metadata.notes,
			brands: metadata.brands,
			shipping: {
				address1: metadata.address1,
				address2: metadata.address2,
				city: metadata.city,
				country: metadata.country || "us",
				state: metadata.state || "al",
				zip: metadata.zip,
			},
		});
	}, [data?.supplier]);

	const saveVendor = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		if (!vendor.name.trim() || !vendor.prefix.trim()) {
			toast.error("Vendor name and prefix are required.");
			return;
		}

		await toast.promise(
			updateSupplierMutation.mutateAsync({
				organizationId,
				id: vendorId,
				name: vendor.name.trim(),
				code: vendor.prefix.trim().toUpperCase(),
				email: vendor.email.trim() || undefined,
				phone: vendor.phone.trim() || undefined,
				metadata: buildVendorMetadata({
					accountNumber: vendor.accountNumber,
					representativeName: vendor.representativeName,
					communicationPreference: vendor.communicationPreference,
					notes: vendor.notes,
					brands: vendor.brands,
					address1: vendor.shipping.address1,
					address2: vendor.shipping.address2,
					city: vendor.shipping.city,
					state: vendor.shipping.state,
					zip: vendor.shipping.zip,
					country: vendor.shipping.country,
				}),
			}),
			{
				loading: "Updating vendor...",
				success: "Vendor updated.",
				error: "Failed to update vendor.",
			},
		);

		await invalidateVendors();
	};

	const deleteVendor = () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		confirm({
			title: "Delete vendor",
			message: "This action cannot be undone.",
			destructive: true,
			onConfirm: async () => {
				await deleteSupplierMutation.mutateAsync({
					organizationId,
					id: vendorId,
				});

				await invalidateVendors();
				toast.success("Vendor deleted.");
				router.push("/app/vendors");
			},
		});
	};

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			{isPending && (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2Icon className="size-4 animate-spin" />
					Loading vendor...
				</div>
			)}
			<div className="flex w-full justify-between items-center">
				<div className="mb-8">
					<h1 className="font-semibold text-2xl tracking-tight">
						{vendor.name || "Vendor"}
					</h1>
					<p className="mt-2 text-muted-foreground">
						Review supplier coverage, purchase activity, and vendor
						settings.
					</p>
				</div>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							aria-label="Delete vendor"
							onClick={deleteVendor}
						>
							<Trash2Icon className="size-4" />
						</Button>
						<Button onClick={() => void saveVendor()}>
							Update
						</Button>
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

				<ItemsTabContent vendorName={vendor.name || "This vendor"} />
				<PurchaseOrdersTabContent
					vendorName={vendor.name || "This vendor"}
				/>
				<SettingsTabContent vendor={vendor} setVendor={setVendor} />
			</Tabs>
		</div>
	);
}
