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
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
	Link2Icon,
	SearchIcon,
	ShieldCheckIcon,
	WorkflowIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type ConnectorStatus = "planned";

type Connector = {
	id: string;
	name: string;
	category: string;
	status: ConnectorStatus;
	coverage: string;
	notes: string;
};

const CONNECTORS: Connector[] = [
	{
		id: "sap-business-one",
		name: "SAP Business One",
		category: "ERP",
		status: "planned",
		coverage: "POs, receipts, stock adjustments",
		notes: "Available Phase 2 — request integration to join early access.",
	},
	{
		id: "tally",
		name: "Tally",
		category: "ERP",
		status: "planned",
		coverage: "GL sync, inventory vouchers",
		notes: "Available Phase 2 — India SMB accounting bridge.",
	},
	{
		id: "shopify",
		name: "Shopify",
		category: "Commerce",
		status: "planned",
		coverage: "Orders, fulfillments, returns",
		notes: "Available Phase 2 — B2B and D2C channel connector.",
	},
];

function statusClasses(status: ConnectorStatus) {
	return "border-slate-200 bg-slate-100 text-slate-700";
}

function statusLabel(status: ConnectorStatus) {
	return "Available Phase 2";
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

	const phase2Count = CONNECTORS.length;

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight">
						Integrations
					</h1>
					<p className="max-w-3xl text-muted-foreground">
						ERP and commerce connectors are on the Phase 2 roadmap.
						Request integration access for SAP Business One, Tally,
						and Shopify.
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
							Phase 2 catalog
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-end justify-between gap-3">
						<div>
							<p className="text-3xl font-semibold tracking-tight">
								{phase2Count}
							</p>
							<p className="text-sm text-muted-foreground">
								SAP, Tally, Shopify — available on request.
							</p>
						</div>
						<ShieldCheckIcon className="size-5 text-emerald-600" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Connected
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-end justify-between gap-3">
						<div>
							<p className="text-3xl font-semibold tracking-tight">0</p>
							<p className="text-sm text-muted-foreground">
								Live connectors ship in Phase 2.
							</p>
						</div>
						<ShieldCheckIcon className="size-5 text-muted-foreground" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Request integration
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-end justify-between gap-3">
						<div>
							<p className="text-lg font-semibold tracking-tight">
								Early access
							</p>
							<p className="text-sm text-muted-foreground">
								Contact sales for India ERP bridge onboarding.
							</p>
						</div>
						<Link2Icon className="size-5 text-sky-600" />
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
												: "Phase 2"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">
											All statuses
										</SelectItem>
										<SelectItem value="planned">
											Phase 2
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

											<div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
												{connector.notes}
											</div>

											<Button size="sm">
												<Link2Icon className="mr-2 size-4" />
												Request integration
											</Button>
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
							<CardTitle>Sync activity</CardTitle>
						</CardHeader>
						<CardContent className="py-10 text-center text-sm text-muted-foreground">
							No live sync runs — connectors are Phase 2. Request
							integration to join the early access program.
						</CardContent>
					</Card>
				)}
			</Tabs>
		</div>
	);
}
