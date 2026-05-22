"use client";

import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Route, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PickListPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const router = useRouter();

	const wavesQuery = useQuery({
		...orpc.orders.listFulfillmentBatches.queryOptions({
			input: {
				organizationId,
				limit: 20,
				offset: 0,
				status: ["RELEASED", "IN_PROGRESS"],
			},
		}),
		enabled: Boolean(organizationId),
	});

	const computeRouteMutation = useMutation(
		orpc.orders.computeWaveRoute.mutationOptions(),
	);

	const waves = wavesQuery.data?.batches ?? [];

	async function handleStartWave(waveId: string, isOptimized: boolean) {
		if (!isOptimized) {
			try {
				await computeRouteMutation.mutateAsync({
					organizationId,
					waveId,
				});
				toast.success("Route optimized");
			} catch {
				toast.error("Route computation failed — using default order");
			}
		}
		router.push(`/app/scanner/pick-list/${waveId}`);
	}

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="space-y-1">
				<h1 className="text-2xl font-bold">Pick List</h1>
				<p className="text-sm text-muted-foreground">
					Select a wave to start picking
				</p>
			</div>

			{wavesQuery.isPending && (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-24 rounded-xl bg-muted animate-pulse"
						/>
					))}
				</div>
			)}

			{wavesQuery.isError && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					Failed to load waves. Please refresh.
				</div>
			)}

			{!wavesQuery.isPending && waves.length === 0 && (
				<div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
					No waves assigned to you right now.
				</div>
			)}

			<div className="space-y-3">
				{waves.map((wave: any) => {
					const isOptimized = Boolean(wave.isRouteOptimized);
					const pct =
						wave.totalLines > 0
							? Math.round(
									(wave.pickedLines / wave.totalLines) * 100,
								)
							: 0;

					return (
						<div
							key={wave.id}
							className="rounded-xl border bg-card p-4 space-y-3 shadow-sm"
						>
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="font-bold text-base">
										{wave.waveNumber}
									</p>
									<p className="text-xs text-muted-foreground">
										{wave.totalLines ?? "–"} lines ·{" "}
										{wave.type}
									</p>
								</div>
								<span
									className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
										isOptimized
											? "bg-green-100 text-green-700"
											: "bg-amber-100 text-amber-700"
									}`}
								>
									{isOptimized ? (
										<Route className="w-3 h-3" />
									) : (
										<Zap className="w-3 h-3" />
									)}
									{isOptimized
										? "Route Optimized"
										: "Sequential"}
								</span>
							</div>

							{/* Progress bar */}
							<div className="space-y-1">
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>Progress</span>
									<span>
										{wave.pickedLines ?? 0}/
										{wave.totalLines ?? 0} picked
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="h-2 rounded-full bg-blue-600 transition-all"
										style={{ width: `${pct}%` }}
									/>
								</div>
							</div>

							<button
								type="button"
								onClick={() =>
									handleStartWave(wave.id, isOptimized)
								}
								disabled={computeRouteMutation.isPending}
								className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
							>
								{computeRouteMutation.isPending
									? "Optimizing route…"
									: isOptimized
										? "Resume Wave"
										: "Optimize & Start"}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
