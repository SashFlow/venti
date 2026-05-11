"use client";

import { Card, CardContent } from "@repo/ui/card";
import { TabsContent } from "@repo/ui/tabs";
import type { ReactNode } from "react";

export const ROLE_GROUP_TABS = [
	{ value: "workers", label: "Workers" },
	{ value: "invite", label: "Invite" },
	{ value: "invited", label: "Invited" },
	{ value: "role-group", label: "Role Group" },
] as const;

export function WorkersTabContent({
	organizationMembers,
	memberRoleAssignments,
}: {
	organizationMembers: ReactNode;
	memberRoleAssignments: ReactNode;
}) {
	return (
		<TabsContent value="workers" className="space-y-4">
			<Card className="rounded-2xl border">
				<CardContent className="p-0">{organizationMembers}</CardContent>
			</Card>
			{memberRoleAssignments}
		</TabsContent>
	);
}

export function InviteTabContent({
	inviteMemberForm,
}: {
	inviteMemberForm: ReactNode;
}) {
	return (
		<TabsContent value="invite" className="space-y-4">
			{inviteMemberForm}
		</TabsContent>
	);
}

export function InvitedTabContent({
	organizationInvitations,
}: {
	organizationInvitations: ReactNode;
}) {
	return (
		<TabsContent value="invited" className="space-y-4">
			<Card className="rounded-2xl border">
				<CardContent className="p-4 md:p-6">
					{organizationInvitations}
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function RoleGroupTabContent({
	roleGroupBuilder,
}: {
	roleGroupBuilder: ReactNode;
}) {
	return (
		<TabsContent value="role-group" className="space-y-4">
			{roleGroupBuilder}
		</TabsContent>
	);
}
