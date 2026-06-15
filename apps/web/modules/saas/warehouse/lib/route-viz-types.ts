export type RouteVizStop = {
	lineId: string;
	locationId: string;
	locationCode: string;
	skuCode: string;
	sequence: number;
	x: number;
	y: number;
	z: number;
};

export type RouteVizPicker = {
	label: string;
	cartId: string;
	zoneCode: string;
	distanceM: number;
	lineCount: number;
	color: string;
	stops: RouteVizStop[];
};

export type RouteVizPlan = {
	pickerCount: number;
	naiveDistanceM: number;
	optimizedDistanceM: number;
	savingsPercent: number;
	pickers: RouteVizPicker[];
	warnings?: string[];
};

export function parseRoutePlan(raw: unknown): RouteVizPlan | null {
	if (!raw || typeof raw !== "object") {
		return null;
	}
	const plan = raw as RouteVizPlan;
	if (!Array.isArray(plan.pickers)) {
		return null;
	}
	return plan;
}

/** Seed data uses metres; layout editor uses mm. */
export function routeCoordToMm(value: number): number {
	if (Math.abs(value) < 500) {
		return value * 1000;
	}
	return value;
}
