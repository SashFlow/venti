"use client";

import { formatOrgCurrency } from "@shared/lib/format-org-currency";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useMemo, type ReactNode } from "react";

function readDisplayCurrency(units: unknown): string {
	if (!units || typeof units !== "object" || Array.isArray(units)) {
		return "inr";
	}

	const value = (units as Record<string, unknown>).displayCurrency;
	return typeof value === "string" && value.trim() ? value : "inr";
}

const OrgCurrencyContext = createContext({
	currency: "inr",
	formatCurrency: (amount: number) => formatOrgCurrency(amount, "inr", true),
	formatCurrencyFull: (amount: number) =>
		formatOrgCurrency(amount, "inr", false),
});

export function OrgCurrencyProvider({
	organizationId,
	children,
}: {
	organizationId: string;
	children: ReactNode;
}) {
	const { data } = useQuery({
		...orpc.organizations.getConfig.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
	});

	const currency = useMemo(
		() => readDisplayCurrency(data?.config?.units),
		[data?.config?.units],
	);

	const value = useMemo(
		() => ({
			currency,
			formatCurrency: (amount: number) =>
				formatOrgCurrency(amount, currency, true),
			formatCurrencyFull: (amount: number) =>
				formatOrgCurrency(amount, currency, false),
		}),
		[currency],
	);

	return (
		<OrgCurrencyContext.Provider value={value}>
			{children}
		</OrgCurrencyContext.Provider>
	);
}

export function useOrgCurrency() {
	return useContext(OrgCurrencyContext);
}
