"use client";

import { Box, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export function Warehouse3DScene({ nodes }: { nodes: any[] }) {
	return (
		<Canvas camera={{ position: [0, 100, 200], fov: 50 }}>
			<ambientLight intensity={0.5} />
			<directionalLight
				position={[10, 100, 10]}
				intensity={1}
				castShadow
			/>
			<Grid
				infiniteGrid
				cellSize={10}
				sectionSize={50}
				fadeDistance={500}
				sectionColor="#aaaaaa"
				cellColor="#cccccc"
			/>

			{nodes.map((node) => {
				const w = node.width || 10;
				const h = node.height || 10;
				const d = node.depth || 10;
				// In HTML, coordinates are x/y from top-left.
				// In 3D, we usually map HTML x to 3D x, and HTML y to 3D z.
				const x = (node.x || 0) + w / 2 - 200; // Center offset
				const z = (node.y || 0) + h / 2 - 200; // Center offset

				return (
					<Box
						key={node.id}
						args={[w, d, h]}
						position={[x, d / 2, z]}
					>
						<meshStandardMaterial color={node.color || "#cccccc"} />
					</Box>
				);
			})}
			<OrbitControls makeDefault />
		</Canvas>
	);
}
