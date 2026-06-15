import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import { Vector3 } from "three";
import type { AgvUnit } from "../lib/agv-sim-types";
import { routeCoordToMm } from "../lib/route-viz-types";
import { mmToM } from "../lib/warehouse-types";

type Centering = { cx: number; cz: number };

function agvToPoint(
	pos: { x: number; z: number },
	c: Centering,
	baseY: number,
): [number, number, number] {
	const xMm = routeCoordToMm(pos.x);
	const zMm = routeCoordToMm(pos.z);
	return [mmToM(xMm) - c.cx, baseY, mmToM(zMm) - c.cz];
}

function AgvMesh({
	unit,
	c,
	baseY,
}: {
	unit: AgvUnit;
	c: Centering;
	baseY: number;
}) {
	const ref = useRef<Mesh>(null);
	const target = useMemo(
		() => agvToPoint(unit.position, c, baseY),
		[unit.position, c, baseY],
	);
	const targetVec = useMemo(
		() => new Vector3(target[0], target[1], target[2]),
		[target],
	);

	useFrame(() => {
		if (!ref.current) return;
		ref.current.position.lerp(targetVec, 0.2);
	});

	const statusColor =
		unit.status === "EN_ROUTE"
			? "#3b82f6"
			: unit.status === "LOADING" || unit.status === "UNLOADING"
				? "#f59e0b"
				: "#22c55e";

	return (
		<mesh ref={ref} position={target} castShadow>
			<boxGeometry args={[0.8, 0.5, 1.2]} />
			<meshStandardMaterial color={statusColor} roughness={0.4} metalness={0.3} />
		</mesh>
	);
}

export function AgvPathOverlay({
	fleet,
	c,
	baseY = 0.35,
}: {
	fleet: AgvUnit[];
	c: Centering;
	baseY?: number;
}) {
	return (
		<>
			{fleet.map((unit) => (
				<AgvMesh key={unit.id} unit={unit} c={c} baseY={baseY} />
			))}
		</>
	);
}
