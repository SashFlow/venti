import type { Point3D } from "./types";

/** Travel distance on warehouse floor (XZ plane). */
export function distanceM(a: Point3D, b: Point3D): number {
	const dx = a.x - b.x;
	const dz = a.z - b.z;
	return Math.hypot(dx, dz);
}

export function tourDistance(points: Point3D[]): number {
	if (points.length < 2) {
		return 0;
	}
	let total = 0;
	for (let i = 1; i < points.length; i++) {
		total += distanceM(points[i - 1]!, points[i]!);
	}
	return total;
}

export function centroid(points: Point3D[]): Point3D {
	if (points.length === 0) {
		return { x: 0, y: 0, z: 0 };
	}
	const sum = points.reduce(
		(acc, p) => ({
			x: acc.x + p.x,
			y: acc.y + p.y,
			z: acc.z + p.z,
		}),
		{ x: 0, y: 0, z: 0 },
	);
	return {
		x: sum.x / points.length,
		y: sum.y / points.length,
		z: sum.z / points.length,
	};
}
