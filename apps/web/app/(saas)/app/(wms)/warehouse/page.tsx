"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchIcon, WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function WarehousePage() {
	const { organization } = useSession();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [statusView, setStatusView] = useState<"active" | "INACTIVE" | "all">(
		"active",
	);

	const { data, isPending } = useQuery({
		...orpc.warehouse.list.queryOptions({
			input: {
				organizationId: organization?.id ?? "",
				query: search.trim() || undefined,
				status: statusView,
				limit: PAGE_SIZE,
				offset: 0,
			},
		}),
		enabled: Boolean(organization?.id),
	});

	const restoreWarehouseMutation = useMutation(
		orpc.warehouse.restore.mutationOptions(),
	);

	const warehouses = data?.warehouses ?? [];

	const handleRestoreWarehouse = async (warehouse: {
		id: string;
		name: string;
	}) => {
		if (!organization?.id) {
			return;
		}

		if (
			!window.confirm(
				`Restore warehouse ${warehouse.name}? It will be visible in active lists again.`,
			)
		) {
			return;
		}

		await restoreWarehouseMutation.mutateAsync({
			organizationId: organization.id,
			id: warehouse.id,
		});

		await queryClient.invalidateQueries({
			queryKey: orpc.warehouse.list.key(),
		});

		toast.success("Warehouse restored.");
	};

	const totals = useMemo(() => {
		return warehouses.reduce(
			(acc, warehouse) => {
				acc.locations += warehouse._count.locations;
				acc.inventoryBalances += warehouse._count.inventoryBalances;
				return acc;
			},
			{ locations: 0, inventoryBalances: 0 },
		);
	}, [warehouses]);

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Warehouse
					</h1>
					<p className="text-sm text-muted-foreground">
						Live warehouse list connected to backend APIs.
					</p>
				</div>
				<Button asChild>
					<Link href="/app/warehouse/create">Create Warehouse</Link>
				</Button>
			</div>

			<Card className="border">
				<CardContent className="pt-4">
					<div className="space-y-3">
						<Tabs
							value={statusView}
							onValueChange={(value) => {
								setStatusView(
									value as "active" | "INACTIVE" | "all",
								);
							}}
						>
							<TabsList>
								<TabsTrigger value="active">Active</TabsTrigger>
								<TabsTrigger value="INACTIVE">
									Archived
								</TabsTrigger>
								<TabsTrigger value="all">All</TabsTrigger>
							</TabsList>
						</Tabs>
						<div className="relative max-w-md">
							<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={search}
								onChange={(event) => {
									setSearch(event.target.value);
								}}
								placeholder="Search by warehouse name or code"
								className="pl-9"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-3 sm:grid-cols-3">
				<Card className="border">
					<CardHeader className="pb-2">
						<CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
							Warehouses
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{warehouses.length}
					</CardContent>
				</Card>
				<Card className="border">
					<CardHeader className="pb-2">
						<CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
							Locations
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{totals.locations}
					</CardContent>
				</Card>
				<Card className="border">
					<CardHeader className="pb-2">
						<CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
							Inventory Balances
						</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold">
						{totals.inventoryBalances}
					</CardContent>
				</Card>
			</div>

			<Card className="border">
				<CardHeader>
					<CardTitle>Warehouse Directory</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{isPending ? (
						<p className="text-sm text-muted-foreground">
							Loading warehouses...
						</p>
					) : warehouses.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{statusView === "INACTIVE"
								? "No archived warehouses found."
								: "No warehouses found for this organization."}
						</p>
					) : (
						warehouses.map((warehouse) => {
							const isArchived = warehouse.status === "INACTIVE";

							const rowContent = (
								<>
									<div className="flex items-center gap-3">
										<div className="rounded-md border bg-muted/40 p-2">
											<WarehouseIcon className="size-4" />
										</div>
										<div>
											<p className="font-medium">
												{warehouse.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{warehouse.code} •{" "}
												{warehouse.status}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 text-right text-xs text-muted-foreground">
										<div>
											<p>
												Balances:{" "}
												{
													warehouse._count
														.inventoryBalances
												}
											</p>
										</div>
										{isArchived ? (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={(event) => {
													event.preventDefault();
													event.stopPropagation();
													void handleRestoreWarehouse(
														{
															id: warehouse.id,
															name: warehouse.name,
														},
													);
												}}
												disabled={
													restoreWarehouseMutation.isPending
												}
											>
												Restore
											</Button>
										) : null}
									</div>
								</>
							);

							return (
								<Link
									key={warehouse.id}
									href={`/app/warehouse/${warehouse.id}`}
									className="flex items-center justify-between rounded-md border p-4 transition-colors hover:bg-muted/40"
								>
									{rowContent}
								</Link>
							);
						})
					)}
				</CardContent>
			</Card>
		</div>
	);
}
