"use client";

import type { Organization } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { sessionQueryKey, useSessionQuery } from "@saas/auth/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { SessionContext } from "../lib/session-context";

export function SessionProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();

	const { data: session, isLoading: sessionLoading } = useSessionQuery();

	const [organization, setOrganization] = useState<Organization | null>(null);

	const [organizationLoaded, setOrganizationLoaded] = useState(false);

	useEffect(() => {
		const activeOrganizationId = session?.session.activeOrganizationId;

		if (!activeOrganizationId) {
			setOrganizationLoaded(true);
			return;
		}

		let cancelled = false;

		const loadOrganization = async () => {
			setOrganizationLoaded(false);

			const { data, error } =
				await authClient.organization.getFullOrganization({
					query: {
						organizationId: activeOrganizationId,
					},
				});

			if (cancelled) return;

			if (!error && data) {
				setOrganization(data);
			}

			setOrganizationLoaded(true);
		};

		void loadOrganization();

		return () => {
			cancelled = true;
		};
	}, [session?.session.activeOrganizationId]);

	return (
		<SessionContext.Provider
			value={{
				loaded: !sessionLoading && organizationLoaded,

				session: session?.session ?? null,

				user: session?.user ?? null,

				organization,

				reloadSession: async () => {
					const { data: newSession, error } =
						await authClient.getSession({
							query: {
								disableCookieCache: true,
							},
						});

					if (error) {
						throw new Error(
							error.message || "Failed to fetch session",
						);
					}

					queryClient.setQueryData(sessionQueryKey, newSession);
				},
			}}
		>
			{children}
		</SessionContext.Provider>
	);
}
