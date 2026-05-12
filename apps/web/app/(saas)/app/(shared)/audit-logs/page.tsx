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
import { DownloadIcon, SearchIcon, ShieldIcon } from "lucide-react";
import { useMemo, useState } from "react";

type AuditEntry = {
	id: string;
	timestamp: string;
	action: string;
	resource: string;
	actor: string;
	channel: string;
	severity: "info" | "review";
	summary: string;
};

const AUDIT_ENTRIES: AuditEntry[] = [
	{
		id: "AUD-2041",
		timestamp: "12 May 2026, 09:42",
		action: "UPDATE_SUPPLIER",
		resource: "Vendor",
		actor: "Aarav Patel",
		channel: "Web",
		severity: "info",
		summary: "Updated supplier banking and contact metadata.",
	},
	{
		id: "AUD-2037",
		timestamp: "12 May 2026, 08:58",
		action: "IMPORT_CUSTOMERS",
		resource: "Customer",
		actor: "Priya Nair",
		channel: "Import",
		severity: "review",
		summary: "Imported 64 records with 3 field warnings.",
	},
	{
		id: "AUD-2031",
		timestamp: "12 May 2026, 08:14",
		action: "DELETE_PACKAGE_TYPE",
		resource: "Packaging",
		actor: "System Admin",
		channel: "Web",
		severity: "review",
		summary: "Removed deprecated parcel carton from all warehouses.",
	},
	{
		id: "AUD-2026",
		timestamp: "12 May 2026, 07:26",
		action: "CREATE_CUSTOMER",
		resource: "Customer",
		actor: "Meera Shah",
		channel: "API",
		severity: "info",
		summary: "Created wholesale customer profile from ERP sync.",
	},
];

function severityTone(severity: AuditEntry["severity"]) {
	if (severity === "info") {
		return "border-emerald-200 bg-emerald-50 text-emerald-700";
	}

	return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function AuditLogsPage() {
	const [query, setQuery] = useState("");
	const [resourceFilter, setResourceFilter] = useState("all");

	const filteredEntries = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return AUDIT_ENTRIES.filter((entry) => {
			const matchesResource =
				resourceFilter === "all" || entry.resource === resourceFilter;
			const matchesQuery =
				normalizedQuery.length === 0 ||
				entry.action.toLowerCase().includes(normalizedQuery) ||
				entry.actor.toLowerCase().includes(normalizedQuery) ||
				entry.summary.toLowerCase().includes(normalizedQuery);

			return matchesResource && matchesQuery;
		});
	}, [query, resourceFilter]);

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Audit Logs
					</h1>
					<p className="max-w-3xl text-muted-foreground">
						Review operator actions, import history, and destructive
						changes across the workspace. Read APIs are not exposed
						yet, so this screen is structured and ready while
						server-side log query procedures are added.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<DownloadIcon className="mr-2 size-4" />
						Export View
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="flex items-center justify-between gap-3 p-5">
						<div>
							<p className="text-sm text-muted-foreground">
								Logged today
							</p>
							<p className="text-3xl font-semibold tracking-tight">
								128
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
							9
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Deletes, bulk imports, and high-impact mutations.
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-sm text-muted-foreground">
							Latest writer
						</p>
						<p className="text-3xl font-semibold tracking-tight">
							09:42
						</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Supplier update captured from the web workspace.
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
								onChange={(event) =>
									setQuery(event.target.value)
								}
								placeholder="Search actions, actors, or summaries"
								className="pl-9"
							/>
						</div>
						<Select
							value={resourceFilter}
							onValueChange={(value) => {
								if (value) {
									setResourceFilter(value);
								}
							}}
						>
							<SelectTrigger className="w-full lg:w-52">
								<SelectValue placeholder="Filter by resource" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All resources
								</SelectItem>
								<SelectItem value="Vendor">Vendor</SelectItem>
								<SelectItem value="Customer">
									Customer
								</SelectItem>
								<SelectItem value="Packaging">
									Packaging
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Time</TableHead>
								<TableHead>Action</TableHead>
								<TableHead>Resource</TableHead>
								<TableHead>Actor</TableHead>
								<TableHead>Channel</TableHead>
								<TableHead>Summary</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredEntries.map((entry) => (
								<TableRow key={entry.id}>
									<TableCell className="whitespace-nowrap">
										{entry.timestamp}
									</TableCell>
									<TableCell className="font-medium">
										{entry.action}
									</TableCell>
									<TableCell>{entry.resource}</TableCell>
									<TableCell>{entry.actor}</TableCell>
									<TableCell>{entry.channel}</TableCell>
									<TableCell>
										<div className="flex items-center gap-3">
											<span
												className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${severityTone(entry.severity)}`}
											>
												{entry.severity === "info"
													? "Logged"
													: "Review"}
											</span>
											<span className="text-muted-foreground">
												{entry.summary}
											</span>
										</div>
									</TableCell>
								</TableRow>
							))}
							{filteredEntries.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="h-28 text-center text-muted-foreground"
									>
										No audit entries match the current
										filter.
									</TableCell>
								</TableRow>
							) : null}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card className="border-dashed">
				<CardHeader>
					<CardTitle className="text-base">Backend status</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Writes already happen through the shared audit utility in
					the API layer, but log listing and export procedures still
					need to be exposed before this page can switch from staged
					entries to live data.
				</CardContent>
			</Card>
		</div>
	);
}
