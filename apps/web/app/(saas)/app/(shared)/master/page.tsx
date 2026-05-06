"use client";

import { authClient } from "@repo/auth/client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import { sessionQueryKey } from "@saas/auth/lib/api";
import { OrganizationLogo } from "@saas/organizations/components/OrganizationLogo";
import { Pagination } from "@saas/shared/components/Pagination";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CheckIcon,
	ShieldAlertIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

type MasterTab = "organizations" | "admins";

export default function UsersPage() {
	const queryClient = useQueryClient();
	const { session } = useSession();

	const [activeTab, setActiveTab] = useState<MasterTab>("organizations");

	const [orgSearch, setOrgSearch] = useState("");
	const [orgPage, setOrgPage] = useState(1);
	const [selectedOrganizationId, setSelectedOrganizationId] = useState<
		string | null
	>(null);

	const [userSearch, setUserSearch] = useState("");
	const [adminPage, setAdminPage] = useState(1);

	const { data: organizationsData, isLoading: isOrganizationsLoading } =
		useQuery(
			orpc.admin.organizations.list.queryOptions({
				input: {
					limit: ITEMS_PER_PAGE,
					offset: (orgPage - 1) * ITEMS_PER_PAGE,
					query: orgSearch || undefined,
				},
			}),
		);

	const organizations = organizationsData?.organizations ?? [];

	const effectiveSelectedOrganizationId =
		selectedOrganizationId ?? organizations.at(0)?.id ?? null;

	const { data: usersData, isLoading: isUsersLoading } = useQuery(
		orpc.admin.users.list.queryOptions({
			input: {
				limit: 100,
				offset: 0,
				query: userSearch || undefined,
			},
		}),
	);

	const adminUsers = useMemo(
		() => (usersData?.users ?? []).filter((user) => user.role === "admin"),
		[usersData?.users],
	);

	const paginatedAdminUsers = useMemo(() => {
		const start = (adminPage - 1) * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		return adminUsers.slice(start, end);
	}, [adminUsers, adminPage]);

	const {
		data: selectedOrganization,
		isLoading: isInvitesLoading,
		error: invitesError,
	} = useQuery({
		queryKey: ["master", "organization", effectiveSelectedOrganizationId],
		queryFn: async () => {
			if (!effectiveSelectedOrganizationId) {
				return null;
			}

			const { data, error } =
				await authClient.organization.getFullOrganization({
					query: {
						organizationId: effectiveSelectedOrganizationId,
					},
				});

			if (error) {
				throw new Error(
					error.message ||
						"Failed to load selected organization invitations",
				);
			}

			return data;
		},
		enabled: Boolean(effectiveSelectedOrganizationId),
	});

	const pendingAdminInvites = useMemo(() => {
		return (
			selectedOrganization?.invitations
				?.filter(
					(invitation) =>
						invitation.status === "pending" &&
						invitation.role === "admin",
				)
				.sort(
					(a, b) =>
						new Date(a.expiresAt).getTime() -
						new Date(b.expiresAt).getTime(),
				) ?? []
		);
	}, [selectedOrganization?.invitations]);

	const switchOrganization = async ({
		organizationId,
		organizationSlug,
	}: {
		organizationId: string;
		organizationSlug: string;
	}) => {
		const { data, error } = await authClient.organization.setActive({
			organizationSlug,
		});

		if (error || !data) {
			toast.error(
				error?.message ||
					"Unable to switch to the selected organization.",
			);
			return;
		}

		await queryClient.setQueryData(sessionQueryKey, (previous: any) => {
			return {
				...previous,
				session: {
					...previous?.session,
					activeOrganizationId: organizationId,
				},
			};
		});

		setSelectedOrganizationId(organizationId);
		toast.success("Active organization updated.");
	};

	const updateAdminRole = async ({
		userId,
		role,
	}: {
		userId: string;
		role: "admin" | "user";
	}) => {
		const { error } = await authClient.admin.setRole({ userId, role });

		if (error) {
			toast.error(error.message || "Failed to update user role.");
			return;
		}

		await queryClient.invalidateQueries({
			queryKey: orpc.admin.users.list.key(),
		});

		toast.success("Admin role updated.");
	};

	return (
		<div className="container mx-auto max-w-7xl py-8">
			<h1 className="font-semibold text-2xl tracking-tight">Master</h1>
			<p className="mt-2 text-muted-foreground">
				Manage organizations, admins, and invited admins from one place.
			</p>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as MasterTab)}
				className="mt-6 gap-4 flex flex-col"
			>
				<TabsList variant="line" className="justify-start p-0">
					<TabsTrigger value="organizations" className="px-3">
						Organizations
					</TabsTrigger>
					<TabsTrigger value="admins" className="px-3">
						Admins
					</TabsTrigger>
				</TabsList>

				<TabsContent value="organizations" className="space-y-4">
					<Card className="rounded-2xl border">
						<CardHeader className="pb-2">
							<CardTitle className="font-semibold text-lg">
								Organizations
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Input
								type="search"
								placeholder="Search organizations"
								value={orgSearch}
								onChange={(event) => {
									setOrgSearch(event.target.value);
									setOrgPage(1);
								}}
							/>

							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Organization</TableHead>
											<TableHead>Members</TableHead>
											<TableHead className="text-right">
												Action
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{isOrganizationsLoading
											? Array.from({ length: 5 }).map(
													(_, index) => (
														<TableRow
															key={`org-skeleton-${index}`}
														>
															<TableCell>
																<Skeleton className="h-5 w-56" />
															</TableCell>
															<TableCell>
																<Skeleton className="h-5 w-14" />
															</TableCell>
															<TableCell className="text-right">
																<Skeleton className="ml-auto h-8 w-24" />
															</TableCell>
														</TableRow>
													),
												)
											: organizations.map(
													(organization) => {
														const isActive =
															session?.activeOrganizationId ===
															organization.id;

														return (
															<TableRow
																key={
																	organization.id
																}
																onClick={() =>
																	setSelectedOrganizationId(
																		organization.id,
																	)
																}
															>
																<TableCell>
																	<div className="flex items-center gap-2">
																		<OrganizationLogo
																			name={
																				organization.name
																			}
																			logoUrl={
																				organization.logo
																			}
																			className="size-8"
																		/>
																		<div className="leading-tight">
																			<p className="font-medium">
																				{
																					organization.name
																				}
																			</p>
																			<p className="text-muted-foreground text-xs">
																				{
																					organization.slug
																				}
																			</p>
																		</div>
																	</div>
																</TableCell>
																<TableCell>
																	{
																		organization.membersCount
																	}
																</TableCell>
																<TableCell className="text-right">
																	{isActive ? (
																		<Badge
																			variant="secondary"
																			className="inline-flex items-center gap-1"
																		>
																			<CheckIcon className="size-3" />
																			Active
																		</Badge>
																	) : (
																		<Button
																			size="sm"
																			onClick={(
																				event,
																			) => {
																				event.stopPropagation();
																				void switchOrganization(
																					{
																						organizationId:
																							organization.id,
																						organizationSlug:
																							organization.slug,
																					},
																				);
																			}}
																		>
																			Switch
																		</Button>
																	)}
																</TableCell>
															</TableRow>
														);
													},
												)}
										{!isOrganizationsLoading &&
											organizations.length === 0 && (
												<TableRow>
													<TableCell
														colSpan={3}
														className="h-24 text-center text-muted-foreground"
													>
														No organizations found.
													</TableCell>
												</TableRow>
											)}
									</TableBody>
								</Table>
							</div>

							{!!organizationsData?.total &&
								organizationsData.total > ITEMS_PER_PAGE && (
									<Pagination
										className="mt-2"
										totalItems={organizationsData.total}
										itemsPerPage={ITEMS_PER_PAGE}
										currentPage={orgPage}
										onChangeCurrentPage={setOrgPage}
									/>
								)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="admins" className="space-y-4">
					<Card className="rounded-2xl border">
						<CardHeader className="pb-2">
							<CardTitle className="font-semibold text-lg">
								Admin Users
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Input
								type="search"
								placeholder="Search users"
								value={userSearch}
								onChange={(event) => {
									setUserSearch(event.target.value);
									setAdminPage(1);
								}}
							/>

							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>User</TableHead>
											<TableHead>Email</TableHead>
											<TableHead className="text-right">
												Action
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{isUsersLoading
											? Array.from({ length: 5 }).map(
													(_, index) => (
														<TableRow
															key={`admin-skeleton-${index}`}
														>
															<TableCell>
																<Skeleton className="h-5 w-40" />
															</TableCell>
															<TableCell>
																<Skeleton className="h-5 w-52" />
															</TableCell>
															<TableCell className="text-right">
																<Skeleton className="ml-auto h-8 w-28" />
															</TableCell>
														</TableRow>
													),
												)
											: paginatedAdminUsers.map(
													(user) => (
														<TableRow key={user.id}>
															<TableCell>
																<div className="flex items-center gap-2">
																	<ShieldCheckIcon className="size-4 text-primary" />
																	<span className="font-medium">
																		{user.name ||
																			"Unnamed user"}
																	</span>
																</div>
															</TableCell>
															<TableCell>
																{user.email}
															</TableCell>
															<TableCell className="text-right">
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		void updateAdminRole(
																			{
																				userId: user.id,
																				role: "user",
																			},
																		)
																	}
																>
																	Remove Admin
																</Button>
															</TableCell>
														</TableRow>
													),
												)}
										{!isUsersLoading &&
											paginatedAdminUsers.length ===
												0 && (
												<TableRow>
													<TableCell
														colSpan={3}
														className="h-24 text-center text-muted-foreground"
													>
														No admin users found.
													</TableCell>
												</TableRow>
											)}
									</TableBody>
								</Table>
							</div>

							{adminUsers.length > ITEMS_PER_PAGE && (
								<Pagination
									className="mt-2"
									totalItems={adminUsers.length}
									itemsPerPage={ITEMS_PER_PAGE}
									currentPage={adminPage}
									onChangeCurrentPage={setAdminPage}
								/>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-2xl border">
						<CardHeader className="pb-2">
							<CardTitle className="font-semibold text-lg">
								Invited Admins
							</CardTitle>
							<p className="text-muted-foreground text-sm">
								Read-only pending admin invites for the selected
								organization.
							</p>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between rounded-md border bg-muted/30 p-3">
								<div className="flex items-center gap-2 text-sm">
									<UsersIcon className="size-4 text-muted-foreground" />
									<span className="text-muted-foreground">
										Organization context:
									</span>
									<span className="font-medium">
										{selectedOrganization?.name ||
											organizations.find(
												(org) =>
													org.id ===
													effectiveSelectedOrganizationId,
											)?.name ||
											"No organization selected"}
									</span>
								</div>
								{effectiveSelectedOrganizationId ? (
									<Badge variant="outline">Selected</Badge>
								) : null}
							</div>

							{invitesError ? (
								<div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
									<ShieldAlertIcon className="size-4" />
									<span>
										Unable to load invites for this
										organization.
									</span>
								</div>
							) : null}

							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Email</TableHead>
											<TableHead>Role</TableHead>
											<TableHead>Expires</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{isInvitesLoading
											? Array.from({ length: 3 }).map(
													(_, index) => (
														<TableRow
															key={`invite-skeleton-${index}`}
														>
															<TableCell>
																<Skeleton className="h-5 w-56" />
															</TableCell>
															<TableCell>
																<Skeleton className="h-5 w-16" />
															</TableCell>
															<TableCell>
																<Skeleton className="h-5 w-36" />
															</TableCell>
														</TableRow>
													),
												)
											: pendingAdminInvites.map(
													(invitation) => (
														<TableRow
															key={invitation.id}
														>
															<TableCell>
																{
																	invitation.email
																}
															</TableCell>
															<TableCell>
																<Badge variant="secondary">
																	{
																		invitation.role
																	}
																</Badge>
															</TableCell>
															<TableCell>
																{new Date(
																	invitation.expiresAt,
																).toLocaleString()}
															</TableCell>
														</TableRow>
													),
												)}
										{!isInvitesLoading &&
											pendingAdminInvites.length ===
												0 && (
												<TableRow>
													<TableCell
														colSpan={3}
														className="h-24 text-center text-muted-foreground"
													>
														No pending admin
														invites.
													</TableCell>
												</TableRow>
											)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
