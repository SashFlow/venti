"use client";

import { authClient } from "@repo/auth/client";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import { sessionQueryKey } from "@saas/auth/lib/api";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	AdminsTabContent,
	type MasterAdminUser,
	type MasterOrganization,
	OrganizationsTabContent,
	type PendingAdminInvite,
} from "./components/tab-contents";

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
				)
				.map((invitation) => ({
					...invitation,
					expiresAt: new Date(invitation.expiresAt).toISOString(),
				})) ?? []
		);
	}, [selectedOrganization?.invitations]);

	const selectedOrganizationName =
		selectedOrganization?.name ||
		organizations.find((org) => org.id === effectiveSelectedOrganizationId)
			?.name ||
		"No organization selected";

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

				<OrganizationsTabContent
					organizations={organizations as MasterOrganization[]}
					isOrganizationsLoading={isOrganizationsLoading}
					orgSearch={orgSearch}
					orgPage={orgPage}
					organizationsTotal={organizationsData?.total}
					activeOrganizationId={session?.activeOrganizationId}
					onOrgSearchChange={(value) => {
						setOrgSearch(value);
						setOrgPage(1);
					}}
					onOrgPageChange={setOrgPage}
					onSelectOrganization={setSelectedOrganizationId}
					onSwitchOrganization={(params) => {
						void switchOrganization(params);
					}}
					itemsPerPage={ITEMS_PER_PAGE}
				/>

				<AdminsTabContent
					userSearch={userSearch}
					adminPage={adminPage}
					adminUsersCount={adminUsers.length}
					paginatedAdminUsers={
						paginatedAdminUsers as MasterAdminUser[]
					}
					isUsersLoading={isUsersLoading}
					isInvitesLoading={isInvitesLoading}
					invitesError={invitesError}
					pendingAdminInvites={
						pendingAdminInvites as PendingAdminInvite[]
					}
					selectedOrganizationName={selectedOrganizationName}
					effectiveSelectedOrganizationId={
						effectiveSelectedOrganizationId
					}
					onUserSearchChange={(value) => {
						setUserSearch(value);
						setAdminPage(1);
					}}
					onAdminPageChange={setAdminPage}
					onRemoveAdmin={(userId) => {
						void updateAdminRole({ userId, role: "user" });
					}}
					itemsPerPage={ITEMS_PER_PAGE}
				/>
			</Tabs>
		</div>
	);
}
