"use client";
import type { Organization } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { sessionQueryKey, useSessionQuery } from "@saas/auth/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { SessionContext } from "../lib/session-context";

export function SessionProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const { data: session } = useSessionQuery();
	const [loaded, setLoaded] = useState(!!session);

	useEffect(() => {
		const activeOrganizationId = session?.session.activeOrganizationId;

		if (!session || loaded || !activeOrganizationId) {
			return;
		}

		const loadOrganization = async () => {
			const { data, error } =
				await authClient.organization.getFullOrganization({
					query: {
						organizationId: activeOrganizationId,
					},
				});

			if (error) {
				setLoaded(true);
				return;
			}

			if (data) {
				setOrganization(data);
			}

			setLoaded(true);
		};

		void loadOrganization();
	}, [loaded, session]);

	return (
		<SessionContext.Provider
			value={{
				loaded,
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

					queryClient.setQueryData(sessionQueryKey, () => newSession);
				},
			}}
		>
			{children}
		</SessionContext.Provider>
	);
}
