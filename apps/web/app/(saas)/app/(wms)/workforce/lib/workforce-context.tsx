"use client";

import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useMemo,
} from "react";

type WorkforceContextValue = {
	organizationId: string | null;
	invalidateAccessConfig: (orgId: string) => Promise<void>;
};

const WorkforceContext = createContext<WorkforceContextValue | undefined>(
	undefined,
);

export function WorkforceProvider({ children }: PropsWithChildren) {
	const queryClient = useQueryClient();
	const { organization: sessionOrganization, session } = useSession();
	const { activeOrganization } = useActiveOrganization();

	const organizationId =
		activeOrganization?.id ??
		sessionOrganization?.id ??
		session?.activeOrganizationId ??
		null;

	const invalidateAccessConfig = async (orgId: string) => {
		await queryClient.invalidateQueries({
			queryKey: orpc.workforce.listAccessConfig.key(),
		});
	};

	const value = useMemo(
		() => ({
			organizationId,
			invalidateAccessConfig,
		}),
		[organizationId],
	);

	return (
		<WorkforceContext.Provider value={value}>
			{children}
		</WorkforceContext.Provider>
	);
}

export function useWorkforceContext() {
	const context = useContext(WorkforceContext);

	if (!context) {
		throw new Error(
			"useWorkforceContext must be used within WorkforceProvider",
		);
	}

	return context;
}
