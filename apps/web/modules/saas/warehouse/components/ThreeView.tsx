import {
	Edges,
	Environment,
	Grid,
	OrbitControls,
	Text,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { computeBoundingBox } from "../lib/warehouse-store";
import type {
	Asset,
	HandlingUnit,
	StorageUnit,
	Warehouse,
	WarehouseFloor,
} from "../lib/warehouse-types";
import {
	ASSET_COLORS,
	HANDLING_UNIT_COLORS,
	mmToM,
	STORAGE_UNIT_COLORS,
} from "../lib/warehouse-types";

interface Centering {
	cx: number;
	cz: number;
}

function unitColor(u: StorageUnit | Asset) {
	return (
		u.colorHex ??
		(STORAGE_UNIT_COLORS[u.type as keyof typeof STORAGE_UNIT_COLORS] ||
			ASSET_COLORS[u.type as keyof typeof ASSET_COLORS])
	);
}

function UnitLabel({
	x,
	y,
	z,
	text,
	color = "#0f172a",
	size = 0.5,
}: {
	x: number;
	y: number;
	z: number;
	text: string;
	color?: string;
	size?: number;
}) {
	return (
		<Text
			position={[x, y, z]}
			fontSize={size}
			color={color}
			anchorX="center"
			anchorY="middle"
			outlineWidth={0.03}
			outlineColor="#ffffff"
		>
			{text}
		</Text>
	);
}

function StorageMesh({
	u,
	floor,
	c,
}: {
	u: StorageUnit | Asset;
	floor: WarehouseFloor;
	c: Centering;
}) {
	const w = mmToM(u.widthMm);
	const d = mmToM(u.lengthMm);
	const h = mmToM(u.heightMm);
	const cx = mmToM(floor.originXMm + u.startXMm) + w / 2 - c.cx;
	const cz = mmToM(floor.originYMm + u.startYMm) + d / 2 - c.cz;
	const baseY = mmToM(floor.elevationMm + u.startZMm);
	const color = unitColor(u);
	const rotY = (u.rotationZDeg * Math.PI) / 180;
	const label =
		"name" in u && u.name ? u.name : "code" in u ? u.code : u.type;
	const uType = u.type as string;

	const labelEl = (
		<UnitLabel
			x={cx}
			y={baseY + h + 0.4}
			z={cz}
			text={label}
			color={color}
			size={Math.min(0.6, Math.max(0.3, w / 6))}
		/>
	);

	if (uType === "FLOOR") {
		return (
			<group>
				<mesh
					position={[cx, baseY + 0.02, cz]}
					rotation={[-Math.PI / 2, 0, rotY]}
					receiveShadow
				>
					<planeGeometry args={[w, d]} />
					<meshStandardMaterial
						color={color}
						transparent
						opacity={0.35}
						roughness={0.9}
					/>
				</mesh>
				<UnitLabel
					x={cx}
					y={baseY + 0.06}
					z={cz}
					text={label}
					color={color}
					size={0.5}
				/>
			</group>
		);
	}

	if (uType === "WALL") {
		return (
			<group rotation={[0, rotY, 0]} position={[cx, 0, cz]}>
				<mesh position={[0, baseY + h / 2, 0]} castShadow receiveShadow>
					<boxGeometry args={[w, h, d]} />
					<meshStandardMaterial color={color} roughness={0.8} />
				</mesh>
			</group>
		);
	}

	if (uType === "RACK") {
		return (
			<group position={[cx, 0, cz]} rotation={[0, rotY, 0]}>
				{/* Frame edges, transparent */}
				<mesh position={[0, baseY + h / 2, 0]}>
					<boxGeometry args={[w, h, d]} />
					<meshPhysicalMaterial
						color={color}
						transparent
						opacity={0.18}
						roughness={0.4}
						transmission={0.6}
						thickness={0.05}
					/>
					<Edges color={color} />
				</mesh>
				{labelEl}
			</group>
		);
	}

	if (uType === "SHELF") {
		return (
			<mesh
				position={[cx, baseY + h / 2, cz]}
				rotation={[0, rotY, 0]}
				castShadow
			>
				<boxGeometry args={[w, h, d]} />
				<meshPhysicalMaterial
					color={color}
					transparent
					opacity={0.45}
					roughness={0.3}
					transmission={0.4}
					thickness={0.05}
				/>
			</mesh>
		);
	}

	if (uType === "BIN") {
		return (
			<mesh
				position={[cx, baseY + h / 2, cz]}
				rotation={[0, rotY, 0]}
				castShadow
			>
				<boxGeometry args={[w, h, d]} />
				<meshStandardMaterial color={color} roughness={0.6} />
				<Edges color="#92400e" />
			</mesh>
		);
	}

	if (uType === "AISLE") {
		return (
			<mesh
				position={[cx, baseY + 0.01, cz]}
				rotation={[-Math.PI / 2, 0, rotY]}
			>
				<planeGeometry args={[w, d]} />
				<meshStandardMaterial color={color} transparent opacity={0.4} />
			</mesh>
		);
	}

	if (uType === "DOCK_DOOR") {
		return (
			<group position={[cx, 0, cz]} rotation={[0, rotY, 0]}>
				<mesh position={[0, baseY + h / 2, 0]} castShadow>
					<boxGeometry args={[w, h, d]} />
					<meshStandardMaterial color={color} roughness={0.5} />
				</mesh>
				{labelEl}
			</group>
		);
	}

	if (uType === "STAIRS") {
		const steps = Math.max(4, Math.round(h / 0.18));
		const stepRise = h / steps;
		const stepRun = d / steps;
		return (
			<group position={[cx, 0, cz]} rotation={[0, rotY, 0]}>
				{Array.from({ length: steps }).map((_, i) => (
					<mesh
						key={i}
						position={[
							0,
							baseY + stepRise / 2 + i * stepRise,
							-d / 2 + stepRun / 2 + i * stepRun,
						]}
						castShadow
						receiveShadow
					>
						<boxGeometry args={[w, stepRise, stepRun]} />
						<meshStandardMaterial color={color} roughness={0.7} />
					</mesh>
				))}
				{labelEl}
			</group>
		);
	}

	return null;
}

function FloorSlab({ floor, c }: { floor: WarehouseFloor; c: Centering }) {
	if (!floor.widthMm || !floor.lengthMm) {
		return null;
	}
	const w = mmToM(floor.widthMm);
	const d = mmToM(floor.lengthMm);
	const cx = mmToM(floor.originXMm) + w / 2 - c.cx;
	const cz = mmToM(floor.originYMm) + d / 2 - c.cz;
	const y = mmToM(floor.elevationMm);
	const isMezz = floor.elevationMm > 0;
	return (
		<group>
			<mesh
				position={[cx, y - 0.05, cz]}
				rotation={[-Math.PI / 2, 0, 0]}
				receiveShadow
			>
				<planeGeometry args={[w, d]} />
				<meshStandardMaterial
					color={isMezz ? "#8b5cf6" : "#e7eaf0"}
					transparent
					opacity={isMezz ? 0.6 : 1}
					roughness={0.95}
				/>
			</mesh>
			{isMezz && (
				<>
					{[
						[-w / 2 + 0.2, -d / 2 + 0.2],
						[w / 2 - 0.2, -d / 2 + 0.2],
						[-w / 2 + 0.2, d / 2 - 0.2],
						[w / 2 - 0.2, d / 2 - 0.2],
					].map(([dx, dz], i) => (
						<mesh key={i} position={[cx + dx, y / 2, cz + dz]}>
							<boxGeometry args={[0.2, y, 0.2]} />
							<meshStandardMaterial color="#64748b" />
						</mesh>
					))}
					<UnitLabel
						x={cx}
						y={y + 0.5}
						z={cz}
						text={`${floor.name || floor.code} +${(y).toFixed(1)}m`}
						color="#8b5cf6"
					/>
				</>
			)}
		</group>
	);
}

function HandlingMesh({
	hu,
	warehouse,
	c,
}: {
	hu: HandlingUnit;
	warehouse: Warehouse;
	c: Centering;
}) {
	if (!hu.currentStorageUnitId) {
		return null;
	}
	let parent: StorageUnit | undefined;
	let parentFloor: WarehouseFloor | undefined;
	for (const f of warehouse.floors) {
		const p = f.storageUnits.find((u) => u.id === hu.currentStorageUnitId);
		if (p) {
			parent = p;
			parentFloor = f;
			break;
		}
	}
	if (!parent || !parentFloor) {
		return null;
	}

	const w = mmToM(hu.widthMm ?? 1000);
	const d = mmToM(hu.lengthMm ?? 1000);
	const h = mmToM(hu.heightMm ?? 1200);
	const cx =
		mmToM(parentFloor.originXMm + parent.startXMm) +
		mmToM(parent.widthMm) / 2 -
		c.cx;
	const cz =
		mmToM(parentFloor.originYMm + parent.startYMm) +
		mmToM(parent.lengthMm) / 2 -
		c.cz;
	const baseY = mmToM(parentFloor.elevationMm + parent.startZMm) + 0.05;
	const color = HANDLING_UNIT_COLORS[hu.type];
	return (
		<mesh position={[cx, baseY + h / 2, cz]} castShadow>
			<boxGeometry args={[w, h, d]} />
			<meshStandardMaterial color={color} roughness={0.6} />
			<Edges color="#0f172a" />
		</mesh>
	);
}

function BoundingBox({
	bbox,
	c,
}: {
	bbox: ReturnType<typeof computeBoundingBox>;
	c: Centering;
}) {
	const w = mmToM(bbox.maxXMm - bbox.minXMm);
	const d = mmToM(bbox.maxYMm - bbox.minYMm);
	const h = mmToM(bbox.maxZMm);
	const cx = mmToM(bbox.minXMm + bbox.maxXMm) / 2 - c.cx;
	const cz = mmToM(bbox.minYMm + bbox.maxYMm) / 2 - c.cz;
	return (
		<group position={[cx, h / 2, cz]}>
			<mesh>
				<boxGeometry args={[w, h, d]} />
				<meshBasicMaterial transparent opacity={0} />
				<Edges color="#5b5bf0" />
			</mesh>
			<Text
				position={[0, h / 2 + 0.5, 0]}
				fontSize={0.5}
				color="#5b5bf0"
				outlineWidth={0.03}
				outlineColor="#ffffff"
			>
				{`bbox ${w.toFixed(1)} × ${d.toFixed(1)} × ${h.toFixed(1)} m`}
			</Text>
		</group>
	);
}

export default function ThreeView({ warehouse }: { warehouse: Warehouse }) {
	const bbox = useMemo(() => computeBoundingBox(warehouse), [warehouse]);
	const c: Centering = useMemo(
		() => ({
			cx: mmToM(bbox.minXMm + bbox.maxXMm) / 2,
			cz: mmToM(bbox.minYMm + bbox.maxYMm) / 2,
		}),
		[bbox],
	);

	const span = Math.max(
		mmToM(bbox.maxXMm - bbox.minXMm),
		mmToM(bbox.maxYMm - bbox.minYMm),
		10,
	);
	const camDist = span * 0.9;
	const gridSize = span + 20;

	return (
		<div className="h-full w-full bg-canvas">
			<Canvas
				shadows
				camera={{
					position: [camDist, camDist * 0.8, camDist],
					fov: 45,
				}}
				dpr={[1, 2]}
			>
				<color attach="background" args={["#f4f6fa"]} />
				<fog
					attach="fog"
					args={["#f4f6fa", camDist * 2, camDist * 4]}
				/>
				<ambientLight intensity={0.55} />
				<directionalLight
					position={[camDist * 0.6, camDist, camDist * 0.4]}
					intensity={1.1}
					castShadow
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
					shadow-camera-left={-span}
					shadow-camera-right={span}
					shadow-camera-top={span}
					shadow-camera-bottom={-span}
				/>
				<Suspense fallback={null}>
					<Environment preset="city" />
				</Suspense>

				<Grid
					position={[0, 0.005, 0]}
					args={[gridSize, gridSize]}
					cellSize={1}
					cellThickness={0.5}
					cellColor="#c8cdd6"
					sectionSize={5}
					sectionThickness={1}
					sectionColor="#9099a8"
					fadeDistance={span * 4}
					fadeStrength={1}
					infiniteGrid={false}
				/>

				{warehouse.floors.map((f: WarehouseFloor) => (
					<group key={f.id}>
						<FloorSlab floor={f} c={c} />
						{f.storageUnits.map((u: StorageUnit) => (
							<StorageMesh key={u.id} u={u} floor={f} c={c} />
						))}
						{f.assets.map((a: Asset) => (
							<StorageMesh key={a.id} u={a} floor={f} c={c} />
						))}
					</group>
				))}

				{warehouse.handlingUnits.map((hu: HandlingUnit) => (
					<HandlingMesh
						key={hu.id}
						hu={hu}
						warehouse={warehouse}
						c={c}
					/>
				))}

				<BoundingBox bbox={bbox} c={c} />

				<OrbitControls
					enableDamping
					dampingFactor={0.08}
					minDistance={3}
					maxDistance={span * 5}
					maxPolarAngle={Math.PI / 2.1}
					target={[0, 0, 0]}
				/>
			</Canvas>
		</div>
	);
}
