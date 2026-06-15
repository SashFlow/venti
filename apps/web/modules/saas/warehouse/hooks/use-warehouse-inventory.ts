import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
	InventoryByLocationId,
	LocationInventorySummary,
} from "../lib/inventory-heatmap";

type BalanceRow = {
	locationId: string;
	quantityAvailable: unknown;
	sku?: { code?: string; product?: { name?: string } | null } | null;
	lot?: { lotNumber?: string | null } | null;
	location?: { code?: string } | null;
};

export function useWarehouseInventory(
	organizationId: string,
	warehouseId: string,
	enabled = true,
) {
	const query = useQuery({
		...orpc.inventory.balances.queryOptions({
			input: {
				organizationId,
				warehouseId,
				state: "AVAILABLE",
				limit: 5000,
				offset: 0,
			},
		}),
		enabled: Boolean(organizationId && warehouseId && enabled),
	});

	const { byLocationId, maxQty } = useMemo(() => {
		const balances = (query.data ?? []) as BalanceRow[];
		const map: InventoryByLocationId = new Map();
		let max = 0;

		for (const balance of balances) {
			const qty = Number(balance.quantityAvailable ?? 0);
			if (qty <= 0) {
				continue;
			}

			const locationId = balance.locationId;
			const existing = map.get(locationId);
			const item = {
				skuCode: balance.sku?.code ?? "—",
				skuName: balance.sku?.product?.name ?? balance.sku?.code ?? "—",
				qty,
				lotNumber: balance.lot?.lotNumber ?? null,
			};

			if (existing) {
				existing.totalQty += qty;
				existing.items.push(item);
			} else {
				map.set(locationId, {
					locationId,
					locationCode: balance.location?.code ?? locationId,
					totalQty: qty,
					items: [item],
				});
			}
			max = Math.max(max, map.get(locationId)!.totalQty);
		}

		return { byLocationId: map, maxQty: max };
	}, [query.data]);

	return {
		isLoading: query.isLoading,
		byLocationId,
		maxQty,
		getSummary: (locationId: string): LocationInventorySummary | undefined =>
			byLocationId.get(locationId),
	};
}
