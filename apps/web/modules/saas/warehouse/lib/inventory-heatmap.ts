export interface LocationInventoryItem {
	skuCode: string;
	skuName: string;
	qty: number;
	lotNumber?: string | null;
}

export interface LocationInventorySummary {
	locationId: string;
	locationCode: string;
	totalQty: number;
	items: LocationInventoryItem[];
}

export type InventoryByLocationId = Map<string, LocationInventorySummary>;

function hexToRgb(hex: string) {
	const n = Number.parseInt(hex.replace("#", ""), 16);
	return {
		r: (n >> 16) & 255,
		g: (n >> 8) & 255,
		b: n & 255,
	};
}

function rgbToHex(r: number, g: number, b: number) {
	return `#${[r, g, b]
		.map((v) => Math.round(v).toString(16).padStart(2, "0"))
		.join("")}`;
}

function lerpColor(from: string, to: string, t: number) {
	const a = hexToRgb(from);
	const b = hexToRgb(to);
	return rgbToHex(
		a.r + (b.r - a.r) * t,
		a.g + (b.g - a.g) * t,
		a.b + (b.b - a.b) * t,
	);
}

/** Green (empty) → amber → red (dense). */
export function heatmapColor(ratio: number): string {
	const t = Math.min(1, Math.max(0, ratio));
	if (t < 0.5) {
		return lerpColor("#22c55e", "#f59e0b", t * 2);
	}
	return lerpColor("#f59e0b", "#ef4444", (t - 0.5) * 2);
}

export function computeHeatmapRatio(
	qty: number,
	maxQty: number,
): number {
	if (maxQty <= 0) {
		return qty > 0 ? 1 : 0;
	}
	return qty / maxQty;
}
