"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { useSession } from "@saas/auth/hooks/use-session";
import { resetAgvFleet } from "@saas/warehouse/hooks/use-agv-fleet";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { DEMO_SCENARIOS } from "./demo-scenarios";

export function DemoRunner({ compact = false }: { compact?: boolean }) {
	const router = useRouter();
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const [running, setRunning] = useState(false);
	const timeoutsRef = useRef<number[]>([]);

	const resetMutation = useMutation(
		orpc.organizations.resetDemo.mutationOptions(),
	);

	const clearTimeouts = useCallback(() => {
		for (const id of timeoutsRef.current) {
			window.clearTimeout(id);
		}
		timeoutsRef.current = [];
	}, []);

	const runScenario = useCallback(
		(scenarioId: string) => {
			const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
			if (!scenario) return;

			clearTimeouts();
			setRunning(true);
			toast.info(`Demo: ${scenario.title}`);

			for (const step of scenario.steps) {
				const id = window.setTimeout(() => {
					toast.message(step.message);
					if (step.href) router.push(step.href);
				}, step.delayMs);
				timeoutsRef.current.push(id);
			}

			const lastDelay = Math.max(...scenario.steps.map((s) => s.delayMs));
			const doneId = window.setTimeout(() => {
				setRunning(false);
				toast.success(`${scenario.title} — demo cues complete`);
			}, lastDelay + 2000);
			timeoutsRef.current.push(doneId);
		},
		[clearTimeouts, router],
	);

	const runFullDemo = useCallback(() => {
		clearTimeouts();
		setRunning(true);
		toast.info("Running 15-minute golden demo script…");

		let offset = 0;
		for (const scenario of DEMO_SCENARIOS) {
			for (const step of scenario.steps) {
				const delay = offset + step.delayMs;
				const id = window.setTimeout(() => {
					toast.message(`[${scenario.title}] ${step.message}`);
					if (step.href) router.push(step.href);
				}, delay);
				timeoutsRef.current.push(id);
			}
			offset += 30_000;
		}

		const doneId = window.setTimeout(() => {
			setRunning(false);
			toast.success("Golden demo script complete");
		}, offset);
		timeoutsRef.current.push(doneId);
	}, [clearTimeouts, router]);

	const handleReset = async () => {
		clearTimeouts();
		setRunning(false);
		resetAgvFleet();
		if (organizationId) {
			try {
				await resetMutation.mutateAsync({ organizationId });
			} catch {
				// non-fatal for POC
			}
		}
		toast.success(
			"Demo reset. Re-seed with: pnpm --filter @repo/database create:layout-and-simulation",
		);
	};

	if (compact) {
		return (
			<div className="flex flex-wrap gap-2">
				<Button
					size="sm"
					variant="secondary"
					onClick={runFullDemo}
					disabled={running}
				>
					<Play className="size-3.5 mr-1" />
					Run Demo
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={handleReset}
					disabled={resetMutation.isPending}
				>
					<RotateCcw className="size-3.5 mr-1" />
					Reset
				</Button>
			</div>
		);
	}

	return (
		<Card className="border-primary/20">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm flex items-center gap-2">
					<Sparkles className="size-4 text-primary" />
					Demo mode
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<p className="text-xs text-muted-foreground">
					15-minute golden script with guided navigation toasts.
				</p>
				<div className="flex flex-wrap gap-2">
					<Button onClick={runFullDemo} disabled={running} size="sm">
						<Play className="size-3.5 mr-1" />
						Run full demo
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleReset}
						disabled={resetMutation.isPending}
					>
						<RotateCcw className="size-3.5 mr-1" />
						Reset demo
					</Button>
				</div>
				<div className="space-y-1">
					{DEMO_SCENARIOS.map((s) => (
						<Button
							key={s.id}
							variant="ghost"
							size="sm"
							className="w-full justify-start text-xs h-8"
							disabled={running}
							onClick={() => runScenario(s.id)}
						>
							{s.title}
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
