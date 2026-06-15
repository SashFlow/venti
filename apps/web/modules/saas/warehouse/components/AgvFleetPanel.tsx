"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { Bot, Play, Truck } from "lucide-react";
import { toast } from "sonner";
import {
	dispatchAgv,
	enqueueMoveJob,
	useAgvFleet,
} from "../hooks/use-agv-fleet";

function statusVariant(status: string) {
	switch (status) {
		case "EN_ROUTE":
			return "default" as const;
		case "LOADING":
		case "UNLOADING":
			return "secondary" as const;
		default:
			return "outline" as const;
	}
}

export function AgvFleetPanel() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const { fleet, jobs, dispatch } = useAgvFleet();

	const { data: tasksData } = useQuery({
		...orpc.autopilot.listRecentActions.queryOptions({
			input: { organizationId, limit: 10 },
		}),
		enabled: Boolean(organizationId),
	});

	const moveTasks =
		tasksData?.items?.filter(
			(t: { type?: string; state?: string }) =>
				t.type === "MOVE" && t.state === "queued",
		) ?? [];

	const handleDispatch = (jobId: string) => {
		const ok = dispatch(jobId);
		if (ok) {
			toast.success("AGV dispatched");
		} else {
			toast.error("No idle AGV available");
		}
	};

	const handleDispatchFromTask = (taskLabel: string) => {
		const job = enqueueMoveJob(taskLabel);
		if (dispatchAgv(job)) {
			toast.success("AGV dispatched for MOVE task");
		}
	};

	return (
		<Card className="border-primary/20">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm flex items-center gap-2">
					<Bot className="size-4" />
					AGV fleet
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 text-sm">
				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Units
					</p>
					{fleet.map((unit) => (
						<div
							key={unit.id}
							className="flex items-center justify-between rounded-md border px-2 py-1.5"
						>
							<span className="font-mono">{unit.label}</span>
							<Badge variant={statusVariant(unit.status)}>
								{unit.status.replace("_", " ")}
							</Badge>
						</div>
					))}
				</div>

				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Job queue
					</p>
					{jobs.length === 0 ? (
						<p className="text-muted-foreground text-xs">No jobs queued.</p>
					) : (
						jobs.map((job) => (
							<div
								key={job.id}
								className="flex items-start justify-between gap-2 rounded-md border px-2 py-1.5"
							>
								<div className="min-w-0">
									<p className="text-xs font-medium truncate">
										{job.label}
									</p>
									<p className="text-[10px] text-muted-foreground capitalize">
										{job.status}
									</p>
								</div>
								{job.status === "pending" && (
									<Button
										size="sm"
										variant="outline"
										className="shrink-0 h-7"
										onClick={() => handleDispatch(job.id)}
									>
										<Play className="size-3" />
									</Button>
								)}
							</div>
						))
					)}
				</div>

				{moveTasks.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							MOVE tasks
						</p>
						{moveTasks.slice(0, 3).map((task: { id: string; task: string }) => (
							<Button
								key={task.id}
								variant="secondary"
								size="sm"
								className="w-full justify-start gap-2"
								onClick={() => handleDispatchFromTask(task.task)}
							>
								<Truck className="size-3" />
								Dispatch — {task.task.slice(0, 40)}
							</Button>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
