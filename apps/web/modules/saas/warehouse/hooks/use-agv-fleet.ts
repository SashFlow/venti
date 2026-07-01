"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
	type AgvJob,
	type AgvUnit,
	DEMO_AGV_JOB,
} from "../lib/agv-sim-types";

const INITIAL_FLEET: AgvUnit[] = [
	{ id: "agv-01", label: "AGV-01", status: "IDLE", position: { x: 20, z: 20 }, progress: 0 },
	{ id: "agv-02", label: "AGV-02", status: "IDLE", position: { x: 25, z: 22 }, progress: 0 },
	{ id: "agv-03", label: "AGV-03", status: "IDLE", position: { x: 30, z: 24 }, progress: 0 },
];

type FleetState = {
	fleet: AgvUnit[];
	jobs: AgvJob[];
};

let state: FleetState = {
	fleet: INITIAL_FLEET.map((u) => ({ ...u })),
	jobs: [
		{
			id: "job-demo-1",
			...DEMO_AGV_JOB,
		},
	],
};

const listeners = new Set<() => void>();
let animationFrame: number | null = null;
let lastTick = 0;

function emit() {
	for (const listener of listeners) {
		listener();
	}
}

function setState(next: FleetState) {
	state = next;
	emit();
}

function findIdleAgv() {
	return state.fleet.find((u) => u.status === "IDLE");
}

export function dispatchAgv(job: AgvJob) {
	const agv = findIdleAgv();
	if (!agv) {
		return false;
	}

	const start = job.waypoints[0] ?? agv.position;
	setState({
		...state,
		fleet: state.fleet.map((u) =>
			u.id === agv.id
				? {
						...u,
						status: "EN_ROUTE",
						currentJobId: job.id,
						position: start,
						progress: 0,
					}
				: u,
		),
		jobs: state.jobs.map((j) =>
			j.id === job.id
				? { ...j, status: "active", agvId: agv.id }
				: j,
		),
	});
	startAnimation();
	return true;
}

export function enqueueMoveJob(label: string, waypoints?: AgvJob["waypoints"]) {
	const job: AgvJob = {
		id: `job-${Date.now()}`,
		label,
		status: "pending",
		waypoints: waypoints ?? DEMO_AGV_JOB.waypoints,
	};
	setState({ ...state, jobs: [...state.jobs, job] });
	return job;
}

export function resetAgvFleet() {
	if (animationFrame) {
		cancelAnimationFrame(animationFrame);
		animationFrame = null;
	}
	setState({
		fleet: INITIAL_FLEET.map((u) => ({ ...u })),
		jobs: [{ id: "job-demo-1", ...DEMO_AGV_JOB }],
	});
}

function tick(now: number) {
	if (!lastTick) lastTick = now;
	const dt = (now - lastTick) / 1000;
	lastTick = now;

	let moving = false;
	const nextFleet = state.fleet.map((unit) => {
		if (unit.status !== "EN_ROUTE" || !unit.currentJobId) {
			return unit;
		}
		const job = state.jobs.find((j) => j.id === unit.currentJobId);
		if (!job || job.waypoints.length < 2) {
			return { ...unit, status: "IDLE" as const, currentJobId: undefined };
		}

		const progress = Math.min(1, unit.progress + dt * 0.15);
		moving = progress < 1;

		const segments = job.waypoints.length - 1;
		const scaled = progress * segments;
		const segIdx = Math.min(Math.floor(scaled), segments - 1);
		const segT = scaled - segIdx;
		const a = job.waypoints[segIdx];
		const b = job.waypoints[segIdx + 1];
		const position = {
			x: a.x + (b.x - a.x) * segT,
			z: a.z + (b.z - a.z) * segT,
		};

		if (progress >= 1) {
			return {
				...unit,
				status: "IDLE" as const,
				currentJobId: undefined,
				position: job.waypoints[job.waypoints.length - 1],
				progress: 0,
			};
		}

		return { ...unit, position, progress };
	});

	const completedAgvIds = state.fleet
		.filter((u) => u.status === "EN_ROUTE" && u.currentJobId)
		.filter((u) => {
			const updated = nextFleet.find((n) => n.id === u.id);
			return updated?.status === "IDLE" && u.status === "EN_ROUTE";
		})
		.map((u) => u.currentJobId);

	const nextJobs = state.jobs.map((j) =>
		completedAgvIds.includes(j.id) ? { ...j, status: "completed" as const } : j,
	);

	setState({ fleet: nextFleet, jobs: nextJobs });

	if (moving) {
		animationFrame = requestAnimationFrame(tick);
	} else {
		animationFrame = null;
		lastTick = 0;
	}
}

function startAnimation() {
	if (animationFrame) return;
	lastTick = 0;
	animationFrame = requestAnimationFrame(tick);
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return state;
}

export function useAgvFleet() {
	const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

	const dispatch = useCallback((jobId: string) => {
		const job = state.jobs.find((j) => j.id === jobId);
		if (!job) {
			return false;
		}
		return dispatchAgv(job);
	}, []);

	useEffect(() => {
		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
				animationFrame = null;
			}
		};
	}, []);

	return {
		fleet: snapshot.fleet,
		jobs: snapshot.jobs,
		dispatch,
		enqueueMoveJob,
		resetAgvFleet,
	};
}
