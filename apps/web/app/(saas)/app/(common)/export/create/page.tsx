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
import { Switch } from "@repo/ui/switch";
import { Textarea } from "@repo/ui/textarea";
import { useSession } from "@saas/auth/hooks/use-session";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	createMockExportJob,
	DEFAULT_EXPORT_JOBS,
	EXPORT_STORAGE_KEY,
} from "../lib/mock-exports";

const REPORT_TYPES = [
	"Inventory Snapshot",
	"Customer Master",
	"Vendor Directory",
	"Open Orders",
	"Cycle Count Variance",
];

const REPORT_SCOPES = [
	"All warehouses",
	"Wholesale accounts",
	"All vendors",
	"Outbound orders",
	"Cycle count program",
];

export default function CreatePage() {
	const router = useRouter();
	const { user } = useSession();
	const [reportType, setReportType] = useState(REPORT_TYPES[0] ?? "");
	const [scope, setScope] = useState(REPORT_SCOPES[0] ?? "");
	const [format, setFormat] = useState<"csv" | "xlsx">("csv");
	const [includeHeaders, setIncludeHeaders] = useState(true);
	const [deliverToEmail, setDeliverToEmail] = useState(user?.email ?? "");
	const [notes, setNotes] = useState("");

	const handleCreate = () => {
		if (!reportType || !scope) {
			toast.error("Report type and scope are required.");
			return;
		}

		const stored = window.localStorage.getItem(EXPORT_STORAGE_KEY);
		let jobs = DEFAULT_EXPORT_JOBS;

		if (stored) {
			try {
				jobs = JSON.parse(stored);
			} catch {
				jobs = DEFAULT_EXPORT_JOBS;
			}
		}

		const newJob = createMockExportJob({
			reportType,
			scope,
			format,
			requestedBy: user?.name || user?.email || "Workspace operator",
		});

		window.localStorage.setItem(
			EXPORT_STORAGE_KEY,
			JSON.stringify([newJob, ...jobs]),
		);

		toast.success(
			includeHeaders
				? `Export queued. Delivery target: ${deliverToEmail || "manual download"}.`
				: "Export queued without column headers.",
		);
		if (notes.trim()) {
			toast.message("Run note captured for this staged export request.");
		}
		router.push("/app/export");
	};

	return (
		<div className="container mx-auto max-w-5xl space-y-6 py-8">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">
					Create Export
				</h1>
				<p className="max-w-3xl text-muted-foreground">
					Stage a report extract for downstream review. This screen
					stores jobs locally until the export job API contract is
					ready.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Export configuration
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Report type</Label>
							<Select
								value={reportType}
								onValueChange={(value) => {
									if (value) {
										setReportType(value);
									}
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select report type">
										{type || "Select report type"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{REPORT_TYPES.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Scope</Label>
							<Select
								value={scope}
								onValueChange={(value) => {
									if (value) {
										setScope(value);
									}
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select scope">
										{scope || "Select scope"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{REPORT_SCOPES.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Format</Label>
							<Select
								value={format}
								onValueChange={(value) =>
									setFormat(value as "csv" | "xlsx")
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select format">
										{format === "csv"
											? "CSV"
											: format === "xlsx"
												? "XLSX"
												: "Select format"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="csv">CSV</SelectItem>
									<SelectItem value="xlsx">XLSX</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Deliver to</Label>
							<Input
								value={deliverToEmail}
								onChange={(event) =>
									setDeliverToEmail(event.target.value)
								}
								placeholder="ops@example.com"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between rounded-xl border px-4 py-3">
						<div>
							<p className="font-medium">
								Include column headers
							</p>
							<p className="text-sm text-muted-foreground">
								Disable this only for downstream fixed-width
								imports.
							</p>
						</div>
						<Switch
							checked={includeHeaders}
							onCheckedChange={setIncludeHeaders}
						/>
					</div>

					<div className="space-y-2">
						<Label>Run notes</Label>
						<Textarea
							value={notes}
							onChange={(event) => setNotes(event.target.value)}
							placeholder="Optional instructions for the operator receiving this extract"
							className="min-h-28"
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="border-dashed">
				<CardHeader>
					<CardTitle className="text-base">
						Current limitation
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					This request is persisted locally in the browser so the
					export list and create flows behave like a feature while the
					backend job queue is still pending.
				</CardContent>
			</Card>

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					variant="outline"
					onClick={() => router.push("/app/export")}
				>
					Cancel
				</Button>
				<Button onClick={handleCreate}>Queue Export</Button>
			</div>
		</div>
	);
}
