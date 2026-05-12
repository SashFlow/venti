"use client";

import { useSession } from "@saas/auth/hooks/use-session";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type Dispatch,
	type PropsWithChildren,
	type SetStateAction,
	useContext,
	useMemo,
	useState,
} from "react";

type PackagingContextValue = {
	organizationId: string | null;
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;
	page: number;
	setPage: Dispatch<SetStateAction<number>>;
	invalidatePackaging: () => Promise<void>;
};

const PackagingContext = createContext<PackagingContextValue | undefined>(
	undefined,
);

export function PackagingProvider({ children }: PropsWithChildren) {
	const queryClient = useQueryClient();
	const { organization: sessionOrganization, session } = useSession();
	const { activeOrganization } = useActiveOrganization();

	const organizationId =
		activeOrganization?.id ??
		sessionOrganization?.id ??
		session?.activeOrganizationId ??
		null;

	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const invalidatePackaging = async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.packaging.list.key(),
		});
	};

	const value = useMemo(
		() => ({
			organizationId,
			search,
			setSearch,
			page,
			setPage,
			invalidatePackaging,
		}),
		[organizationId, search, page],
	);

	return (
		<PackagingContext.Provider value={value}>
			{children}
		</PackagingContext.Provider>
	);
}

export function usePackagingContext() {
	const context = useContext(PackagingContext);

	if (!context) {
		throw new Error(
			"usePackagingContext must be used within PackagingProvider",
		);
	}

	return context;
}
