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

// Iso projection. 1 metre = TILE_W on x, TILE_H on y. Heights -> upward.
const TILE_W = 16;
const TILE_H = 8;
const Z_PX_PER_M = TILE_H * 2;

function project(xM: number, yM: number, zM = 0) {
	return {
		sx: (xM - yM) * TILE_W,
		sy: (xM + yM) * TILE_H - zM * Z_PX_PER_M,
	};
}

function shade(hex: string, amt: number) {
	const c = hex.replace("#", "");
	const num = Number.parseInt(c, 16);
	let r = (num >> 16) + Math.round(255 * amt);
	let g = ((num >> 8) & 0xff) + Math.round(255 * amt);
	let b = (num & 0xff) + Math.round(255 * amt);
	r = Math.max(0, Math.min(255, r));
	g = Math.max(0, Math.min(255, g));
	b = Math.max(0, Math.min(255, b));
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function Face({
	points,
	fill,
	opacity = 1,
}: {
	points: string;
	fill: string;
	opacity?: number;
}) {
	return (
		<polygon
			points={points}
			fill={fill}
			fillOpacity={opacity}
			stroke="rgba(0,0,0,0.18)"
			strokeWidth={0.5}
			strokeLinejoin="round"
		/>
	);
}

function IsoBox({
	xM,
	yM,
	wM,
	lM,
	baseZ = 0,
	heightM,
	color,
	opacity = 1,
}: {
	xM: number;
	yM: number;
	wM: number;
	lM: number;
	baseZ?: number;
	heightM: number;
	color: string;
	opacity?: number;
}) {
	const a = project(xM, yM, baseZ);
	const b = project(xM + wM, yM, baseZ);
	const c = project(xM + wM, yM + lM, baseZ);
	const A = project(xM, yM, baseZ + heightM);
	const B = project(xM + wM, yM, baseZ + heightM);
	const C = project(xM + wM, yM + lM, baseZ + heightM);
	const D = project(xM, yM + lM, baseZ + heightM);
	return (
		<g>
			<Face
				opacity={opacity}
				points={`${b.sx},${b.sy} ${c.sx},${c.sy} ${C.sx},${C.sy} ${B.sx},${B.sy}`}
				fill={shade(color, -0.18)}
			/>
			<Face
				opacity={opacity}
				points={`${a.sx},${a.sy} ${b.sx},${b.sy} ${B.sx},${B.sy} ${A.sx},${A.sy}`}
				fill={shade(color, -0.32)}
			/>
			<Face
				opacity={opacity}
				points={`${A.sx},${A.sy} ${B.sx},${B.sy} ${C.sx},${C.sy} ${D.sx},${D.sy}`}
				fill={color}
			/>
		</g>
	);
}

function isoLabel(
	xM: number,
	yM: number,
	zM: number,
	text: string,
	color: string,
	fontSize = 9,
) {
	const p = project(xM, yM, zM);
	return (
		<text
			x={p.sx}
			y={p.sy}
			textAnchor="middle"
			fontSize={fontSize}
			fontWeight={700}
			fill={color}
			stroke="#fff"
			strokeWidth={2.5}
			paintOrder="stroke"
			style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
		>
			{text}
		</text>
	);
}

function renderUnit(
	u: StorageUnit | Asset,
	floor: WarehouseFloor,
	key: string,
) {
	const xM = mmToM(floor.originXMm + u.startXMm);
	const yM = mmToM(floor.originYMm + u.startYMm);
	const wM = mmToM(u.widthMm);
	const lM = mmToM(u.lengthMm);
	const hM = mmToM(u.heightMm);
	const baseZ = mmToM(floor.elevationMm + u.startZMm);
	const color =
		u.colorHex ??
		(STORAGE_UNIT_COLORS[u.type as keyof typeof STORAGE_UNIT_COLORS] ||
			ASSET_COLORS[u.type as keyof typeof ASSET_COLORS]);
	const label =
		"name" in u && u.name ? u.name : "code" in u ? u.code : u.type;
	const uType = u.type as string;

	if (uType === "FLOOR") {
		const a = project(xM, yM, baseZ);
		const b = project(xM + wM, yM, baseZ);
		const c = project(xM + wM, yM + lM, baseZ);
		const d = project(xM, yM + lM, baseZ);
		const cx = (a.sx + c.sx) / 2;
		const cy = (a.sy + c.sy) / 2;
		return (
			<g key={key}>
				<polygon
					points={`${a.sx},${a.sy} ${b.sx},${b.sy} ${c.sx},${c.sy} ${d.sx},${d.sy}`}
					fill={color}
					fillOpacity={0.22}
					stroke={color}
					strokeWidth={1}
					strokeDasharray="4 3"
				/>
				<text
					x={cx}
					y={cy}
					textAnchor="middle"
					fontSize={9}
					fontWeight={700}
					fill={color}
					stroke="#fff"
					strokeWidth={2.5}
					paintOrder="stroke"
					style={{ textTransform: "uppercase", letterSpacing: 1 }}
				>
					{label}
				</text>
			</g>
		);
	}
	if (uType === "RACK") {
		return (
			<g key={key}>
				<IsoBox
					xM={xM}
					yM={yM}
					wM={wM}
					lM={lM}
					baseZ={baseZ}
					heightM={hM}
					color={color}
					opacity={0.28}
				/>
				{isoLabel(
					xM + wM / 2,
					yM + lM / 2,
					baseZ + hM + 0.6,
					label,
					"#0f172a",
					10,
				)}
			</g>
		);
	}
	if (uType === "STAIRS") {
		const steps = Math.max(4, Math.round(hM / 0.18));
		const stepRise = hM / steps;
		const stepRun = lM / steps;
		const items: JSX.Element[] = [];
		for (let i = 0; i < steps; i++) {
			items.push(
				<IsoBox
					key={`${key}-s-${i}`}
					xM={xM}
					yM={yM + i * stepRun}
					wM={wM}
					lM={stepRun}
					baseZ={baseZ + i * stepRise}
					heightM={stepRise}
					color={color}
				/>,
			);
		}
		items.push(
			<g key={`${key}-l`}>
				{isoLabel(
					xM + wM / 2,
					yM + lM / 2,
					baseZ + hM + 0.5,
					label,
					"#475569",
					9,
				)}
			</g>,
		);
		return <g key={key}>{items}</g>;
	}
	return (
		<g key={key}>
			<IsoBox
				xM={xM}
				yM={yM}
				wM={wM}
				lM={lM}
				baseZ={baseZ}
				heightM={hM}
				color={color}
				opacity={uType === "SHELF" || uType === "AISLE" ? 0.6 : 1}
			/>
			{(uType === "BIN" || uType === "DOCK_DOOR" || uType === "WALL") &&
				isoLabel(
					xM + wM / 2,
					yM + lM / 2,
					baseZ + hM + 0.4,
					label,
					color,
					9,
				)}
		</g>
	);
}

function renderFloorSlab(f: WarehouseFloor, key: string) {
	if (!f.widthMm || !f.lengthMm || f.elevationMm <= 0) {
		return null;
	}
	const xM = mmToM(f.originXMm);
	const yM = mmToM(f.originYMm);
	const wM = mmToM(f.widthMm);
	const lM = mmToM(f.lengthMm);
	const elev = mmToM(f.elevationMm);
	return (
		<g key={key}>
			<IsoBox
				xM={xM}
				yM={yM}
				wM={wM}
				lM={lM}
				baseZ={elev}
				heightM={0.2}
				color="#8b5cf6"
				opacity={0.55}
			/>
			{isoLabel(
				xM + wM / 2,
				yM + lM / 2,
				elev + 0.6,
				`${f.name || f.code} +${elev.toFixed(1)}m`,
				"#8b5cf6",
				10,
			)}
		</g>
	);
}

function renderHandlingUnit(
	hu: HandlingUnit,
	warehouse: Warehouse,
	key: string,
) {
	if (!hu.currentStorageUnitId) {
		return null;
	}
	let parent: StorageUnit | undefined;
	let parentFloor: WarehouseFloor | undefined;
	for (const f of warehouse.floors) {
		const p = f.storageUnits.find(
			(u: StorageUnit) => u.id === hu.currentStorageUnitId,
		);
		if (p) {
			parent = p;
			parentFloor = f;
			break;
		}
	}
	if (!parent || !parentFloor) {
		return null;
	}
	const wM = mmToM(hu.widthMm ?? 1000);
	const lM = mmToM(hu.lengthMm ?? 1000);
	const hM = mmToM(hu.heightMm ?? 1200);
	const xM =
		mmToM(parentFloor.originXMm + parent.startXMm) +
		(mmToM(parent.widthMm) - wM) / 2;
	const yM =
		mmToM(parentFloor.originYMm + parent.startYMm) +
		(mmToM(parent.lengthMm) - lM) / 2;
	const baseZ = mmToM(parentFloor.elevationMm + parent.startZMm) + 0.05;
	return (
		<g key={key}>
			<IsoBox
				xM={xM}
				yM={yM}
				wM={wM}
				lM={lM}
				baseZ={baseZ}
				heightM={hM}
				color={HANDLING_UNIT_COLORS[hu.type]}
			/>
		</g>
	);
}

export default function IsoView({ warehouse }: { warehouse: Warehouse }) {
	const bbox = computeBoundingBox(warehouse);
	const padM = 2;
	const x0 = mmToM(bbox.minXMm) - padM;
	const y0 = mmToM(bbox.minYMm) - padM;
	const x1 = mmToM(bbox.maxXMm) + padM;
	const y1 = mmToM(bbox.maxYMm) + padM;
	const maxZ = mmToM(bbox.maxZMm);

	const corners = [
		project(x0, y0),
		project(x1, y0),
		project(x1, y1),
		project(x0, y1),
		project(x0, y0, maxZ + 1),
		project(x1, y0, maxZ + 1),
		project(x0, y1, maxZ + 1),
		project(x1, y1, maxZ + 1),
	];
	const minX = Math.min(...corners.map((p) => p.sx));
	const maxX = Math.max(...corners.map((p) => p.sx));
	const minY = Math.min(...corners.map((p) => p.sy));
	const maxY = Math.max(...corners.map((p) => p.sy));
	const pad = 60;
	const vbW = maxX - minX + pad * 2;
	const vbH = maxY - minY + pad * 2;

	const f1 = project(x0, y0);
	const f2 = project(x1, y0);
	const f3 = project(x1, y1);
	const f4 = project(x0, y1);

	// Collect all units across floors, painter sort by x+y, then by elevation
	const allUnits: { u: StorageUnit | Asset; f: WarehouseFloor }[] = [];
	for (const f of warehouse.floors) {
		for (const u of f.storageUnits) {
			allUnits.push({ u, f });
		}
		for (const u of f.assets) {
			allUnits.push({ u, f });
		}
	}
	const ordered = [...allUnits].sort((A, B) => {
		const za = A.u.startXMm + A.u.startYMm + A.f.elevationMm * 0.5;
		const zb = B.u.startXMm + B.u.startYMm + B.f.elevationMm * 0.5;
		return za - zb;
	});

	// bbox wireframe
	const bw = mmToM(bbox.maxXMm - bbox.minXMm);
	const bd = mmToM(bbox.maxYMm - bbox.minYMm);
	const bh = mmToM(bbox.maxZMm);
	const bbA = project(mmToM(bbox.minXMm), mmToM(bbox.minYMm), 0);
	const bbB = project(mmToM(bbox.maxXMm), mmToM(bbox.minYMm), 0);
	const bbC = project(mmToM(bbox.maxXMm), mmToM(bbox.maxYMm), 0);
	const bbD = project(mmToM(bbox.minXMm), mmToM(bbox.maxYMm), 0);
	const bbAt = project(mmToM(bbox.minXMm), mmToM(bbox.minYMm), bh);
	const bbBt = project(mmToM(bbox.maxXMm), mmToM(bbox.minYMm), bh);
	const bbCt = project(mmToM(bbox.maxXMm), mmToM(bbox.maxYMm), bh);
	const bbDt = project(mmToM(bbox.minXMm), mmToM(bbox.maxYMm), bh);
	const bboxColor = "#5b5bf0";
	const bboxLine = (
		p1: { sx: number; sy: number },
		p2: { sx: number; sy: number },
		key: string,
	) => (
		<line
			key={key}
			x1={p1.sx}
			y1={p1.sy}
			x2={p2.sx}
			y2={p2.sy}
			stroke={bboxColor}
			strokeWidth={1.2}
			strokeDasharray="4 3"
			opacity={0.85}
		/>
	);

	return (
		<div className="h-full w-full overflow-auto bg-canvas flex items-center justify-center p-8">
			<svg
				viewBox={`${minX - pad} ${minY - pad} ${vbW} ${vbH}`}
				style={{
					width: "min(100%, 1400px)",
					height: "auto",
					maxHeight: "100%",
				}}
			>
				<title>Warehouse Isometric View</title>
				<defs>
					<linearGradient id="floorGrad" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0" stopColor="#eef1f6" />
						<stop offset="1" stopColor="#dde2eb" />
					</linearGradient>
					<pattern
						id="isoGrid"
						width={TILE_W * 2}
						height={TILE_H * 2}
						patternUnits="userSpaceOnUse"
					>
						<path
							d={`M0 ${TILE_H} L${TILE_W} 0 L${TILE_W * 2} ${TILE_H} L${TILE_W} ${TILE_H * 2} Z`}
							fill="none"
							stroke="#c4cad6"
							strokeWidth="0.4"
						/>
					</pattern>
				</defs>

				<polygon
					points={`${f1.sx},${f1.sy} ${f2.sx},${f2.sy} ${f3.sx},${f3.sy} ${f4.sx},${f4.sy}`}
					fill="url(#floorGrad)"
					stroke="#9099a8"
					strokeWidth={1}
				/>
				<polygon
					points={`${f1.sx},${f1.sy} ${f2.sx},${f2.sy} ${f3.sx},${f3.sy} ${f4.sx},${f4.sy}`}
					fill="url(#isoGrid)"
				/>

				{warehouse.floors.map((f: WarehouseFloor) =>
					renderFloorSlab(f, `floor-${f.id}`),
				)}
				{ordered.map(({ u, f }) => renderUnit(u, f, u.id))}
				{warehouse.handlingUnits.map((hu: HandlingUnit) =>
					renderHandlingUnit(hu, warehouse, `hu-${hu.id}`),
				)}

				<g>
					{bboxLine(bbA, bbB, "e1")}
					{bboxLine(bbB, bbC, "e2")}
					{bboxLine(bbC, bbD, "e3")}
					{bboxLine(bbD, bbA, "e4")}
					{bboxLine(bbAt, bbBt, "e5")}
					{bboxLine(bbBt, bbCt, "e6")}
					{bboxLine(bbCt, bbDt, "e7")}
					{bboxLine(bbDt, bbAt, "e8")}
					{bboxLine(bbA, bbAt, "e9")}
					{bboxLine(bbB, bbBt, "e10")}
					{bboxLine(bbC, bbCt, "e11")}
					{bboxLine(bbD, bbDt, "e12")}
					{(() => {
						const lp = project(
							mmToM(bbox.minXMm) + bw / 2,
							mmToM(bbox.minYMm) + bd / 2,
							bh + 0.5,
						);
						return (
							<text
								x={lp.sx}
								y={lp.sy}
								textAnchor="middle"
								fontSize={10}
								fontWeight={700}
								fill={bboxColor}
								stroke="#fff"
								strokeWidth={3}
								paintOrder="stroke"
							>
								{`bbox ${bw.toFixed(1)} × ${bd.toFixed(1)} × ${bh.toFixed(1)} m`}
							</text>
						);
					})()}
				</g>
			</svg>
		</div>
	);
}
