"use client";

import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

type WarehouseSettingsFormValues = {
	name: string;
	code: string;
	description: string;
	timezone: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	returnAddressLine1: string;
	returnAddressLine2: string;
	returnCity: string;
	returnState: string;
	returnZip: string;
	returnCountry: string;
};

export default function WarehouseDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { organization } = useSession();
	const queryClient = useQueryClient();
	const [hasDifferentReturnAddress, setHasDifferentReturnAddress] =
		useState(false);
	const [settingsValues, setSettingsValues] =
		useState<WarehouseSettingsFormValues>({
			name: "",
			code: "",
			description: "",
			timezone: "UTC",
			addressLine1: "",
			addressLine2: "",
			city: "",
			state: "",
			zip: "",
			country: "",
			returnAddressLine1: "",
			returnAddressLine2: "",
			returnCity: "",
			returnState: "",
			returnZip: "",
			returnCountry: "",
		});

	const { data, isPending } = useQuery({
		...orpc.warehouse.get.queryOptions({
			input: {
				organizationId: organization?.id ?? "",
				id,
				includeArchived: true,
			},
		}),
		enabled: Boolean(organization?.id && id),
	});

	const updateWarehouseMutation = useMutation(
		orpc.warehouse.update.mutationOptions(),
	);
	const deleteWarehouseMutation = useMutation(
		orpc.warehouse.delete.mutationOptions(),
	);
	const restoreWarehouseMutation = useMutation(
		orpc.warehouse.restore.mutationOptions(),
	);

	useEffect(() => {
		if (!data) {
			return;
		}

		setSettingsValues({
			name: data.name,
			code: data.code,
			description: data.description ?? "",
			timezone: data.timezone,
			addressLine1: data.address?.addressLine1 ?? "",
			addressLine2: data.address?.addressLine2 ?? "",
			city: data.address?.city ?? "",
			state: data.address?.state ?? "",
			zip: data.address?.zip ?? "",
			country: data.address?.country ?? "",
			returnAddressLine1: data.returnAddress?.addressLine1 ?? "",
			returnAddressLine2: data.returnAddress?.addressLine2 ?? "",
			returnCity: data.returnAddress?.city ?? "",
			returnState: data.returnAddress?.state ?? "",
			returnZip: data.returnAddress?.zip ?? "",
			returnCountry: data.returnAddress?.country ?? "",
		});

		setHasDifferentReturnAddress(Boolean(data.returnAddress));
	}, [data]);

	const handleSettingsSave = async () => {
		if (!data) {
			return;
		}

		if (data.status === "ARCHIVED") {
			toast.error("Archived warehouses are read-only. Restore first.");
			return;
		}

		if (!settingsValues.name.trim() || !settingsValues.code.trim()) {
			toast.error("Warehouse name and prefix are required.");
			return;
		}

		const hasAddress =
			settingsValues.addressLine1.trim().length > 0 ||
			settingsValues.addressLine2.trim().length > 0 ||
			settingsValues.city.trim().length > 0 ||
			settingsValues.state.trim().length > 0 ||
			settingsValues.zip.trim().length > 0 ||
			settingsValues.country.trim().length > 0;

		const hasReturnAddress =
			settingsValues.returnAddressLine1.trim().length > 0 ||
			settingsValues.returnAddressLine2.trim().length > 0 ||
			settingsValues.returnCity.trim().length > 0 ||
			settingsValues.returnState.trim().length > 0 ||
			settingsValues.returnZip.trim().length > 0 ||
			settingsValues.returnCountry.trim().length > 0;

		await updateWarehouseMutation.mutateAsync({
			organizationId: data.organizationId,
			id: data.id,
			name: settingsValues.name.trim(),
			code: settingsValues.code.trim(),
			description: settingsValues.description.trim() || undefined,
			timezone: settingsValues.timezone.trim() || undefined,
			address: hasAddress
				? {
						addressLine1:
							settingsValues.addressLine1.trim() || undefined,
						addressLine2:
							settingsValues.addressLine2.trim() || undefined,
						city: settingsValues.city.trim() || undefined,
						state: settingsValues.state.trim() || undefined,
						zip: settingsValues.zip.trim() || undefined,
						country: settingsValues.country.trim() || undefined,
					}
				: undefined,
			returnAddress: hasDifferentReturnAddress
				? hasReturnAddress
					? {
							addressLine1:
								settingsValues.returnAddressLine1.trim() ||
								undefined,
							addressLine2:
								settingsValues.returnAddressLine2.trim() ||
								undefined,
							city: settingsValues.returnCity.trim() || undefined,
							state:
								settingsValues.returnState.trim() || undefined,
							zip: settingsValues.returnZip.trim() || undefined,
							country:
								settingsValues.returnCountry.trim() ||
								undefined,
						}
					: undefined
				: null,
		});

		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.get.key(),
		});
		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.list.key(),
		});

		toast.success("Warehouse settings saved.");
	};

	const handleDeleteWarehouse = async () => {
		if (!data) {
			return;
		}

		if (data.status === "ARCHIVED") {
			return;
		}

		if (
			!window.confirm(
				"Archive this warehouse? It will be removed from active warehouse lists.",
			)
		) {
			return;
		}

		await deleteWarehouseMutation.mutateAsync({
			organizationId: data.organizationId,
			id: data.id,
		});

		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.list.key(),
		});

		toast.success("Warehouse archived.");
		router.push("/app/warehouse");
	};

	const handleRestoreWarehouse = async () => {
		if (!data) {
			return;
		}

		if (data.status !== "ARCHIVED") {
			return;
		}

		await restoreWarehouseMutation.mutateAsync({
			organizationId: data.organizationId,
			id: data.id,
		});

		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.get.key(),
		});
		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.list.key(),
		});

		toast.success("Warehouse restored.");
	};

	if (isPending) {
		return (
			<div className="container mx-auto max-w-7xl py-6">
				<p className="text-sm text-muted-foreground">
					Loading warehouse details...
				</p>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="container mx-auto max-w-7xl py-6">
				<p className="text-sm text-muted-foreground">
					Warehouse not found.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-6">
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						{data.name}
					</h1>
					<p className="text-sm text-muted-foreground">
						{data.code} • {data.status}
					</p>
				</div>
				{data.status === "ARCHIVED" ? (
					<Button
						onClick={() => {
							void handleRestoreWarehouse();
						}}
						disabled={restoreWarehouseMutation.isPending}
					>
						{restoreWarehouseMutation.isPending
							? "Restoring..."
							: "Restore Warehouse"}
					</Button>
				) : null}
			</div>

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

				<LayoutTabContent
					warehouseId={data.id}
					organizationId={data.organizationId}
					warehouseName={data.name}
				/>
				<SettingsTabContent
					values={settingsValues}
					onChange={(patch) => {
						setSettingsValues((current) => ({
							...current,
							...patch,
						}));
					}}
					onSave={() => {
						void handleSettingsSave();
					}}
					onDelete={() => {
						void handleDeleteWarehouse();
					}}
					saving={updateWarehouseMutation.isPending}
					deleting={deleteWarehouseMutation.isPending}
					readOnly={data.status === "ARCHIVED"}
					onRestore={() => {
						void handleRestoreWarehouse();
					}}
					restoring={restoreWarehouseMutation.isPending}
					hasDifferentReturnAddress={hasDifferentReturnAddress}
					onDifferentReturnAddressChange={(checked) => {
						setHasDifferentReturnAddress(checked);
					}}
				/>
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
