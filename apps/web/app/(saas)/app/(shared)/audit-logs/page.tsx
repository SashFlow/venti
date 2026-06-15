"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
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
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { DownloadIcon, SearchIcon, ShieldIcon } from "lucide-react";
import { useMemo, useState } from "react";

function severityTone(severity: "info" | "review") {
	if (severity === "info") {
		return "border-emerald-200 bg-emerald-50 text-emerald-700";
	}
	return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatTimestamp(iso: string) {
	return new Date(iso).toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function AuditLogsPage() {
	const { organization } = useSession();
	const organizationId = organization?.id ?? "";
	const [query, setQuery] = useState("");
	const [resourceFilter, setResourceFilter] = useState("all");

	const { data, isPending } = useQuery({
		...orpc.organizations.listAuditLogs.queryOptions({
			input: { organizationId, limit: 100 },
		}),
		enabled: Boolean(organizationId),
	});

	const entries = data?.logs ?? [];

	const filteredEntries = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return entries.filter((entry) => {
			const matchesResource =
				resourceFilter === "all" || entry.resource === resourceFilter;
			const matchesQuery =
				normalizedQuery.length === 0 ||
				entry.action.toLowerCase().includes(normalizedQuery) ||
				entry.actor.toLowerCase().includes(normalizedQuery) ||
				entry.summary.toLowerCase().includes(normalizedQuery);
			return matchesResource && matchesQuery;
		});
	}, [entries, query, resourceFilter]);

	const reviewCount = entries.filter((e) => e.severity === "review").length;

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Audit Logs
					</h1>
					<p className="max-w-3xl text-muted-foreground">
						Review operator actions, approvals, and high-impact
						mutations across the workspace.
					</p>
				</div>
				<Button variant="outline">
					<DownloadIcon className="mr-2 size-4" />
					Export View
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Total entries
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								{data?.total ?? 0}
							</p>
						</div>
						<ShieldIcon className="size-5 text-sky-600" />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">
							Needs review
						</p>
						<p className="text-3xl font-semibold tracking-tight">
							{reviewCount}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">Source</p>
						<p className="text-lg font-semibold tracking-tight">
							Live audit trail
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="space-y-4 p-4 md:p-6">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
						<div className="relative w-full lg:max-w-md">
							<SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search actions, actors, or summaries"
								className="pl-9"
							/>
						</div>
						<Select
							value={resourceFilter}
							onValueChange={(value) => {
								if (value) setResourceFilter(value);
							}}
						>
							<SelectTrigger className="w-full lg:w-52">
								<SelectValue placeholder="Filter by resource" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All resources</SelectItem>
								<SelectItem value="ReturnOrder">ReturnOrder</SelectItem>
								<SelectItem value="Vendor">Vendor</SelectItem>
								<SelectItem value="Customer">Customer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isPending ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							Loading audit logs…
						</p>
					) : filteredEntries.length === 0 ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							No audit entries yet. Approve an insight or complete a
							return to populate the trail.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Time</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Resource</TableHead>
									<TableHead>Actor</TableHead>
									<TableHead>Summary</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredEntries.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell className="whitespace-nowrap text-sm">
											{formatTimestamp(entry.timestamp)}
										</TableCell>
										<TableCell>
											<span
												className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${severityTone(entry.severity)}`}
											>
												{entry.action}
											</span>
										</TableCell>
										<TableCell>{entry.resource}</TableCell>
										<TableCell>{entry.actor}</TableCell>
										<TableCell className="max-w-xs truncate text-sm text-muted-foreground">
											{entry.summary}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
