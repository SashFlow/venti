import { Line } from "@react-three/drei";
import { useMemo } from "react";
import {
	type RouteVizPlan,
	routeCoordToMm,
} from "../lib/route-viz-types";
import { mmToM } from "../lib/warehouse-types";

type Centering = { cx: number; cz: number };

function stopToPoint(
	stop: { x: number; z: number },
	c: Centering,
	baseY: number,
): [number, number, number] {
	const xMm = routeCoordToMm(stop.x);
	const zMm = routeCoordToMm(stop.z);
	return [mmToM(xMm) - c.cx, baseY, mmToM(zMm) - c.cz];
}

export function RoutePathOverlay({
	routePlan,
	c,
	highlightPicker,
	baseY = 0.2,
}: {
	routePlan: RouteVizPlan;
	c: Centering;
	highlightPicker?: string | null;
	baseY?: number;
}) {
	const lines = useMemo(() => {
		return routePlan.pickers
			.filter(
				(p) =>
					!highlightPicker ||
					highlightPicker === "all" ||
					p.label === highlightPicker,
			)
			.map((picker) => {
				const points = picker.stops.map((stop) =>
					stopToPoint(stop, c, baseY),
				);
				return { key: picker.label, color: picker.color, points };
			})
			.filter((l) => l.points.length >= 2);
	}, [routePlan, c, highlightPicker, baseY]);

	return (
		<>
			{lines.map((line) => (
				<Line
					key={line.key}
					points={line.points}
					color={line.color}
					lineWidth={3}
					dashed={false}
				/>
			))}
		</>
	);
}
