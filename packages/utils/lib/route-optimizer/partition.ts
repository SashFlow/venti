import type { RouteStop, WaveType } from "./types";

export function groupStopsByZone(stops: RouteStop[]): Map<string, RouteStop[]> {
	const groups = new Map<string, RouteStop[]>();
	for (const stop of stops) {
		const zone = stop.zoneCode || "DEFAULT";
		const list = groups.get(zone) ?? [];
		list.push(stop);
		groups.set(zone, list);
	}
	return groups;
}

export function loadBalanceStops(
	stops: RouteStop[],
	pickerCount: number,
): RouteStop[][] {
	if (stops.length === 0) {
		return [];
	}
	const count = Math.max(1, Math.min(pickerCount, stops.length));
	const buckets: RouteStop[][] = Array.from({ length: count }, () => []);

	const sorted = [...stops].sort((a, b) => a.zoneCode.localeCompare(b.zoneCode));
	for (let i = 0; i < sorted.length; i++) {
		buckets[i % count]!.push(sorted[i]!);
	}

	return buckets.filter((b) => b.length > 0);
}

export function partitionStops(
	stops: RouteStop[],
	waveType: WaveType,
	pickerCount: number,
): RouteStop[][] {
	if (stops.length === 0) {
		return [];
	}

	if (waveType === "ZONE") {
		const zones = [...groupStopsByZone(stops).values()];
		if (zones.length <= pickerCount) {
			return zones;
		}
		return loadBalanceStops(stops, pickerCount);
	}

	if (waveType === "SINGLE_ORDER") {
		const byOrder = new Map<string, RouteStop[]>();
		for (const stop of stops) {
			const key = stop.salesOrderId ?? stop.lineId;
			const list = byOrder.get(key) ?? [];
			list.push(stop);
			byOrder.set(key, list);
		}
		return [...byOrder.values()];
	}

	return loadBalanceStops(stops, pickerCount);
}
