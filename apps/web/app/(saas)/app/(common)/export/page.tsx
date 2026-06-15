"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import {
	DownloadIcon,
	FileSpreadsheetIcon,
	MoveRight,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	DEFAULT_EXPORT_JOBS,
	EXPORT_STORAGE_KEY,
	type ExportJob,
} from "./lib/mock-exports";

function statusTone(status: ExportJob["status"]) {
	switch (status) {
		case "completed":
			return "border-emerald-200 bg-emerald-50 text-emerald-700";
		case "running":
			return "border-sky-200 bg-sky-50 text-sky-700";
		case "failed":
			return "border-rose-200 bg-rose-50 text-rose-700";
		default:
			return "border-amber-200 bg-amber-50 text-amber-700";
	}
}

export default function ExportPage() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | ExportJob["status"]
	>("all");
	const [jobs, setJobs] = useState<ExportJob[]>(DEFAULT_EXPORT_JOBS);

	useEffect(() => {
		const stored = window.localStorage.getItem(EXPORT_STORAGE_KEY);
		if (!stored) {
			window.localStorage.setItem(
				EXPORT_STORAGE_KEY,
				JSON.stringify(DEFAULT_EXPORT_JOBS),
			);
			return;
		}

		try {
			const parsed = JSON.parse(stored) as ExportJob[];
			setJobs(parsed);
		} catch {
			window.localStorage.setItem(
				EXPORT_STORAGE_KEY,
				JSON.stringify(DEFAULT_EXPORT_JOBS),
			);
			setJobs(DEFAULT_EXPORT_JOBS);
		}
	}, []);

	const filteredJobs = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return jobs.filter((job) => {
			const matchesStatus =
				statusFilter === "all" || job.status === statusFilter;
			const matchesQuery =
				normalizedQuery.length === 0 ||
				job.reportType.toLowerCase().includes(normalizedQuery) ||
				job.scope.toLowerCase().includes(normalizedQuery) ||
				job.requestedBy.toLowerCase().includes(normalizedQuery);

			return matchesStatus && matchesQuery;
		});
	}, [jobs, query, statusFilter]);

	return (
		<div className="mx-auto w-full max-w-7xl space-y-8 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Export
					</h1>
					<p className="max-w-3xl text-muted-foreground">
						Prepare workspace extracts for downstream systems and
						manual review. The flow is frontend-complete and uses a
						local staged store until export job APIs are available.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() =>
							toast.message(
								"Export request queued (WIP). Supports GDPR Art. 15 / DPDP right to access — full job API coming in Phase 2.",
							)
						}
					>
						<DownloadIcon className="mr-2 size-4" />
						Export Manifest
					</Button>
					<Button onClick={() => router.push("/app/export/create")}>
						<FileSpreadsheetIcon className="mr-2 size-4" />
						Create Export
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">Queued</p>
						<p className="text-3xl font-semibold tracking-tight">
							{
								jobs.filter((job) => job.status === "queued")
									.length
							}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">Running</p>
						<p className="text-3xl font-semibold tracking-tight">
							{
								jobs.filter((job) => job.status === "running")
									.length
							}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">
							Completed
						</p>
						<p className="text-3xl font-semibold tracking-tight">
							{
								jobs.filter((job) => job.status === "completed")
									.length
							}
						</p>
					</CardContent>
				</Card>
			</div>

			<section className="space-y-8 rounded-2xl border bg-card p-6 shadow-xs">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="relative w-full lg:max-w-3xl">
						<Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
						<Input
							aria-label="Filter exports"
							placeholder="Filter by report, scope, or requester"
							className="h-14 rounded-2xl border-muted bg-muted/30 pl-13 text-lg"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
					</div>

					<Select
						value={statusFilter}
						onValueChange={(value) =>
							setStatusFilter(
								value as "all" | ExportJob["status"],
							)
						}
					>
						<SelectTrigger className="h-12 w-full rounded-xl lg:w-56">
							<SelectValue placeholder="Filter by status">
								{statusFilter === "all"
									? "All statuses"
									: statusFilter.charAt(0).toUpperCase() +
										statusFilter.slice(1)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							<SelectItem value="queued">Queued</SelectItem>
							<SelectItem value="running">Running</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="failed">Failed</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="rounded-xl border bg-background">
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Type
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Scope
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Created
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Completed
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Status
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredJobs.map((job) => (
								<TableRow
									key={job.id}
									className="hover:bg-transparent"
								>
									<TableCell className="px-6 font-medium">
										<div>
											<p>{job.reportType}</p>
											<p className="text-xs text-muted-foreground uppercase tracking-wide">
												{job.format}
											</p>
										</div>
									</TableCell>
									<TableCell className="px-6">
										{job.scope}
									</TableCell>
									<TableCell className="px-6">
										{job.createdAt}
									</TableCell>
									<TableCell className="px-6">
										{job.completedAt ?? "Pending"}
									</TableCell>
									<TableCell className="px-6">
										<span
											className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(job.status)}`}
										>
											{job.status}
										</span>
									</TableCell>
									<TableCell className="px-6">
										<div className="flex items-center gap-3 text-sm text-muted-foreground">
											<span>{job.requestedBy}</span>
											<span>{job.rowCount}</span>
										</div>
									</TableCell>
								</TableRow>
							))}
							{filteredJobs.length === 0 ? (
								<TableRow className="hover:bg-transparent">
									<TableCell
										colSpan={6}
										className="h-56 p-6 text-center align-middle"
									>
										<div className="space-y-4">
											<h2 className="text-xl font-semibold tracking-tight">
												No export jobs match the current
												filters
											</h2>
											<p className="text-muted-foreground">
												Create a new export or clear the
												search to review staged jobs.
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : null}
						</TableBody>
					</Table>
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					<Link
						href="/app/export/create"
						className="group flex min-h-30 items-center justify-between rounded-2xl border bg-card px-10 py-8 text-xl font-semibold tracking-tight shadow-xs transition-colors hover:bg-muted/20"
					>
						<span>Create a New Export</span>
						<MoveRight className="text-primary size-9 transition-transform group-hover:translate-x-1" />
					</Link>

					<Link
						href="/app/export/create"
						className="group flex min-h-30 items-center justify-between rounded-2xl border bg-card px-10 py-8 text-xl font-semibold tracking-tight shadow-xs transition-colors hover:bg-muted/20"
					>
						<span>Configure Another Report</span>
						<MoveRight className="text-primary size-9 transition-transform group-hover:translate-x-1" />
					</Link>
				</div>
			</section>
		</div>
	);
}
