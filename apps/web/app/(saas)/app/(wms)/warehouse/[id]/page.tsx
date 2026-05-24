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
	timezone: string;
};

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

		await updateWarehouseMutation.mutateAsync({
			organizationId: data.organizationId,
			id: data.id,
			name: settingsValues.name.trim(),
			code: settingsValues.code.trim(),
			timezone: settingsValues.timezone.trim() || undefined,
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

			<Tabs
				defaultValue="inventory"
				className="space-y-4 flex flex-col"
				orientation="horizontal"
			>
				<TabsList
					variant="default"
					className="h-auto w-full justify-start overflow-x-auto"
				>
					<TabsTrigger
						value="inventory"
						className="py-2 text-sm font-medium"
					>
						Inventory
					</TabsTrigger>
					<TabsTrigger
						value="layout"
						className="px-3 py-2 text-sm font-medium"
					>
						Layout
					</TabsTrigger>
					<TabsTrigger
						value="locations"
						className="px-3 py-2 text-sm font-medium"
					>
						Locations
					</TabsTrigger>
					<TabsTrigger
						value="settings"
						className="px-3 py-2 text-sm font-medium"
					>
						Settings
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
				<ReplenishInventoryTabContent />
				<BinReplenishmentTabContent />
				<BundlesTabContent />
				<OrdersTabContent />
			</Tabs>
		</div>
	);
}
