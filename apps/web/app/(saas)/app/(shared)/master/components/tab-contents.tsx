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
import { TabsContent } from "@repo/ui/tabs";
import { OrganizationLogo } from "@saas/organizations/components/OrganizationLogo";
import { Pagination } from "@saas/shared/components/Pagination";
import {
	CheckIcon,
	ShieldAlertIcon,
	ShieldCheckIcon,
	UsersIcon,
} from "lucide-react";

export type MasterOrganization = {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	membersCount: number;
};

export type MasterAdminUser = {
	id: string;
	name?: string | null;
	email: string;
};

export type PendingAdminInvite = {
	id: string;
	email: string;
	role: string;
	expiresAt: string;
};

type OrganizationsTabContentProps = {
	organizations: MasterOrganization[];
	isOrganizationsLoading: boolean;
	orgSearch: string;
	orgPage: number;
	organizationsTotal?: number;
	activeOrganizationId?: string | null;
	onOrgSearchChange: (value: string) => void;
	onOrgPageChange: (value: number) => void;
	onSelectOrganization: (id: string) => void;
	onSwitchOrganization: (params: {
		organizationId: string;
		organizationSlug: string;
	}) => void;
	itemsPerPage: number;
};

export function OrganizationsTabContent({
	organizations,
	isOrganizationsLoading,
	orgSearch,
	orgPage,
	organizationsTotal,
	activeOrganizationId,
	onOrgSearchChange,
	onOrgPageChange,
	onSelectOrganization,
	onSwitchOrganization,
	itemsPerPage,
}: OrganizationsTabContentProps) {
	return (
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
						onChange={(event) =>
							onOrgSearchChange(event.target.value)
						}
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
									: organizations.map((organization) => {
											const isActive =
												activeOrganizationId ===
												organization.id;

											return (
												<TableRow
													key={organization.id}
													onClick={() =>
														onSelectOrganization(
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
																	onSwitchOrganization(
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
										})}
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

					{!!organizationsTotal &&
						organizationsTotal > itemsPerPage && (
							<Pagination
								className="mt-2"
								totalItems={organizationsTotal}
								itemsPerPage={itemsPerPage}
								currentPage={orgPage}
								onChangeCurrentPage={onOrgPageChange}
							/>
						)}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

type AdminsTabContentProps = {
	userSearch: string;
	adminPage: number;
	adminUsersCount: number;
	paginatedAdminUsers: MasterAdminUser[];
	isUsersLoading: boolean;
	isInvitesLoading: boolean;
	invitesError: unknown;
	pendingAdminInvites: PendingAdminInvite[];
	selectedOrganizationName: string;
	effectiveSelectedOrganizationId: string | null;
	onUserSearchChange: (value: string) => void;
	onAdminPageChange: (value: number) => void;
	onRemoveAdmin: (userId: string) => void;
	itemsPerPage: number;
};

export function AdminsTabContent({
	userSearch,
	adminPage,
	adminUsersCount,
	paginatedAdminUsers,
	isUsersLoading,
	isInvitesLoading,
	invitesError,
	pendingAdminInvites,
	selectedOrganizationName,
	effectiveSelectedOrganizationId,
	onUserSearchChange,
	onAdminPageChange,
	onRemoveAdmin,
	itemsPerPage,
}: AdminsTabContentProps) {
	return (
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
						onChange={(event) =>
							onUserSearchChange(event.target.value)
						}
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
									: paginatedAdminUsers.map((user) => (
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
															onRemoveAdmin(
																user.id,
															)
														}
													>
														Remove Admin
													</Button>
												</TableCell>
											</TableRow>
										))}
								{!isUsersLoading &&
									paginatedAdminUsers.length === 0 && (
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

					{adminUsersCount > itemsPerPage && (
						<Pagination
							className="mt-2"
							totalItems={adminUsersCount}
							itemsPerPage={itemsPerPage}
							currentPage={adminPage}
							onChangeCurrentPage={onAdminPageChange}
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
								{selectedOrganizationName}
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
								Unable to load invites for this organization.
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
									: pendingAdminInvites.map((invitation) => (
											<TableRow key={invitation.id}>
												<TableCell>
													{invitation.email}
												</TableCell>
												<TableCell>
													<Badge variant="secondary">
														{invitation.role}
													</Badge>
												</TableCell>
												<TableCell>
													{new Date(
														invitation.expiresAt,
													).toLocaleString()}
												</TableCell>
											</TableRow>
										))}
								{!isInvitesLoading &&
									pendingAdminInvites.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={3}
												className="h-24 text-center text-muted-foreground"
											>
												No pending admin invites.
											</TableCell>
										</TableRow>
									)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
