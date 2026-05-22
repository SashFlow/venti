/**
 * TSP nearest-neighbor route optimizer for pick list sequencing.
 *
 * Given a list of pick lines (each with an (x, y) coordinate from
 * StorageUnit.startX / startY), it returns the same lines in an order that
 * minimises total travel distance using the nearest-neighbor heuristic.
 *
 * Time complexity: O(n²) — well within budget for ≤ 30 lines per wave.
 */

export interface PickNode {
	id: string; // WaveLine id
	x: number;
	y: number;
}

export interface RouteResult {
	orderedIds: string[]; // WaveLine ids in visit order
	estimatedDistanceMm: number; // Sum of Euclidean distances in mm
}

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }) {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Nearest-neighbor TSP starting from `startNode` (defaults to origin 0,0 which
 * represents the INBOUND / RECEIVING zone dock position).
 */
export function optimizePickRoute(
	nodes: PickNode[],
	startNode: { x: number; y: number } = { x: 0, y: 0 },
): RouteResult {
	if (nodes.length === 0) {
		return { orderedIds: [], estimatedDistanceMm: 0 };
	}

	const remaining = [...nodes];
	const visited: PickNode[] = [];
	let current = startNode;
	let totalDistance = 0;

	while (remaining.length > 0) {
		let closestIdx = 0;
		let closestDist = Number.POSITIVE_INFINITY;

		for (let i = 0; i < remaining.length; i++) {
			const d = euclidean(current, remaining[i]);
			if (d < closestDist) {
				closestDist = d;
				closestIdx = i;
			}
		}

		const next = remaining[closestIdx];
		visited.push(next);
		totalDistance += closestDist;
		current = next;
		remaining.splice(closestIdx, 1);
	}

	return {
		orderedIds: visited.map((n) => n.id),
		estimatedDistanceMm: Math.round(totalDistance),
	};
}
