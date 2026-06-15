import { distanceM, tourDistance } from "./distance";
import type { Point3D, RouteStop } from "./types";

export function nearestNeighborTour(
	start: Point3D,
	stops: RouteStop[],
): RouteStop[] {
	const remaining = [...stops];
	const tour: RouteStop[] = [];
	let current = start;

	while (remaining.length > 0) {
		let bestIdx = 0;
		let bestDist = Number.POSITIVE_INFINITY;
		for (let i = 0; i < remaining.length; i++) {
			const d = distanceM(current, remaining[i]!.point);
			if (d < bestDist) {
				bestDist = d;
				bestIdx = i;
			}
		}
		const next = remaining.splice(bestIdx, 1)[0]!;
		tour.push(next);
		current = next.point;
	}

	return tour;
}

export function twoOptImprove(
	start: Point3D,
	tour: RouteStop[],
	maxIterations = 50,
): RouteStop[] {
	if (tour.length < 3) {
		return tour;
	}

	let best = [...tour];
	const pathDist = (route: RouteStop[]) =>
		tourDistance([start, ...route.map((s) => s.point)]);
	let bestDist = pathDist(best);
	let improved = true;
	let iterations = 0;

	while (improved && iterations < maxIterations) {
		improved = false;
		iterations++;
		for (let i = 0; i < best.length - 1; i++) {
			for (let j = i + 2; j < best.length; j++) {
				const candidate = [
					...best.slice(0, i + 1),
					...best.slice(i + 1, j + 1).reverse(),
					...best.slice(j + 1),
				];
				const candidateDist = pathDist(candidate);
				if (candidateDist < bestDist) {
					best = candidate;
					bestDist = candidateDist;
					improved = true;
				}
			}
		}
	}

	return best;
}

export function optimizeTour(
	start: Point3D,
	stops: RouteStop[],
): RouteStop[] {
	if (stops.length === 0) {
		return [];
	}
	const nn = nearestNeighborTour(start, stops);
	return twoOptImprove(start, nn);
}
