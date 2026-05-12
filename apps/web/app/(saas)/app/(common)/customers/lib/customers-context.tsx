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

type CustomersContextValue = {
	organizationId: string | null;
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;
	page: number;
	setPage: Dispatch<SetStateAction<number>>;
	invalidateCustomers: () => Promise<void>;
};

const CustomersContext = createContext<CustomersContextValue | undefined>(
	undefined,
);

export function CustomersProvider({ children }: PropsWithChildren) {
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

	const invalidateCustomers = async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.customers.list.key(),
		});
	};

	const value = useMemo(
		() => ({
			organizationId,
			search,
			setSearch,
			page,
			setPage,
			invalidateCustomers,
		}),
		[organizationId, search, page],
	);

	return (
		<CustomersContext.Provider value={value}>
			{children}
		</CustomersContext.Provider>
	);
}

export function useCustomersContext() {
	const context = useContext(CustomersContext);

	if (!context) {
		throw new Error(
			"useCustomersContext must be used within CustomersProvider",
		);
	}

	return context;
}
