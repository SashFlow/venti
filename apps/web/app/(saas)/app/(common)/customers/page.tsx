"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Pagination } from "@saas/shared/components/Pagination";
import { PlusIcon, SearchIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

type Customer = {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	isWholesaler: boolean;
	notes: string | null;
	lastOrderDate: string | null;
	totalOrders: number;
	createdAt: string;
};

// TODO: replace with real API data
const PLACEHOLDER_CUSTOMERS: Customer[] = [
	{
		id: "cust_1",
		name: "Acme Corp",
		email: "billing@acmecorp.com",
		phone: "+1 555-010-0001",
		isWholesaler: true,
		notes: "Key wholesale account",
		lastOrderDate: "2026-04-28",
		totalOrders: 142,
		createdAt: "2023-01-15",
	},
	{
		id: "cust_2",
		name: "Jane Smith",
		email: "jane.smith@example.com",
		phone: "+1 555-010-0002",
		isWholesaler: false,
		notes: null,
		lastOrderDate: "2026-05-01",
		totalOrders: 8,
		createdAt: "2024-03-22",
	},
	{
		id: "cust_3",
		name: "GlobalTech Distribution",
		email: "orders@globaltech.io",
		phone: "+1 555-010-0003",
		isWholesaler: true,
		notes: "Net 30 payment terms",
		lastOrderDate: "2026-04-15",
		totalOrders: 67,
		createdAt: "2023-07-09",
	},
	{
		id: "cust_4",
		name: "Michael Torres",
		email: "m.torres@email.com",
		phone: null,
		isWholesaler: false,
		notes: null,
		lastOrderDate: "2026-03-20",
		totalOrders: 3,
		createdAt: "2025-01-05",
	},
	{
		id: "cust_5",
		name: "RetailPlus LLC",
		email: "purchasing@retailplus.com",
		phone: "+1 555-010-0005",
		isWholesaler: true,
		notes: "Preferred vendor status",
		lastOrderDate: "2026-05-03",
		totalOrders: 201,
		createdAt: "2022-11-30",
	},
];

// TODO: wire up real API calls
async function deleteCustomer(_customerId: string): Promise<void> {
	// TODO: orpc.customers.delete.mutate({ id: customerId })
	await new Promise((r) => setTimeout(r, 600));
}

export default function CustomersPage() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	// TODO: replace local state + placeholder with useQuery(orpc.customers.list.queryOptions(...))
	const isLoading = false;

	const filtered = PLACEHOLDER_CUSTOMERS.filter((c) => {
		if (!search) {
			return true;
		}
		const q = search.toLowerCase();
		return (
			c.name.toLowerCase().includes(q) ||
			c.email?.toLowerCase().includes(q) ||
			c.phone?.includes(q)
		);
	});

	const paginated = filtered.slice(
		(page - 1) * ITEMS_PER_PAGE,
		page * ITEMS_PER_PAGE,
	);

	function handleDelete(customer: Customer) {
		toast.promise(deleteCustomer(customer.id), {
			loading: `Deleting ${customer.name}…`,
			success: `${customer.name} deleted.`,
			error: `Failed to delete ${customer.name}.`,
		});
	}

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
				<Button asChild>
					<Link href="/app/customers/create">
						<PlusIcon className="size-4" />
						Create Customer
					</Link>
				</Button>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="p-0">
					<div className="flex items-center gap-2 px-4 py-3 border-b">
						<SearchIcon className="size-4 text-muted-foreground shrink-0" />
						<Input
							className="h-8 border-0 shadow-none focus-visible:ring-0 px-0"
							placeholder="Filter customers…"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
						/>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Last Order</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading
								? Array.from({ length: 8 }).map((_, i) => (
										<TableRow key={`skel-${i}`}>
											<TableCell>
												<Skeleton className="h-4 w-40" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-48" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-32" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="ml-auto h-8 w-8" />
											</TableCell>
										</TableRow>
									))
								: paginated.map((customer) => (
										<TableRow key={customer.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													<div className="flex size-7 items-center justify-center rounded-full bg-muted">
														<UserIcon className="size-3.5 text-muted-foreground" />
													</div>
													{customer.name}
												</div>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{customer.email ?? "—"}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{customer.phone ?? "—"}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{customer.lastOrderDate ?? "—"}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="sm"
														asChild
													>
														<Link
															href={`/app/customers/${customer.id}`}
														>
															View
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="sm"
														asChild
													>
														<Link
															href={`/app/customers/${customer.id}/edit`}
														>
															Edit
														</Link>
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="text-destructive hover:text-destructive"
														onClick={() =>
															handleDelete(customer)
														}
													>
														Delete
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
							{!isLoading && paginated.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-32 text-center text-muted-foreground"
									>
										No customers found…{" "}
										<Link
											href="/app/customers/create"
											className="text-primary underline-offset-4 hover:underline"
										>
											Add one
										</Link>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{filtered.length > ITEMS_PER_PAGE && (
						<div className="border-t px-4 py-3">
							<Pagination
								totalItems={filtered.length}
								itemsPerPage={ITEMS_PER_PAGE}
								currentPage={page}
								onChangeCurrentPage={setPage}
							/>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
