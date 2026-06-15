import { centroid, distanceM, tourDistance } from "./distance";
import { partitionStops } from "./partition";
import { optimizeTour } from "./tsp";
import type {
	OptimizeRoutesOptions,
	PickerRoute,
	PickerRouteStop,
	Point3D,
	RouteStop,
	WaveRoutePlan,
} from "./types";
import { PICKER_COLORS } from "./types";

function naiveDistance(stops: RouteStop[]): number {
	if (stops.length < 2) {
		return 0;
	}
	return tourDistance(stops.map((s) => s.point));
}

function zoneEntryPoint(stops: RouteStop[], fallback?: Point3D): Point3D {
	if (fallback) {
		return fallback;
	}
	return centroid(stops.map((s) => s.point));
}

function toPickerRoute(
	label: string,
	cartId: string,
	zoneCode: string,
	color: string,
	ordered: RouteStop[],
	start: Point3D,
): PickerRoute {
	const stops: PickerRouteStop[] = ordered.map((stop, idx) => ({
		lineId: stop.lineId,
		locationId: stop.locationId,
		locationCode: stop.locationCode,
		skuCode: stop.skuCode,
		sequence: idx + 1,
		x: stop.point.x,
		y: stop.point.y,
		z: stop.point.z,
	}));

	const pathPoints = [start, ...ordered.map((s) => s.point)];
	const distanceM = tourDistance(pathPoints);

	return {
		label,
		cartId,
		zoneCode,
		distanceM: Math.round(distanceM * 100) / 100,
		lineCount: stops.length,
		color,
		stops,
	};
}

export function optimizeRoutes(
	stops: RouteStop[],
	options: OptimizeRoutesOptions,
): WaveRoutePlan {
	const warnings: string[] = [];
	const validStops = stops.filter((s) => s.locationId);

	if (validStops.length < stops.length) {
		warnings.push(
			`${stops.length - validStops.length} line(s) skipped — no bin location.`,
		);
	}

	const naive = naiveDistance(validStops);
	const groups = partitionStops(
		validStops,
		options.waveType,
		options.pickerCount,
	);

	const pickers: PickerRoute[] = [];
	let optimizedTotal = 0;

	groups.forEach((group, idx) => {
		const label = `Picker ${idx + 1}`;
		const cartId = `C-${String(idx + 1).padStart(2, "0")}`;
		const zoneCode =
			group[0]?.zoneCode ??
			(group.length > 1 ? "MULTI" : group[0]?.zoneCode ?? "DEFAULT");
		const color = PICKER_COLORS[idx % PICKER_COLORS.length]!;
		const start = zoneEntryPoint(group, options.entryPoint);
		const ordered = optimizeTour(start, group);
		const route = toPickerRoute(label, cartId, zoneCode, color, ordered, start);
		pickers.push(route);
		optimizedTotal += route.distanceM;
	});

	const naiveDistanceM = Math.round(naive * 100) / 100;
	const optimizedDistanceM = Math.round(optimizedTotal * 100) / 100;
	const savingsPercent =
		naiveDistanceM > 0
			? Math.round(
					((naiveDistanceM - optimizedDistanceM) / naiveDistanceM) *
						10000,
				) / 100
			: 0;

	return {
		pickerCount: pickers.length,
		naiveDistanceM,
		optimizedDistanceM,
		savingsPercent: Math.max(0, savingsPercent),
		pickers,
		warnings: warnings.length > 0 ? warnings : undefined,
	};
}

export function distanceBetweenStops(a: RouteStop, b: RouteStop): number {
	return distanceM(a.point, b.point);
}

export type {
	OptimizeRoutesOptions,
	PickerRoute,
	PickerRouteStop,
	Point3D,
	RouteStop,
	WaveRoutePlan,
} from "./types";
export { PICKER_COLORS } from "./types";
