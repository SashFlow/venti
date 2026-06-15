"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Disposition = "RESTOCK" | "SCRAP" | "REFURBISH" | "RETURN_TO_VENDOR";

const STEPS = ["Request", "Inspection", "Disposition", "Complete"] as const;

export default function ReturnsWizardPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const [step, setStep] = useState(0);
	const [customerName, setCustomerName] = useState("");
	const [skuCode, setSkuCode] = useState("");
	const [reason, setReason] = useState("");
	const [qty, setQty] = useState("1");
	const [inspectionPassed, setInspectionPassed] = useState(true);
	const [disposition, setDisposition] = useState<Disposition>("RESTOCK");
	const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const [resultLocation, setResultLocation] = useState<string | null>(null);

	const { data: returnsData } = useQuery({
		...orpc.returns.listReturnOrders.queryOptions({
			input: { organizationId, limit: 10 },
		}),
		enabled: Boolean(organizationId),
	});

	const completeMutation = useMutation(
		orpc.returns.completeReturnDisposition.mutationOptions(),
	);

	const demoReturn = useMemo(() => {
		const orders = returnsData?.orders ?? [];
		return (
			orders.find((o: { status: string }) => o.status !== "COMPLETED") ??
			orders[0]
		);
	}, [returnsData]);

	const loadDemoReturn = () => {
		if (!demoReturn) {
			toast.error("No return orders in seed data.");
			return;
		}
		const item = demoReturn.items?.[0];
		setSelectedReturnId(demoReturn.id);
		setSelectedItemId(item?.id ?? null);
		setCustomerName(demoReturn.customer?.name ?? "");
		setSkuCode(item?.sku?.code ?? "");
		setQty(String(Number(item?.quantity ?? 1)));
		setReason(demoReturn.reason ?? "Customer return — demo");
		setStep(0);
		toast.success("Demo return loaded");
	};

	const handleComplete = async () => {
		if (!selectedReturnId || !selectedItemId) {
			toast.error("Select or load a return first.");
			return;
		}
		try {
			const result = await completeMutation.mutateAsync({
				organizationId,
				returnOrderId: selectedReturnId,
				itemId: selectedItemId,
				disposition,
				inspectionPassed,
			});
			setResultLocation(result.restockLocationCode ?? null);
			setStep(3);
			toast.success("Return disposition complete");
		} catch {
			toast.error("Failed to complete return");
		}
	};

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Returns</h1>
					<p className="text-sm text-muted-foreground">
						4-step reverse logistics wizard
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={loadDemoReturn}>
					Load demo return
				</Button>
			</div>

			<div className="flex gap-1">
				{STEPS.map((label, idx) => (
					<div
						key={label}
						className={`flex-1 h-1 rounded-full ${
							idx <= step ? "bg-primary" : "bg-muted"
						}`}
					/>
				))}
			</div>

			{step === 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">1. Request</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<Label>Customer</Label>
							<Input
								value={customerName}
								onChange={(e) => setCustomerName(e.target.value)}
								placeholder="Customer name"
							/>
						</div>
						<div>
							<Label>SKU</Label>
							<Input
								value={skuCode}
								onChange={(e) => setSkuCode(e.target.value)}
								placeholder="SKU code"
							/>
						</div>
						<div>
							<Label>Reason</Label>
							<Input
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</div>
						<div>
							<Label>Quantity</Label>
							<Input
								type="number"
								min={1}
								value={qty}
								onChange={(e) => setQty(e.target.value)}
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{step === 1 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">2. Inspection</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Inspect {qty} × {skuCode || "SKU"} from {customerName || "customer"}
						</p>
						<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
							Photo capture placeholder (camera stub)
						</div>
						<div className="flex gap-2">
							<Button
								variant={inspectionPassed ? "default" : "outline"}
								onClick={() => setInspectionPassed(true)}
							>
								Pass
							</Button>
							<Button
								variant={!inspectionPassed ? "destructive" : "outline"}
								onClick={() => setInspectionPassed(false)}
							>
								Fail
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{step === 2 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">3. Disposition</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Select
							value={disposition}
							onValueChange={(v) => setDisposition(v as Disposition)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="RESTOCK">RESTOCK</SelectItem>
								<SelectItem value="SCRAP">SCRAP</SelectItem>
								<SelectItem value="REFURBISH">REFURBISH</SelectItem>
								<SelectItem value="RETURN_TO_VENDOR">RTV</SelectItem>
							</SelectContent>
						</Select>
						<Button
							className="w-full"
							onClick={handleComplete}
							disabled={completeMutation.isPending}
						>
							Complete disposition
						</Button>
					</CardContent>
				</Card>
			)}

			{step === 3 && (
				<Card>
					<CardContent className="py-10 text-center space-y-4">
						<CheckCircle2 className="size-14 text-green-600 mx-auto" />
						<h2 className="text-xl font-semibold">Return complete</h2>
						<p className="text-sm text-muted-foreground">
							{disposition === "RESTOCK" && resultLocation
								? `${qty} × ${skuCode} restocked to ${resultLocation}`
								: `Disposition: ${disposition}`}
						</p>
						<Button asChild variant="outline">
							<Link href="/app/warehouse">
								<Package className="size-4 mr-2" />
								View in 3D twin
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			<div className="flex justify-between">
				<Button
					variant="outline"
					disabled={step === 0}
					onClick={() => setStep((s) => Math.max(0, s - 1))}
				>
					<ChevronLeft className="size-4" />
					Back
				</Button>
				{step < 2 && (
					<Button onClick={() => setStep((s) => s + 1)}>
						Next
						<ChevronRight className="size-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
