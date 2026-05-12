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

type VendorsContextValue = {
	organizationId: string | null;
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;
	page: number;
	setPage: Dispatch<SetStateAction<number>>;
	invalidateVendors: () => Promise<void>;
};

const VendorsContext = createContext<VendorsContextValue | undefined>(
	undefined,
);

export function VendorsProvider({ children }: PropsWithChildren) {
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

	const invalidateVendors = async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.masterData.suppliers.list.key(),
		});
	};

	const value = useMemo(
		() => ({
			organizationId,
			search,
			setSearch,
			page,
			setPage,
			invalidateVendors,
		}),
		[organizationId, search, page],
	);

	return (
		<VendorsContext.Provider value={value}>
			{children}
		</VendorsContext.Provider>
	);
}

export function useVendorsContext() {
	const context = useContext(VendorsContext);

	if (!context) {
		throw new Error(
			"useVendorsContext must be used within VendorsProvider",
		);
	}

	return context;
}
