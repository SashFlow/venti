export type AgvStatus = "IDLE" | "EN_ROUTE" | "LOADING" | "UNLOADING";

export type AgvWaypoint = {
	x: number;
	z: number;
};

export type AgvJob = {
	id: string;
	label: string;
	agvId?: string;
	status: "pending" | "active" | "completed";
	waypoints: AgvWaypoint[];
};

export type AgvUnit = {
	id: string;
	label: string;
	status: AgvStatus;
	position: AgvWaypoint;
	progress: number;
	currentJobId?: string;
};

export const DEMO_AGV_JOB: Omit<AgvJob, "id"> = {
	label: "Moving pallet P-2847 Zone D → Dock 3",
	status: "pending",
	waypoints: [
		{ x: 40, z: 30 },
		{ x: 55, z: 35 },
		{ x: 70, z: 42 },
		{ x: 85, z: 48 },
	],
};
