"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Progress } from "@repo/ui/progress";
import { Switch } from "@repo/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BotIcon,
	CircleAlertIcon,
	Clock3Icon,
	PlayIcon,
	ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type QueueItemState = "queued" | "blocked" | "executed";

function labelForQueueState(state: QueueItemState) {
	if (state === "queued") return "Queued";
	if (state === "blocked") return "Blocked";
	return "Executed";
}

function toneForQueueState(state: QueueItemState) {
	switch (state) {
		case "executed":
			return "border-emerald-200 bg-emerald-50 text-emerald-700";
		case "blocked":
			return "border-amber-200 bg-amber-50 text-amber-700";
		default:
			return "border-slate-200 bg-slate-100 text-slate-700";
	}
}

function formatRelative(date: Date | string | null | undefined) {
	if (!date) return "Never run";
	const d = typeof date === "string" ? new Date(date) : date;
	const mins = Math.round((Date.now() - d.getTime()) / 60000);
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins} min ago`;
	return `${Math.round(mins / 60)} hr ago`;
}

export default function AutopilotPage() {
	const [activeTab, setActiveTab] = useState<"rules" | "queue">("rules");
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const queryClient = useQueryClient();

	const { data: rules = [], isLoading: rulesLoading } = useQuery({
		...orpc.autopilot.listRules.queryOptions({
			input: { organizationId },
		}),
		enabled: Boolean(organizationId),
	});

	const { data: queueData } = useQuery({
		...orpc.autopilot.listRecentActions.queryOptions({
			input: { organizationId, limit: 20 },
		}),
		enabled: Boolean(organizationId),
		refetchInterval: 30_000,
	});

	const updateRuleMutation = useMutation(
		orpc.autopilot.updateRule.mutationOptions(),
	);
	const runNowMutation = useMutation(
		orpc.autopilot.runRulesNow.mutationOptions(),
	);

	const enabledCount = rules.filter((r) => r.enabled).length;
	const coverage =
		rules.length > 0
			? Math.round((enabledCount / rules.length) * 100)
			: 0;

	const queue = queueData?.items ?? [];
	const pendingCount = queue.filter((q) => q.state === "queued").length;

	const lastRun = useMemo(() => {
		const dates = rules
			.map((r) => r.lastRunAt)
			.filter(Boolean) as string[];
		if (dates.length === 0) return null;
		return dates.sort().reverse()[0];
	}, [rules]);

	const handleToggle = async (ruleId: string, enabled: boolean) => {
		try {
			await updateRuleMutation.mutateAsync({
				organizationId,
				ruleId,
				enabled,
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.autopilot.listRules.key(),
			});
		} catch {
			toast.error("Failed to update rule.");
		}
	};

	const handleRunNow = async () => {
		try {
			const result = await runNowMutation.mutateAsync({ organizationId });
			await queryClient.invalidateQueries({
				queryKey: orpc.autopilot.listRules.key(),
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.autopilot.listRecentActions.key(),
			});
			if (result.actions.length > 0) {
				toast.success(result.actions.join(" · "));
			} else {
				toast.message("Rules ran — no new actions required.");
			}
		} catch {
			toast.error("Failed to run autopilot rules.");
		}
	};

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Autopilot
					</h1>
					<p className="max-w-3xl text-muted-foreground">
						Automated replenishment, wave release, and dead-stock
						rebalance rules run on a schedule or on demand. Last
						scheduler tick: {formatRelative(lastRun)}.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" asChild>
						<Link href="/app/analytics">Control Tower</Link>
					</Button>
					<Button
						onClick={handleRunNow}
						disabled={runNowMutation.isPending}
						className="gap-2"
					>
						<PlayIcon className="size-4" />
						Run now
					</Button>
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
								{coverage}%
							</p>
						</div>
						<BotIcon className="size-5 text-sky-600" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Enabled rules
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								{enabledCount}
							</p>
						</div>
						<ShieldCheckIcon className="size-5 text-emerald-600" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Open tasks
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								{pendingCount}
							</p>
						</div>
						<CircleAlertIcon className="size-5 text-amber-600" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Last run
							</p>
							<p className="text-lg font-semibold tracking-tight">
								{formatRelative(lastRun)}
							</p>
						</div>
						<Clock3Icon className="size-5 text-violet-600" />
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Automation posture</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								Rules enabled
							</span>
							<span className="font-medium">{coverage}%</span>
						</div>
						<Progress value={coverage} />
					</div>
				</CardContent>
			</Card>

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
						{rulesLoading ? (
							<p className="text-sm text-muted-foreground col-span-3">
								Loading rules…
							</p>
						) : (
							rules.map((rule) => (
								<Card key={rule.id}>
									<CardContent className="space-y-4 p-5">
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-lg font-semibold tracking-tight">
													{rule.name}
												</p>
												<p className="text-sm text-muted-foreground font-mono">
													{rule.key}
												</p>
											</div>
											<Switch
												checked={rule.enabled}
												onCheckedChange={(checked) =>
													handleToggle(
														rule.id,
														checked,
													)
												}
											/>
										</div>
										<div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground min-h-[3rem]">
											{rule.lastAction ??
												"No actions recorded yet."}
										</div>
										<p className="text-sm text-muted-foreground">
											Last run:{" "}
											{formatRelative(rule.lastRunAt)}
										</p>
									</CardContent>
								</Card>
							))
						)}
					</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								Recent warehouse tasks
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
										<TableHead>Created</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{queue.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={5}
												className="text-muted-foreground text-center"
											>
												No tasks yet. Approve an insight
												or run autopilot.
											</TableCell>
										</TableRow>
									) : (
										queue.map((item) => (
											<TableRow key={item.id}>
												<TableCell className="font-mono text-xs">
													{item.id.slice(0, 8)}
												</TableCell>
												<TableCell>{item.task}</TableCell>
												<TableCell>
													<span
														className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneForQueueState(item.state)}`}
													>
														{labelForQueueState(
															item.state,
														)}
													</span>
												</TableCell>
												<TableCell>{item.owner}</TableCell>
												<TableCell className="text-xs text-muted-foreground">
													{new Date(
														item.eta,
													).toLocaleString()}
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</Tabs>
		</div>
	);
}
