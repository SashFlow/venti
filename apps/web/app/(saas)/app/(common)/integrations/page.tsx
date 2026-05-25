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
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	ArrowUpRightIcon,
	CircleAlertIcon,
	Link2Icon,
	RefreshCcwIcon,
	SearchIcon,
	ShieldCheckIcon,
	WorkflowIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type ConnectorStatus = "connected" | "attention" | "planned";

type Connector = {
	id: string;
	name: string;
	category: string;
	status: ConnectorStatus;
	lastSync: string;
	owner: string;
	coverage: string;
	notes: string;
};

type SyncRun = {
	id: string;
	connector: string;
	status: "healthy" | "warning" | "queued";
	window: string;
	records: string;
	owner: string;
};

const CONNECTORS: Connector[] = [
	{
		id: "sap-business-one",
		name: "SAP Business One",
		category: "ERP",
		status: "connected",
		lastSync: "8 min ago",
		owner: "Ops Systems",
		coverage: "POs, receipts, stock adjustments",
		notes: "Daily volume stable. Last full sync completed without drift.",
	},
	{
		id: "shopify-b2b",
		name: "Shopify B2B",
		category: "Commerce",
		status: "attention",
		lastSync: "43 min ago",
		owner: "Digital Commerce",
		coverage: "Orders, customer profiles, fulfillment status",
		notes: "Webhook retries detected for three outbound order updates.",
	},
	{
		id: "carrier-cloud",
		name: "Carrier Cloud",
		category: "Carrier",
		status: "connected",
		lastSync: "2 min ago",
		owner: "Transport Desk",
		coverage: "Rates, labels, shipment events",
		notes: "Rate shopping is active across six service levels.",
	},
	{
		id: "netsuite-finance",
		name: "NetSuite Finance",
		category: "Finance",
		status: "planned",
		lastSync: "Not configured",
		owner: "Finance Systems",
		coverage: "Invoices, returns credits, landed cost feeds",
		notes: "Awaiting field mapping and sandbox credentials.",
	},
];

const SYNC_RUNS: SyncRun[] = [
	{
		id: "RUN-3021",
		connector: "SAP Business One",
		status: "healthy",
		window: "09:00-09:15",
		records: "1,248 records",
		owner: "Ops Systems",
	},
	{
		id: "RUN-3018",
		connector: "Shopify B2B",
		status: "warning",
		window: "08:30-08:45",
		records: "82 records",
		owner: "Digital Commerce",
	},
	{
		id: "RUN-3014",
		connector: "NetSuite Finance",
		status: "queued",
		window: "Pending approval",
		records: "0 records",
		owner: "Finance Systems",
	},
];

function statusClasses(status: ConnectorStatus | SyncRun["status"]) {
	switch (status) {
		case "connected":
		case "healthy":
			return "border-emerald-200 bg-emerald-50 text-emerald-700";
		case "attention":
		case "warning":
			return "border-amber-200 bg-amber-50 text-amber-700";
		default:
			return "border-slate-200 bg-slate-100 text-slate-700";
	}
}

function statusLabel(status: ConnectorStatus | SyncRun["status"]) {
	if (status === "healthy") {
		return "Healthy";
	}

	if (status === "warning") {
		return "Needs attention";
	}

	if (status === "queued") {
		return "Queued";
	}

	return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function IntegrationsPage() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | ConnectorStatus>(
		"all",
	);
	const [activeTab, setActiveTab] = useState<"catalog" | "activity">(
		"catalog",
	);

	const filteredConnectors = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return CONNECTORS.filter((connector) => {
			const matchesStatus =
				statusFilter === "all" || connector.status === statusFilter;
			const matchesQuery =
				normalizedQuery.length === 0 ||
				connector.name.toLowerCase().includes(normalizedQuery) ||
				connector.category.toLowerCase().includes(normalizedQuery) ||
				connector.coverage.toLowerCase().includes(normalizedQuery);

			return matchesStatus && matchesQuery;
		});
	}, [query, statusFilter]);

	const connectedCount = CONNECTORS.filter(
		(connector) => connector.status === "connected",
	).length;
	const attentionCount = CONNECTORS.filter(
		(connector) => connector.status === "attention",
	).length;

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Integrations
					</h1>
					<p className="max-w-3xl text-muted-foreground">
						Track connector health, review sync coverage, and stage
						new integration requests. This frontend surface is ready
						for operations review while backend provisioning
						endpoints are still pending.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" disabled>
						<WorkflowIcon className="mr-2 size-4" />
						Provision Connector
					</Button>
					<Button>
						<Link2Icon className="mr-2 size-4" />
						Request Integration
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Connected
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-end justify-between gap-3">
						<div>
							<p className="text-3xl font-semibold tracking-tight">
								{connectedCount}
							</p>
							<p className="text-sm text-muted-foreground">
								Active data exchanges in the current workspace.
							</p>
						</div>
						<ShieldCheckIcon className="size-5 text-emerald-600" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Needs Attention
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-end justify-between gap-3">
						<div>
							<p className="text-3xl font-semibold tracking-tight">
								{attentionCount}
							</p>
							<p className="text-sm text-muted-foreground">
								Connectors with retries, drift, or credential
								follow-up.
							</p>
						</div>
						<CircleAlertIcon className="size-5 text-amber-600" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Next Review
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-end justify-between gap-3">
						<div>
							<p className="text-3xl font-semibold tracking-tight">
								14:30
							</p>
							<p className="text-sm text-muted-foreground">
								Connector governance review for pending
								approvals.
							</p>
						</div>
						<ArrowUpRightIcon className="size-5 text-sky-600" />
					</CardContent>
				</Card>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) =>
					setActiveTab(value as "catalog" | "activity")
				}
				className="space-y-4 flex flex-col"
			>
				<TabsList
					variant="default"
					className="h-auto w-full justify-start overflow-x-auto"
				>
					<TabsTrigger value="catalog" className="h-10 px-3">
						Connector Catalog
					</TabsTrigger>
					<TabsTrigger value="activity" className="h-10 px-3">
						Recent Activity
					</TabsTrigger>
				</TabsList>

				{activeTab === "catalog" ? (
					<Card>
						<CardContent className="space-y-5 p-4 md:p-6">
							<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
								<div className="relative w-full lg:max-w-md">
									<SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										value={query}
										onChange={(event) =>
											setQuery(event.target.value)
										}
										placeholder="Search connectors, categories, or coverage"
										className="pl-9"
									/>
								</div>
								<Select
									value={statusFilter}
									onValueChange={(value) =>
										setStatusFilter(
											value as "all" | ConnectorStatus,
										)
									}
								>
									<SelectTrigger className="w-full lg:w-52">
										<SelectValue placeholder="Filter by status">
											{statusFilter === "all"
												? "All statuses"
												: statusFilter === "connected"
													? "Connected"
													: statusFilter ===
															"attention"
														? "Needs attention"
														: "Planned"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All statuses
										</SelectItem>
										<SelectItem value="connected">
											Connected
										</SelectItem>
										<SelectItem value="attention">
											Needs attention
										</SelectItem>
										<SelectItem value="planned">
											Planned
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-4 xl:grid-cols-2">
								{filteredConnectors.map((connector) => (
									<Card
										key={connector.id}
										className="border-dashed"
									>
										<CardContent className="space-y-4 p-5">
											<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<p className="text-lg font-semibold tracking-tight">
														{connector.name}
													</p>
													<p className="text-sm text-muted-foreground">
														{connector.category} .{" "}
														{connector.coverage}
													</p>
												</div>
												<span
													className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(connector.status)}`}
												>
													{statusLabel(
														connector.status,
													)}
												</span>
											</div>

											<div className="grid gap-3 sm:grid-cols-3">
												<div>
													<p className="text-xs uppercase tracking-wide text-muted-foreground">
														Last sync
													</p>
													<p className="mt-1 text-sm font-medium">
														{connector.lastSync}
													</p>
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-muted-foreground">
														Owner
													</p>
													<p className="mt-1 text-sm font-medium">
														{connector.owner}
													</p>
												</div>
												<div>
													<p className="text-xs uppercase tracking-wide text-muted-foreground">
														Coverage
													</p>
													<p className="mt-1 text-sm font-medium">
														{connector.coverage}
													</p>
												</div>
											</div>

											<div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
												{connector.notes}
											</div>

											<div className="flex flex-wrap gap-2">
												<Button
													variant="outline"
													size="sm"
												>
													Review Mapping
												</Button>
												<Button
													variant="outline"
													size="sm"
												>
													<RefreshCcwIcon className="mr-2 size-4" />
													Run Sync Check
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{filteredConnectors.length === 0 ? (
								<div className="rounded-xl border border-dashed px-6 py-10 text-center">
									<p className="text-lg font-semibold tracking-tight">
										No connectors match the current filter
									</p>
									<p className="mt-2 text-sm text-muted-foreground">
										Broaden the search or switch the status
										filter to review the full integration
										catalog.
									</p>
								</div>
							) : null}
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>Recent Sync Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Run</TableHead>
										<TableHead>Connector</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Window</TableHead>
										<TableHead>Records</TableHead>
										<TableHead>Owner</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{SYNC_RUNS.map((run) => (
										<TableRow key={run.id}>
											<TableCell className="font-medium">
												{run.id}
											</TableCell>
											<TableCell>
												{run.connector}
											</TableCell>
											<TableCell>
												<span
													className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(run.status)}`}
												>
													{statusLabel(run.status)}
												</span>
											</TableCell>
											<TableCell>{run.window}</TableCell>
											<TableCell>{run.records}</TableCell>
											<TableCell>{run.owner}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</Tabs>
		</div>
	);
}
