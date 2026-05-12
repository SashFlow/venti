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

type ProductsContextValue = {
	organizationId: string | null;
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;
	page: number;
	setPage: Dispatch<SetStateAction<number>>;
	invalidateProducts: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | undefined>(
	undefined,
);

export function ProductsProvider({ children }: PropsWithChildren) {
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

	const invalidateProducts = async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.products.list.key(),
		});
	};

	const value = useMemo(
		() => ({
			organizationId,
			search,
			setSearch,
			page,
			setPage,
			invalidateProducts,
		}),
		[organizationId, search, page],
	);

	return (
		<ProductsContext.Provider value={value}>
			{children}
		</ProductsContext.Provider>
	);
}

export function useProductsContext() {
	const context = useContext(ProductsContext);

	if (!context) {
		throw new Error(
			"useProductsContext must be used within ProductsProvider",
		);
	}

	return context;
}
