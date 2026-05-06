"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { cn } from "@repo/ui/utils";
import { useSession } from "@saas/auth/hooks/use-session";
import { InviteMemberForm } from "@saas/organizations/components/InviteMemberForm";
import { OrganizationInvitationsList } from "@saas/organizations/components/OrganizationInvitationsList";
import { OrganizationMembersList } from "@saas/organizations/components/OrganizationMembersList";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type PermissionGroup = {
	key: string;
	label: string;
	permissions: Array<{
		key: string;
		label: string;
	}>;
};

const ROLE_GROUP_TABS = [
	{ value: "workers", label: "Workers" },
	{ value: "invite", label: "Invite" },
	{ value: "invited", label: "Invited" },
	{ value: "role-group", label: "Role Group" },
] as const;

const PERMISSION_GROUPS: PermissionGroup[] = [
	{
		key: "warehouse",
		label: "warehouse",
		permissions: [
			{ key: "VIEW_WAREHOUSES", label: "view warehouses" },
			{ key: "CREATE_WAREHOUSE", label: "create warehouse" },
			{ key: "UPDATE_WAREHOUSE", label: "update warehouse" },
			{ key: "DELETE_WAREHOUSE", label: "delete warehouse" },
		],
	},
	{
		key: "product",
		label: "product",
		permissions: [
			{ key: "VIEW_PRODUCTS", label: "view products" },
			{ key: "CREATE_PRODUCT", label: "create product" },
			{ key: "UPDATE_PRODUCT", label: "update product" },
			{ key: "DELETE_PRODUCT", label: "delete product" },
		],
	},
	{
		key: "order",
		label: "order",
		permissions: [
			{ key: "VIEW_INBOUND_ORDERS", label: "view inbound orders" },
			{ key: "VIEW_OUTBOUND_ORDERS", label: "view outbound orders" },
			{
				key: "VIEW_OUTBOUND_ORDER_BATCHES",
				label: "view outbound order batches",
			},
			{ key: "CREATE_INBOUND_ORDER", label: "create inbound order" },
			{ key: "CREATE_OUTBOUND_ORDER", label: "create outbound order" },
			{
				key: "CREATE_OUTBOUND_ORDER_BATCH",
				label: "create outbound order batch",
			},
			{ key: "UPDATE_INBOUND_ORDER", label: "update inbound order" },
			{ key: "UPDATE_OUTBOUND_ORDER", label: "update outbound order" },
			{
				key: "UPDATE_OUTBOUND_ORDER_BATCH",
				label: "update outbound order batch",
			},
			{
				key: "DELETE_OUTBOUND_ORDER_BATCH",
				label: "delete outbound order batch",
			},
			{ key: "CANCEL_OUTBOUND_ORDER", label: "cancel outbound order" },
		],
	},
	{
		key: "employee",
		label: "employee",
		permissions: [
			{ key: "VIEW_EMPLOYEES", label: "view employees" },
			{
				key: "VIEW_EMPLOYEES_PRODUCTIVITY",
				label: "view employees productivity",
			},
			{ key: "CREATE_EMPLOYEE", label: "create employee" },
			{ key: "UPDATE_EMPLOYEE", label: "update employee" },
			{ key: "DELETE_EMPLOYEE", label: "delete employee" },
		],
	},
	{
		key: "bin",
		label: "bin",
		permissions: [
			{ key: "VIEW_BINS", label: "view bins" },
			{ key: "CREATE_BIN", label: "create bin" },
			{ key: "UPDATE_BIN", label: "update bin" },
			{ key: "DELETE_BIN", label: "delete bin" },
		],
	},
	{
		key: "vendor",
		label: "vendor",
		permissions: [
			{ key: "VIEW_VENDORS", label: "view vendors" },
			{ key: "CREATE_VENDOR", label: "create vendor" },
			{ key: "UPDATE_VENDOR", label: "update vendor" },
			{ key: "DELETE_VENDOR", label: "delete vendor" },
		],
	},
	{
		key: "replenishment",
		label: "replenishment",
		permissions: [
			{ key: "VIEW_REPLENISHMENTS", label: "view replenishments" },
			{ key: "CREATE_REPLENISHMENT", label: "create replenishment" },
			{ key: "UPDATE_REPLENISHMENT", label: "update replenishment" },
			{ key: "DELETE_REPLENISHMENT", label: "delete replenishment" },
		],
	},
	{
		key: "customer",
		label: "customer",
		permissions: [
			{ key: "VIEW_CUSTOMERS", label: "view customers" },
			{ key: "CREATE_CUSTOMER", label: "create customer" },
			{ key: "UPDATE_CUSTOMER", label: "update customer" },
			{ key: "DELETE_CUSTOMER", label: "delete customer" },
		],
	},
	{
		key: "transfer",
		label: "transfer",
		permissions: [
			{ key: "VIEW_TRANSFERS", label: "view transfers" },
			{ key: "CREATE_TRANSFER", label: "create transfer" },
			{ key: "UPDATE_TRANSFERS", label: "update transfers" },
		],
	},
	{
		key: "carrier",
		label: "carrier",
		permissions: [
			{ key: "VIEW_CARRIERS", label: "view carriers" },
			{ key: "CREATE_CARRIER", label: "create carrier" },
			{ key: "UPDATE_CARRIERS", label: "update carriers" },
			{ key: "DELETE_CARRIERS", label: "delete carriers" },
		],
	},
	{
		key: "inventory",
		label: "inventory",
		permissions: [
			{ key: "VIEW_INVENTORY", label: "view inventory" },
			{ key: "UPDATE_INVENTORY", label: "update inventory" },
		],
	},
	{
		key: "packaging",
		label: "packaging",
		permissions: [
			{ key: "VIEW_PACKAGING", label: "view packaging" },
			{ key: "CREATE_PACKAGING", label: "create packaging" },
			{ key: "UPDATE_PACKAGING", label: "update packaging" },
			{ key: "DELETE_PACKAGING", label: "delete packaging" },
		],
	},
	{
		key: "export",
		label: "export",
		permissions: [
			{ key: "VIEW_EXPORT", label: "view export" },
			{ key: "VIEW_EXPORTED", label: "view exported" },
			{ key: "CREATE_EXPORT", label: "create export" },
			{ key: "TRIGGER_EXPORT", label: "trigger export" },
			{ key: "UPDATE_EXPORT", label: "update export" },
			{ key: "DELETE_EXPORT", label: "delete export" },
		],
	},
	{
		key: "webhook",
		label: "webhook",
		permissions: [
			{ key: "VIEW_WEBHOOKS", label: "view webhooks" },
			{ key: "CREATE_WEBHOOK", label: "create webhook" },
			{ key: "UPDATE_WEBHOOK", label: "update webhook" },
			{ key: "DELETE_WEBHOOKS", label: "delete webhooks" },
		],
	},
	{
		key: "company",
		label: "company",
		permissions: [
			{ key: "UPDATE_COMPANY", label: "update company" },
			{
				key: "UPDATE_COMPANY_BILLING",
				label: "update company billing",
			},
			{ key: "DISABLE_USERS", label: "disable users" },
		],
	},
];

function RoleGroupBuilder() {
	const [name, setName] = useState("");
	const [search, setSearch] = useState("");
	const [checkedPermissions, setCheckedPermissions] = useState<
		Record<string, boolean>
	>({});
	const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
		PERMISSION_GROUPS.reduce<Record<string, boolean>>((acc, group) => {
			acc[group.key] = true;
			return acc;
		}, {}),
	);

	const normalizedSearch = search.trim().toLowerCase();

	const filteredGroups = useMemo(() => {
		if (!normalizedSearch) {
			return PERMISSION_GROUPS;
		}

		return PERMISSION_GROUPS.map((group) => {
			const matchesGroup = group.label.includes(normalizedSearch);
			const filteredPermissions = matchesGroup
				? group.permissions
				: group.permissions.filter((permission) =>
						permission.label.includes(normalizedSearch),
					);

			return {
				...group,
				permissions: filteredPermissions,
			};
		}).filter((group) => group.permissions.length > 0);
	}, [normalizedSearch]);

	const visiblePermissionKeys = filteredGroups.flatMap((group) =>
		group.permissions.map((permission) => permission.key),
	);

	const allVisibleChecked =
		visiblePermissionKeys.length > 0 &&
		visiblePermissionKeys.every((key) => checkedPermissions[key]);

	const togglePermission = (permissionKey: string, checked: boolean) => {
		setCheckedPermissions((previous) => ({
			...previous,
			[permissionKey]: checked,
		}));
	};

	const toggleGroup = (group: PermissionGroup, checked: boolean) => {
		setCheckedPermissions((previous) => {
			const next = { ...previous };

			for (const permission of group.permissions) {
				next[permission.key] = checked;
			}

			return next;
		});
	};

	const toggleAllVisible = (checked: boolean) => {
		setCheckedPermissions((previous) => {
			const next = { ...previous };

			for (const permissionKey of visiblePermissionKeys) {
				next[permissionKey] = checked;
			}

			return next;
		});
	};

	const onCreateRoleGroup = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!name.trim()) {
			toast.error("Role group name is required.");
			return;
		}

		toast.success("Role group created.");
	};

	return (
		<div className="space-y-4">
			<div className="rounded-xl border bg-card">
				<div className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-6">
					<h2 className="font-semibold text-xl">Create Role Group</h2>
					<Button
						type="submit"
						form="RoleGroupEdit"
						size="sm"
						id="RoleGroupEdit_CreateBtn"
					>
						Create
					</Button>
				</div>

				<div className="p-4 md:p-6">
					<form id="RoleGroupEdit" onSubmit={onCreateRoleGroup}>
						<div className="space-y-2">
							<Label htmlFor="RoleGroupEdit_name">
								name<span className="text-destructive">*</span>
							</Label>
							<Input
								id="RoleGroupEdit_name"
								placeholder="e.g. Warehouse Manager"
								value={name}
								onChange={(event) =>
									setName(event.target.value)
								}
							/>
						</div>
					</form>
				</div>
			</div>

			<div className="rounded-xl border bg-card">
				<div className="flex flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
					<h3 className="font-semibold text-base">
						Assign user permissions
					</h3>
					<div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
						<div className="relative w-full md:w-80">
							<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="role-group-search"
								placeholder="Search"
								value={search}
								onChange={(event) =>
									setSearch(event.target.value)
								}
								className="pl-9"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox
								checked={allVisibleChecked}
								onCheckedChange={(checked) =>
									toggleAllVisible(Boolean(checked))
								}
							/>
							<Label
								htmlFor="role-group-search"
								className="text-xs"
							>
								Select all visible
							</Label>
						</div>
					</div>
				</div>

				<CardContent className="space-y-2 p-0">
					{filteredGroups.length === 0 ? (
						<div className="px-4 py-8 text-center text-muted-foreground text-sm md:px-6">
							No permission groups match your search.
						</div>
					) : (
						filteredGroups.map((group) => {
							const groupChecked =
								group.permissions.length > 0 &&
								group.permissions.every(
									(permission) =>
										checkedPermissions[permission.key],
								);
							const groupToggleId = `permission-group-${group.key}`;

							return (
								<div
									key={group.key}
									className="border-t first:border-t-0"
								>
									<div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
										<h4 className="font-semibold text-sm uppercase">
											{group.label}
										</h4>
										<div className="flex items-center gap-3">
											<Checkbox
												id={groupToggleId}
												checked={groupChecked}
												onCheckedChange={(checked) =>
													toggleGroup(
														group,
														Boolean(checked),
													)
												}
											/>
											<Label
												htmlFor={groupToggleId}
												className="sr-only"
											>
												Select all permissions in{" "}
												{group.label}
											</Label>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() =>
													setOpenGroups(
														(previous) => ({
															...previous,
															[group.key]:
																!previous[
																	group.key
																],
														}),
													)
												}
												aria-label={`Toggle ${group.label} permissions`}
											>
												{openGroups[group.key] ? (
													<ChevronUpIcon className="size-4 text-muted-foreground" />
												) : (
													<ChevronDownIcon className="size-4 text-muted-foreground" />
												)}
											</Button>
										</div>
									</div>

									<div
										className={cn(
											"grid gap-2 px-4 pb-4 md:px-6",
											!openGroups[group.key] && "hidden",
										)}
									>
										{group.permissions.map((permission) => {
											const permissionId = `permission-${permission.key}`;

											return (
												<div
													key={permission.key}
													className="flex items-center gap-3 rounded-md py-1"
												>
													<Checkbox
														id={permissionId}
														checked={Boolean(
															checkedPermissions[
																permission.key
															],
														)}
														onCheckedChange={(
															checked,
														) =>
															togglePermission(
																permission.key,
																Boolean(
																	checked,
																),
															)
														}
													/>
													<Label
														htmlFor={permissionId}
														className="capitalize text-sm"
													>
														{permission.label}
													</Label>
												</div>
											);
										})}
									</div>
								</div>
							);
						})
					)}
				</CardContent>
			</div>
		</div>
	);
}

export default function WorkforcePage() {
	const { organization } = useSession();
	return (
		<div className="container mx-auto max-w-7xl py-8">
			<h1 className="text-2xl font-semibold tracking-tight">Workforce</h1>
			<p className="mt-2 text-muted-foreground">
				Manage workforce users and role groups for the active
				organization.
			</p>

			{!organization ? (
				<Card className="mt-6 rounded-2xl border">
					<CardContent className="p-6 text-sm text-muted-foreground">
						Loading active organization...
					</CardContent>
				</Card>
			) : (
				<Tabs
					defaultValue="workers"
					className="mt-6 gap-4 flex flex-col"
				>
					<TabsList
						variant="line"
						className="w-full justify-start gap-1 overflow-x-auto p-0"
					>
						{ROLE_GROUP_TABS.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="flex-none px-3"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value="workers" className="space-y-4">
						<Card className="rounded-2xl border">
							<CardContent className="p-0">
								<OrganizationMembersList
									organizationId={organization.id}
								/>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="invite" className="space-y-4">
						<InviteMemberForm organizationId={organization.id} />
					</TabsContent>

					<TabsContent value="invited" className="space-y-4">
						<Card className="rounded-2xl border">
							<CardContent className="p-4 md:p-6">
								<OrganizationInvitationsList
									organizationId={organization.id}
								/>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="role-group" className="space-y-4">
						<RoleGroupBuilder />
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
