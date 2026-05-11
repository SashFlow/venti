"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { cn } from "@repo/ui/utils";
import { useSession } from "@saas/auth/hooks/use-session";
import { InviteMemberForm } from "@saas/organizations/components/InviteMemberForm";
import { OrganizationInvitationsList } from "@saas/organizations/components/OrganizationInvitationsList";
import { OrganizationMembersList } from "@saas/organizations/components/OrganizationMembersList";
import { orpc } from "@shared/lib/orpc-query-utils";
import {
	skipToken,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	PencilIcon,
	SearchIcon,
	Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PermissionGroup = {
	key: string;
	label: string;
	permissions: Array<{
		key: string;
		label: string;
	}>;
};

type WarehouseScope = {
	id: string;
	code: string;
	name: string;
};

type RoleGroup = {
	id: string;
	name: string;
	description: string | null;
	permissions: string[];
	warehouses: WarehouseScope[];
};

type WorkforceMember = {
	id: string;
	role: string;
	roleGroupId: string | null;
	user: {
		id: string;
		name: string | null;
		email: string;
	};
	roleGroup: {
		id: string;
		name: string;
	} | null;
};

const ROLE_GROUP_TABS = [
	{ value: "workers", label: "Workers" },
	{ value: "invite", label: "Invite" },
	{ value: "invited", label: "Invited" },
	{ value: "role-group", label: "Role Group" },
] as const;

function RoleGroupBuilder({
	permissionGroups,
	warehouses,
	roleGroups,
	isSaving,
	isUpdating,
	deletingRoleGroupId,
	onCreateRoleGroup,
	onUpdateRoleGroup,
	onDeleteRoleGroup,
}: {
	permissionGroups: PermissionGroup[];
	warehouses: WarehouseScope[];
	roleGroups: RoleGroup[];
	isSaving: boolean;
	isUpdating: boolean;
	deletingRoleGroupId: string | null;
	onCreateRoleGroup: (input: {
		name: string;
		permissions: string[];
		warehouseIds: string[];
	}) => Promise<void>;
	onUpdateRoleGroup: (input: {
		roleGroupId: string;
		name: string;
		description: string | null;
		permissions: string[];
		warehouseIds: string[];
	}) => Promise<void>;
	onDeleteRoleGroup: (roleGroupId: string) => Promise<void>;
}) {
	const [name, setName] = useState("");
	const [search, setSearch] = useState("");
	const [checkedPermissions, setCheckedPermissions] = useState<
		Record<string, boolean>
	>({});
	const [warehouseScope, setWarehouseScope] = useState<
		Record<string, boolean>
	>({});
	const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
		permissionGroups.reduce<Record<string, boolean>>((acc, group) => {
			acc[group.key] = true;
			return acc;
		}, {}),
	);

	const normalizedSearch = search.trim().toLowerCase();

	const filteredGroups = useMemo(() => {
		if (!normalizedSearch) {
			return permissionGroups;
		}

		return permissionGroups
			.map((group) => {
				const matchesGroup = group.label
					.toLowerCase()
					.includes(normalizedSearch);
				const filteredPermissions = matchesGroup
					? group.permissions
					: group.permissions.filter((permission) =>
							permission.label
								.toLowerCase()
								.includes(normalizedSearch),
						);

				return {
					...group,
					permissions: filteredPermissions,
				};
			})
			.filter((group) => group.permissions.length > 0);
	}, [normalizedSearch, permissionGroups]);

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

	const onCreateRoleGroupSubmit = (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		if (!name.trim()) {
			toast.error("Role group name is required.");
			return;
		}

		const selectedPermissions = Object.entries(checkedPermissions)
			.filter(([, checked]) => checked)
			.map(([key]) => key);

		if (selectedPermissions.length === 0) {
			toast.error("Select at least one permission.");
			return;
		}

		const selectedWarehouseIds = Object.entries(warehouseScope)
			.filter(([, checked]) => checked)
			.map(([key]) => key);

		toast.promise(
			onCreateRoleGroup({
				name: name.trim(),
				permissions: selectedPermissions,
				warehouseIds: selectedWarehouseIds,
			}).then(() => {
				setName("");
				setCheckedPermissions({});
				setWarehouseScope({});
			}),
			{
				loading: "Creating role group...",
				success: "Role group created.",
				error: "Failed to create role group.",
			},
		);
	};

	const selectedWarehouseCount =
		Object.values(warehouseScope).filter(Boolean).length;

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
						disabled={isSaving}
					>
						{isSaving ? "Creating..." : "Create"}
					</Button>
				</div>

				<div className="p-4 md:p-6">
					<form id="RoleGroupEdit" onSubmit={onCreateRoleGroupSubmit}>
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

						<div className="mt-4 space-y-2">
							<Label>Warehouse scope</Label>
							<p className="text-muted-foreground text-xs">
								Selected {selectedWarehouseCount} of{" "}
								{warehouses.length} warehouses
							</p>
							<div className="grid gap-2 sm:grid-cols-2">
								{warehouses.length === 0 ? (
									<p className="text-muted-foreground text-sm">
										No warehouses found for this
										organization.
									</p>
								) : (
									warehouses.map((warehouse) => {
										const checkboxId = `warehouse-scope-${warehouse.id}`;

										return (
											<div
												key={warehouse.id}
												className="flex items-center gap-2 rounded-md border px-3 py-2"
											>
												<Checkbox
													id={checkboxId}
													checked={Boolean(
														warehouseScope[
															warehouse.id
														],
													)}
													onCheckedChange={(
														checked,
													) =>
														setWarehouseScope(
															(previous) => ({
																...previous,
																[warehouse.id]:
																	Boolean(
																		checked,
																	),
															}),
														)
													}
												/>
												<Label
													htmlFor={checkboxId}
													className="text-sm"
												>
													{warehouse.name} (
													{warehouse.code})
												</Label>
											</div>
										);
									})
								)}
							</div>
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

			<div className="rounded-xl border bg-card">
				<div className="border-b px-4 py-3 md:px-6">
					<h3 className="font-semibold text-base">
						Existing role groups
					</h3>
				</div>
				<CardContent className="space-y-2 px-4 py-4 md:px-6">
					{roleGroups.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No role groups created yet.
						</p>
					) : (
						roleGroups.map((roleGroup) => (
							<div
								key={roleGroup.id}
								className="rounded-lg border p-3"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="font-medium text-sm">
											{roleGroup.name}
										</div>
										{roleGroup.description ? (
											<p className="mt-1 text-muted-foreground text-xs">
												{roleGroup.description}
											</p>
										) : null}
									</div>
									<div className="flex items-center gap-2">
										<RoleGroupEditDialog
											roleGroup={roleGroup}
											permissionGroups={permissionGroups}
											warehouses={warehouses}
											isSaving={isUpdating}
											onSave={onUpdateRoleGroup}
										/>
										<AlertDialog>
											<AlertDialogTrigger>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													disabled={
														deletingRoleGroupId ===
														roleGroup.id
													}
												>
													<Trash2Icon className="size-4 text-destructive" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Delete role group?
													</AlertDialogTitle>
													<AlertDialogDescription>
														This will remove access
														profile {roleGroup.name}
														. Assigned members will
														be unassigned from this
														role group.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														onClick={() => {
															toast.promise(
																onDeleteRoleGroup(
																	roleGroup.id,
																),
																{
																	loading:
																		"Deleting role group...",
																	success:
																		"Role group deleted.",
																	error: "Failed to delete role group.",
																},
															);
														}}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
								<p className="mt-1 text-muted-foreground text-xs">
									{roleGroup.warehouses.length} warehouse
									scopes • {roleGroup.permissions.length}{" "}
									permissions
								</p>
							</div>
						))
					)}
				</CardContent>
			</div>
		</div>
	);
}

function RoleGroupEditDialog({
	roleGroup,
	permissionGroups,
	warehouses,
	isSaving,
	onSave,
}: {
	roleGroup: RoleGroup;
	permissionGroups: PermissionGroup[];
	warehouses: WarehouseScope[];
	isSaving: boolean;
	onSave: (input: {
		roleGroupId: string;
		name: string;
		description: string | null;
		permissions: string[];
		warehouseIds: string[];
	}) => Promise<void>;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(roleGroup.name);
	const [description, setDescription] = useState(roleGroup.description ?? "");
	const [checkedPermissions, setCheckedPermissions] = useState<
		Record<string, boolean>
	>({});
	const [warehouseScope, setWarehouseScope] = useState<
		Record<string, boolean>
	>({});

	useEffect(() => {
		if (!open) {
			return;
		}

		setName(roleGroup.name);
		setDescription(roleGroup.description ?? "");
		setCheckedPermissions(
			roleGroup.permissions.reduce<Record<string, boolean>>(
				(acc, key) => {
					acc[key] = true;
					return acc;
				},
				{},
			),
		);
		setWarehouseScope(
			roleGroup.warehouses.reduce<Record<string, boolean>>(
				(acc, warehouse) => {
					acc[warehouse.id] = true;
					return acc;
				},
				{},
			),
		);
	}, [open, roleGroup]);

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!name.trim()) {
			toast.error("Role group name is required.");
			return;
		}

		const selectedPermissions = Object.entries(checkedPermissions)
			.filter(([, checked]) => checked)
			.map(([key]) => key);

		if (selectedPermissions.length === 0) {
			toast.error("Select at least one permission.");
			return;
		}

		const selectedWarehouseIds = Object.entries(warehouseScope)
			.filter(([, checked]) => checked)
			.map(([key]) => key);

		toast.promise(
			onSave({
				roleGroupId: roleGroup.id,
				name: name.trim(),
				description: description.trim() ? description.trim() : null,
				permissions: selectedPermissions,
				warehouseIds: selectedWarehouseIds,
			}).then(() => setOpen(false)),
			{
				loading: "Updating role group...",
				success: "Role group updated.",
				error: "Failed to update role group.",
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Button type="button" variant="ghost" size="icon">
					<PencilIcon className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit Role Group</DialogTitle>
					<DialogDescription>
						Update role group permissions and warehouse scope.
					</DialogDescription>
				</DialogHeader>

				<form
					id={`RoleGroupEdit_${roleGroup.id}`}
					onSubmit={onSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor={`RoleGroupEdit_name_${roleGroup.id}`}>
							name<span className="text-destructive">*</span>
						</Label>
						<Input
							id={`RoleGroupEdit_name_${roleGroup.id}`}
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label
							htmlFor={`RoleGroupEdit_description_${roleGroup.id}`}
						>
							description
						</Label>
						<Input
							id={`RoleGroupEdit_description_${roleGroup.id}`}
							value={description}
							onChange={(event) =>
								setDescription(event.target.value)
							}
							placeholder="Optional description"
						/>
					</div>

					<div className="space-y-2">
						<Label>Warehouse scope</Label>
						<div className="grid max-h-44 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
							{warehouses.map((warehouse) => {
								const checkboxId = `edit-warehouse-${roleGroup.id}-${warehouse.id}`;

								return (
									<div
										key={warehouse.id}
										className="flex items-center gap-2 rounded-md border px-3 py-2"
									>
										<Checkbox
											id={checkboxId}
											checked={Boolean(
												warehouseScope[warehouse.id],
											)}
											onCheckedChange={(checked) =>
												setWarehouseScope(
													(previous) => ({
														...previous,
														[warehouse.id]:
															Boolean(checked),
													}),
												)
											}
										/>
										<Label
											htmlFor={checkboxId}
											className="text-sm"
										>
											{warehouse.name} ({warehouse.code})
										</Label>
									</div>
								);
							})}
						</div>
					</div>

					<div className="space-y-2">
						<Label>Permissions</Label>
						<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
							{permissionGroups.map((group) => (
								<div
									key={group.key}
									className="rounded-md border p-2"
								>
									<p className="font-medium text-xs uppercase">
										{group.label}
									</p>
									<div className="mt-2 grid gap-2 sm:grid-cols-2">
										{group.permissions.map((permission) => {
											const permissionId = `edit-permission-${roleGroup.id}-${permission.key}`;

											return (
												<div
													key={permission.key}
													className="flex items-center gap-2"
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
															setCheckedPermissions(
																(previous) => ({
																	...previous,
																	[permission.key]:
																		Boolean(
																			checked,
																		),
																}),
															)
														}
													/>
													<Label
														htmlFor={permissionId}
														className="text-xs"
													>
														{permission.label}
													</Label>
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</form>

				<DialogFooter>
					<Button
						type="submit"
						form={`RoleGroupEdit_${roleGroup.id}`}
						disabled={isSaving}
					>
						{isSaving ? "Saving..." : "Save changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function MemberRoleGroupAssignments({
	members,
	roleGroups,
	isSaving,
	onAssign,
}: {
	members: WorkforceMember[];
	roleGroups: RoleGroup[];
	isSaving: boolean;
	onAssign: (memberId: string, roleGroupId: string | null) => Promise<void>;
}) {
	return (
		<Card className="rounded-2xl border">
			<div className="border-b px-4 py-3 md:px-6">
				<h3 className="font-semibold text-base">
					Role group assignments
				</h3>
				<p className="text-muted-foreground text-xs">
					Assign role groups to users to enforce warehouse scope and
					action access.
				</p>
			</div>
			<CardContent className="p-0">
				<Table>
					<TableBody>
						{members.length === 0 ? (
							<TableRow>
								<TableCell className="h-24 text-center">
									No members found.
								</TableCell>
							</TableRow>
						) : (
							members.map((member) => {
								const userLabel =
									member.user.name ?? member.user.email;

								return (
									<TableRow key={member.id}>
										<TableCell>
											<div>
												<div className="font-medium text-sm">
													{userLabel}
												</div>
												<div className="text-muted-foreground text-xs">
													{member.user.email} •{" "}
													{member.role}
												</div>
											</div>
										</TableCell>
										<TableCell className="w-[260px]">
											<Select
												value={
													member.roleGroupId ?? "none"
												}
												disabled={
													isSaving ||
													member.role === "owner"
												}
												onValueChange={(value) =>
													void onAssign(
														member.id,
														value === "none"
															? null
															: value,
													)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="none">
														No role group
													</SelectItem>
													{roleGroups.map((group) => (
														<SelectItem
															key={group.id}
															value={group.id}
														>
															{group.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export default function WorkforcePage() {
	const { organization } = useSession();
	const queryClient = useQueryClient();

	const accessConfigQuery = useQuery(
		orpc.workforce.listAccessConfig.queryOptions({
			input: organization
				? {
						organizationId: organization.id,
					}
				: skipToken,
		}),
	);

	const createRoleGroupMutation = useMutation(
		orpc.workforce.createRoleGroup.mutationOptions(),
	);

	const updateRoleGroupMutation = useMutation(
		orpc.workforce.updateRoleGroup.mutationOptions(),
	);

	const deleteRoleGroupMutation = useMutation(
		orpc.workforce.deleteRoleGroup.mutationOptions(),
	);

	const assignRoleGroupMutation = useMutation(
		orpc.workforce.assignMemberRoleGroup.mutationOptions(),
	);

	const invalidateAccessConfig = async (organizationId: string) => {
		await queryClient.invalidateQueries({
			queryKey: orpc.workforce.listAccessConfig.queryKey({
				input: {
					organizationId,
				},
			}),
		});
	};

	const permissionGroups = accessConfigQuery.data?.permissionGroups ?? [];
	const warehouses = accessConfigQuery.data?.warehouses ?? [];
	const roleGroups = accessConfigQuery.data?.roleGroups ?? [];
	const members = accessConfigQuery.data?.members ?? [];

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
			) : accessConfigQuery.isLoading ? (
				<Card className="mt-6 rounded-2xl border">
					<CardContent className="p-6 text-sm text-muted-foreground">
						Loading workforce access configuration...
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
						<MemberRoleGroupAssignments
							members={members}
							roleGroups={roleGroups}
							isSaving={assignRoleGroupMutation.isPending}
							onAssign={async (memberId, roleGroupId) => {
								try {
									await assignRoleGroupMutation.mutateAsync({
										organizationId: organization.id,
										memberId,
										roleGroupId,
									});

									await invalidateAccessConfig(
										organization.id,
									);
									toast.success("Member access updated.");
								} catch {
									toast.error(
										"Failed to update member access.",
									);
								}
							}}
						/>
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
						<RoleGroupBuilder
							permissionGroups={permissionGroups}
							warehouses={warehouses}
							roleGroups={roleGroups}
							isSaving={createRoleGroupMutation.isPending}
							isUpdating={updateRoleGroupMutation.isPending}
							deletingRoleGroupId={
								deleteRoleGroupMutation.isPending
									? (deleteRoleGroupMutation.variables
											?.roleGroupId ?? null)
									: null
							}
							onCreateRoleGroup={async (payload) => {
								await createRoleGroupMutation.mutateAsync({
									organizationId: organization.id,
									name: payload.name,
									permissions: payload.permissions,
									warehouseIds: payload.warehouseIds,
								});

								await invalidateAccessConfig(organization.id);
							}}
							onUpdateRoleGroup={async (payload) => {
								await updateRoleGroupMutation.mutateAsync({
									organizationId: organization.id,
									roleGroupId: payload.roleGroupId,
									name: payload.name,
									description: payload.description,
									permissions: payload.permissions,
									warehouseIds: payload.warehouseIds,
								});

								await invalidateAccessConfig(organization.id);
							}}
							onDeleteRoleGroup={async (roleGroupId) => {
								await deleteRoleGroupMutation.mutateAsync({
									organizationId: organization.id,
									roleGroupId,
								});

								await invalidateAccessConfig(organization.id);
							}}
						/>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}
