"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	BotIcon,
	CircleAlertIcon,
	Clock3Icon,
	PauseCircleIcon,
	ShieldCheckIcon,
} from "lucide-react";
import { useState } from "react";

type RuleStatus = "running" | "review" | "paused";

type AutomationRule = {
	id: string;
	name: string;
	scope: string;
	status: RuleStatus;
	coverage: string;
	updatedAt: string;
};

type QueueItem = {
	id: string;
	task: string;
	owner: string;
	state: "queued" | "blocked" | "executed";
	eta: string;
};

const RULES: AutomationRule[] = [
	{
		id: "auto-replenishment",
		name: "Low stock replenishment",
		scope: "Warehouse . Aisles A-D",
		status: "running",
		coverage: "184 SKUs monitored",
		updatedAt: "Updated 12 min ago",
	},
	{
		id: "priority-wave",
		name: "Priority wave release",
		scope: "Outbound . B2B priority orders",
		status: "review",
		coverage: "7 pending approvals",
		updatedAt: "Updated 38 min ago",
	},
	{
		id: "returns-routing",
		name: "Returns triage routing",
		scope: "Returns . QC and restock",
		status: "paused",
		coverage: "Paused after label mismatch",
		updatedAt: "Updated 2 hrs ago",
	},
];

const QUEUE: QueueItem[] = [
	{
		id: "APL-9021",
		task: "Release replenishment task batch",
		owner: "Inventory Control",
		state: "queued",
		eta: "3 min",
	},
	{
		id: "APL-9017",
		task: "Approve exception-driven carrier override",
		owner: "Transport Desk",
		state: "blocked",
		eta: "Waiting for review",
	},
	{
		id: "APL-9012",
		task: "Close completed cycle count variance batch",
		owner: "Warehouse Ops",
		state: "executed",
		eta: "Completed",
	},
];

function labelForStatus(status: RuleStatus | QueueItem["state"]) {
	if (status === "running") {
		return "Running";
	}

	if (status === "review") {
		return "Needs review";
	}

	if (status === "paused") {
		return "Paused";
	}

	if (status === "queued") {
		return "Queued";
	}

	if (status === "blocked") {
		return "Blocked";
	}

	return "Executed";
}

function toneForStatus(status: RuleStatus | QueueItem["state"]) {
	switch (status) {
		case "running":
		case "executed":
			return "border-emerald-200 bg-emerald-50 text-emerald-700";
		case "review":
		case "blocked":
			return "border-amber-200 bg-amber-50 text-amber-700";
		default:
			return "border-slate-200 bg-slate-100 text-slate-700";
	}
}

export default function AutopilotPage() {
	const [activeTab, setActiveTab] = useState<"rules" | "queue">("rules");

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Autopilot
					</h1>
					<p className="max-w-3xl text-muted-foreground">
						Review warehouse automation coverage, inspect queued
						decisions, and keep human approvals in the loop. This
						page is frontend complete while rule execution endpoints
						are still being formalized.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline">Pause All</Button>
					<Button>Create Rule</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Coverage
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								78%
							</p>
						</div>
						<BotIcon className="size-5 text-sky-600" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Running
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								12
							</p>
						</div>
						<ShieldCheckIcon className="size-5 text-emerald-600" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Needs review
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								3
							</p>
						</div>
						<CircleAlertIcon className="size-5 text-amber-600" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Median ETA
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								4m
							</p>
						</div>
						<Clock3Icon className="size-5 text-violet-600" />
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Automation posture
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">
									Decision coverage across replenishment,
									outbound, and returns
								</span>
								<span className="font-medium">78%</span>
							</div>
							<Progress value={78} />
						</div>

						<div className="grid gap-3 md:grid-cols-3">
							<div className="rounded-xl border p-4">
								<p className="text-sm font-medium">Inbound</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Dock assignment and ASN variance checks are
									active.
								</p>
							</div>
							<div className="rounded-xl border p-4">
								<p className="text-sm font-medium">Outbound</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Wave prioritization is active, carrier
									override stays manual.
								</p>
							</div>
							<div className="rounded-xl border p-4">
								<p className="text-sm font-medium">Returns</p>
								<p className="mt-1 text-sm text-muted-foreground">
									QC routing is paused until the label
									template mismatch is cleared.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Guardrails</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="rounded-xl border p-4">
							<p className="font-medium">
								Human approval required
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Carrier changes, inventory write-offs, and bulk
								order releases stay behind approval gates.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="font-medium">Replay window</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Failed automations can be replayed within the
								last 24 hours after operator review.
							</p>
						</div>
						<div className="rounded-xl border p-4">
							<p className="font-medium">Escalation target</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Warehouse control tower receives blocked task
								alerts every 15 minutes.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) =>
					setActiveTab(value as "rules" | "queue")
				}
				className="space-y-4 flex flex-col"
			>
				<TabsList
					variant="default"
					className="h-auto w-full justify-start overflow-x-auto"
				>
					<TabsTrigger value="rules" className="px-3">
						Rules
					</TabsTrigger>
					<TabsTrigger value="queue" className="px-3">
						Decision Queue
					</TabsTrigger>
				</TabsList>

				{activeTab === "rules" ? (
					<div className="grid gap-4 xl:grid-cols-3">
						{RULES.map((rule) => (
							<Card key={rule.id}>
								<CardContent className="space-y-4 p-5">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-lg font-semibold tracking-tight">
												{rule.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{rule.scope}
											</p>
										</div>
										<span
											className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneForStatus(rule.status)}`}
										>
											{labelForStatus(rule.status)}
										</span>
									</div>

									<div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
										{rule.coverage}
									</div>
									<p className="text-sm text-muted-foreground">
										{rule.updatedAt}
									</p>
									<div className="flex flex-wrap gap-2">
										<Button variant="outline" size="sm">
											Edit Rule
										</Button>
										<Button variant="outline" size="sm">
											View Runs
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								Decision Queue
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Task</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Owner</TableHead>
										<TableHead>ETA</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{QUEUE.map((item) => (
										<TableRow key={item.id}>
											<TableCell className="font-medium">
												{item.id}
											</TableCell>
											<TableCell>{item.task}</TableCell>
											<TableCell>
												<span
													className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneForStatus(item.state)}`}
												>
													{labelForStatus(item.state)}
												</span>
											</TableCell>
											<TableCell>{item.owner}</TableCell>
											<TableCell>{item.eta}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</Tabs>

			<Card className="border-dashed">
				<CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="font-medium">Execution API status</p>
						<p className="text-sm text-muted-foreground">
							Rule create, pause, and replay actions are staged in
							the UI, but the backend execution contract is still
							pending.
						</p>
					</div>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<PauseCircleIcon className="size-4" />
						Awaiting workflow service wiring
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
