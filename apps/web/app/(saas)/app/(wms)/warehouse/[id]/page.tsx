"use client";

import { Button } from "@repo/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LocationsTabContent } from "./components/locations-tab-content";
import {
	CycleCountTabContent,
	InventoryTabContent,
	LayoutTabContent,
	LogsTabContent,
	SettingsTabContent,
	type WarehouseSettingsFormValues,
} from "./components/tab-contents";

export default function WarehouseDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { organization } = useSession();
	const queryClient = useQueryClient();
	const [settingsValues, setSettingsValues] =
		useState<WarehouseSettingsFormValues>({
			name: "",
			code: "",
			timezone: "UTC",
			sameReturn: true,
			address: {
				line1: "",
				line2: "",
				city: "",
				state: "",
				zip: "",
				country: "",
			},
			returnAddress: {
				line1: "",
				line2: "",
				city: "",
				state: "",
				zip: "",
				country: "",
			},
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
			timezone: data.timezone,
			sameReturn: data.sameReturn ?? true,
			address: {
				line1: data.address?.addressLine1 ?? "",
				line2: data.address?.addressLine2 ?? "",
				city: data.address?.city ?? "",
				state: data.address?.state ?? "",
				zip: data.address?.zip ?? "",
				country: data.address?.country ?? "",
			},
			returnAddress: {
				line1: data.return?.addressLine1 ?? "",
				line2: data.return?.addressLine2 ?? "",
				city: data.return?.city ?? "",
				state: data.return?.state ?? "",
				zip: data.return?.zip ?? "",
				country: data.return?.country ?? "",
			},
		});
	}, [data]);

	const handleSettingsSave = async () => {
		if (!data) {
			return;
		}

		if (data.status === "INACTIVE") {
			toast.error("Archived warehouses are read-only. Restore first.");
			return;
		}

		if (!settingsValues.name.trim() || !settingsValues.code.trim()) {
			toast.error("Warehouse name and prefix are required.");
			return;
		}

		if (
			!settingsValues.address.line1 ||
			!settingsValues.address.city ||
			!settingsValues.address.state ||
			!settingsValues.address.zip ||
			!settingsValues.address.country
		) {
			toast.error(
				"All main address fields (except line 2) are required.",
			);
			return;
		}

		if (
			!settingsValues.sameReturn &&
			(!settingsValues.returnAddress.line1 ||
				!settingsValues.returnAddress.city ||
				!settingsValues.returnAddress.state ||
				!settingsValues.returnAddress.zip ||
				!settingsValues.returnAddress.country)
		) {
			toast.error(
				"All return address fields (except line 2) are required when not using main address.",
			);
			return;
		}

		await updateWarehouseMutation.mutateAsync({
			organizationId: data.organizationId,
			id: data.id,
			name: settingsValues.name.trim(),
			code: settingsValues.code.trim(),
			timezone: settingsValues.timezone.trim() || undefined,
			sameReturn: settingsValues.sameReturn,
			address: settingsValues.address,
			returnAddress: settingsValues.sameReturn
				? undefined
				: settingsValues.returnAddress,
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

		if (data.status === "INACTIVE") {
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

		if (data.status !== "INACTIVE") {
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
			<div className="w-full min-h-[200px] flex items-center justify-center py-6">
				<p className="text-sm text-muted-foreground">
					Loading warehouse details...
				</p>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="w-full min-h-[200px] flex items-center justify-center py-6">
				<p className="text-sm text-muted-foreground">
					Warehouse not found.
				</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col gap-6 py-6 px-0 overflow-hidden">
			<div className="flex items-start justify-between gap-3 px-6">
				<div className="space-y-1">
					{/* Warehouse name moved to SidebarHeader breadcrumbs */}
					<p className="text-sm text-muted-foreground">
						{data.code} • {data.status}
					</p>
				</div>
				{data.status === "INACTIVE" ? (
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

			<div className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
				<Tabs
					defaultValue="inventory"
					className="flex-1 flex flex-col min-w-0 overflow-hidden"
					orientation="horizontal"
				>
					<TabsList
						variant="default"
						className="h-auto w-full justify-start overflow-x-auto"
					>
						<TabsTrigger
							value="layout"
							className="px-3 py-2 text-sm font-medium"
						>
							Layout
						</TabsTrigger>
						<TabsTrigger
							value="inventory"
							className="py-2 text-sm font-medium"
						>
							Inventory
						</TabsTrigger>
						<TabsTrigger
							value="orders"
							className="px-3 py-2 text-sm font-medium"
						>
							Orders
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
						{/* <TabsTrigger
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
									</TabsTrigger> */}
						<TabsTrigger
							value="settings"
							className="px-3 py-2 text-sm font-medium"
						>
							Settings
						</TabsTrigger>
					</TabsList>

					{/* Tab content area: make it grow and fill width, and scroll if needed */}
					<div className="flex-1 flex flex-col min-w-0 overflow-x-auto">
						<LayoutTabContent
							warehouseId={data.id}
							organizationId={data.organizationId}
							warehouseName={data.name}
							warehouseCode={data.code}
						/>
						<LocationsTabContent
							warehouseId={data.id}
							organizationId={data.organizationId}
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
							readOnly={data.status === "INACTIVE"}
							onRestore={() => {
								void handleRestoreWarehouse();
							}}
							restoring={restoreWarehouseMutation.isPending}
						/>
						<InventoryTabContent
							warehouseId={data.id}
							organizationId={data.organizationId}
						/>
						<CycleCountTabContent />
						<LogsTabContent
							warehouseId={data.id}
							organizationId={data.organizationId}
						/>
					</div>
				</Tabs>
			</div>
		</div>
	);
}
