"use client";

import { authClient } from "@repo/auth/client";
import {
	sessionQueryKey,
	useSessionQuery,
} from "@saas/auth/lib/api";
import { orpcClient } from "@shared/lib/orpc-client";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { SessionContext } from "../lib/session-context";

export function SessionProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const { data: session, isLoading: sessionLoading } = useSessionQuery();

	// Auto-set active organization when it's not set but orgs exist
	useEffect(() => {
		if (
			sessionLoading ||
			!session ||
			session.session.activeOrganizationId
		) {
			return;
		}

		const setFirstOrganization = async () => {
			let firstOrgId: string | null = null;

			if (session.user.role === "admin") {
				// Admins have access to all organizations
				const result = await orpcClient.admin.organizations.list({
					limit: 1,
					offset: 0,
				});
				firstOrgId = result?.organizations?.[0]?.id ?? null;
			} else {
				// Regular users only see orgs they are members of
				const { data } = await authClient.organization.list();
				firstOrgId = data?.[0]?.id ?? null;
			}

			if (!firstOrgId) {
				return;
			}

			await authClient.organization.setActive({
				organizationId: firstOrgId,
			});

			// Refetch the full session query so org is fetched together with
			// the updated session (activeOrganizationId now set)
			await queryClient.refetchQueries({ queryKey: sessionQueryKey });
		};

		setFirstOrganization();
	}, [
		sessionLoading,
		session?.session.activeOrganizationId,
		session?.user.role,
	]);

	return (
		<SessionContext.Provider
			value={{
				loaded: !sessionLoading,

				session: session?.session ?? null,

				organization: session?.organization ?? null,

				user: session?.user ?? null,

				reloadSession: async () => {
					await queryClient.refetchQueries({
						queryKey: sessionQueryKey,
					});
				},
			}}
		>
			{children}
		</SessionContext.Provider>
	);
}
