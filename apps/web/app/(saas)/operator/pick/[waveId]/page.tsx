"use client";

import { Button } from "@repo/ui/button";
import { useSession } from "@saas/auth/hooks/use-session";
import { parseRoutePlan } from "@saas/warehouse/lib/route-viz-types";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PickLineCard, type PickStop } from "@saas/operator/components/PickLineCard";
import { PickProgressBar } from "@saas/operator/components/PickProgressBar";
import { PrintPickList } from "@saas/operator/components/PrintPickList";
import { ShippingLabelModal } from "@saas/operator/components/ShippingLabelModal";

export default function OperatorPickWavePage() {
	const params = useParams<{ waveId: string }>();
	const searchParams = useSearchParams();
	const pickerParam = searchParams.get("picker") ?? "1";
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const queryClient = useQueryClient();
	const [confirmingLineId, setConfirmingLineId] = useState<string | null>(null);
	const [showPrint, setShowPrint] = useState(false);
	const [showLabel, setShowLabel] = useState(false);

	useEffect(() => {
		if (params.waveId) {
			sessionStorage.setItem("operator.activeWaveId", params.waveId);
		}
	}, [params.waveId]);

	const { data, isPending, isError } = useQuery({
		...orpc.orders.getWave.queryOptions({
			input: { organizationId, waveId: params.waveId },
		}),
		enabled: Boolean(organizationId && params.waveId),
	});

	const confirmMutation = useMutation(
		orpc.orders.confirmPickLine.mutationOptions(),
	);

	const wave = data?.wave;
	const routePlan = parseRoutePlan(wave?.routePlan);
	const pickerLabel = pickerParam.startsWith("Picker")
		? pickerParam
		: `Picker ${pickerParam}`;
	const pickerRoute =
		routePlan?.pickers.find((p) => p.label === pickerLabel) ??
		routePlan?.pickers[Number(pickerParam) - 1];

	const lineById = useMemo(() => {
		type WaveLine = NonNullable<typeof wave>["lines"][number];
		const map = new Map<string, WaveLine>();
		for (const line of wave?.lines ?? []) {
			map.set(line.id, line);
		}
		return map;
	}, [wave?.lines]);

	const stops: PickStop[] = useMemo(() => {
		if (!pickerRoute) return [];
		return pickerRoute.stops.map((stop) => {
			const line = lineById.get(stop.lineId);
			return {
				lineId: stop.lineId,
				sequence: stop.sequence,
				locationCode: stop.locationCode,
				skuCode: stop.skuCode,
				barcode: line?.salesOrderLine?.sku?.barcode ?? null,
				qtyToPick: Number(line?.qtyToPick ?? 0),
				qtyPicked: Number(line?.qtyPicked ?? 0),
			};
		});
	}, [pickerRoute, lineById]);

	const progress = useMemo(() => {
		const total = stops.length;
		const completed = stops.filter(
			(s) => s.qtyPicked >= s.qtyToPick && s.qtyToPick > 0,
		).length;
		return {
			total,
			completed,
			percent: total > 0 ? Math.round((completed / total) * 100) : 0,
		};
	}, [stops]);

	const activeIndex = stops.findIndex(
		(s) => s.qtyPicked < s.qtyToPick || s.qtyToPick <= 0,
	);
	const waveComplete =
		progress.total > 0 && progress.completed === progress.total;

	const handleConfirm = async (lineId: string, scanCode?: string) => {
		setConfirmingLineId(lineId);
		try {
			const result = await confirmMutation.mutateAsync({
				organizationId,
				waveId: params.waveId,
				lineId,
				scanCode,
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.orders.getWave.key(),
			});
			if (result.waveCompleted) {
				toast.success("Wave complete!");
			} else {
				toast.success("Line picked");
			}
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Failed to confirm pick";
			toast.error(message);
		} finally {
			setConfirmingLineId(null);
		}
	};

	if (isPending) {
		return (
			<p className="text-sm text-muted-foreground">Loading pick list…</p>
		);
	}

	if (isError || !wave) {
		return (
			<p className="text-sm text-destructive">Wave not found.</p>
		);
	}

	if (!routePlan || !pickerRoute) {
		return (
			<div className="space-y-3">
				<p className="text-sm text-muted-foreground">
					Release this wave from fulfillment to generate pick routes.
				</p>
				<Button variant="outline" asChild>
					<Link href={`/app/orders/fulfill/${wave.id}`}>Open wave</Link>
				</Button>
			</div>
		);
	}

	if (waveComplete) {
		return (
			<div className="flex flex-col items-center gap-4 py-12 text-center">
				{showPrint && (
					<PrintPickList
						waveNumber={wave.waveNumber}
						pickerLabel={pickerRoute.label}
						stops={stops}
					/>
				)}
				<ShippingLabelModal
					open={showLabel}
					onOpenChange={setShowLabel}
					waveId={params.waveId}
					waveNumber={wave.waveNumber}
				/>
				<CheckCircle2 className="size-16 text-green-600" />
				<h2 className="text-xl font-semibold">Wave complete</h2>
				<p className="text-muted-foreground text-sm">
					{pickerRoute.label} finished all {progress.total} stops for{" "}
					{wave.waveNumber}.
				</p>
				<div className="flex flex-col gap-2 w-full max-w-xs">
					<Button variant="secondary" onClick={() => setShowPrint(true)}>
						Print pick list
					</Button>
					<Button variant="secondary" onClick={() => setShowLabel(true)}>
						Print shipping label
					</Button>
					<Button asChild>
						<Link href="/app/orders?tab=fulfill">Back to fulfillment</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/app/home">Admin dashboard</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 pb-8">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/operator">
						<ArrowLeft className="size-4" />
					</Link>
				</Button>
				<div>
					<h2 className="font-semibold">{wave.waveNumber}</h2>
					<p className="text-xs text-muted-foreground">
						{pickerRoute.label} · Cart {pickerRoute.cartId}
					</p>
				</div>
			</div>

			<PickProgressBar {...progress} />

			{routePlan.pickers.length > 1 && (
				<div className="flex flex-wrap gap-2">
					{routePlan.pickers.map((p, i) => (
						<Button
							key={p.label}
							variant={p.label === pickerRoute.label ? "default" : "outline"}
							size="sm"
							asChild
						>
							<Link
								href={`/operator/pick/${params.waveId}?picker=${i + 1}`}
							>
								{p.label}
							</Link>
						</Button>
					))}
				</div>
			)}

			<div className="space-y-3">
				{stops.map((stop, idx) => (
					<PickLineCard
						key={stop.lineId}
						stop={stop}
						isActive={idx === activeIndex}
						isComplete={
							stop.qtyToPick > 0 && stop.qtyPicked >= stop.qtyToPick
						}
						confirming={confirmingLineId === stop.lineId}
						onConfirm={(scanCode) =>
							handleConfirm(stop.lineId, scanCode)
						}
					/>
				))}
			</div>
		</div>
	);
}
