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
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { Pagination } from "@saas/shared/components/Pagination";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import {
	DownloadIcon,
	FileSpreadsheetIcon,
	MoreVerticalIcon,
	PlusIcon,
	SearchIcon,
	UploadIcon,
	UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useCustomersContext } from "./lib/customers-context";

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

function downloadCsvFile(params: { fileName: string; csv: string }) {
	const blob = new Blob([params.csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = params.fileName;
	anchor.click();
	URL.revokeObjectURL(url);
}

export default function CustomersPage() {
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();
	const {
		organizationId,
		search,
		setSearch,
		page,
		setPage,
		invalidateCustomers,
	} = useCustomersContext();

	const { data, isPending: isLoading } = useQuery({
		...orpc.customers.list.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				query: search.trim() || undefined,
				limit: ITEMS_PER_PAGE,
				offset: (page - 1) * ITEMS_PER_PAGE,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const deleteCustomerMutation = useMutation(
		orpc.customers.delete.mutationOptions(),
	);

	const customers = useMemo<Customer[]>(() => {
		return (data?.customers ?? []).map((customer) => ({
			id: customer.id,
			name: customer.name,
			email: customer.email,
			phone: customer.phone,
			isWholesaler: customer.isWholesaler ?? customer.type === "WHOLESALE",
			notes: customer.notes,
			lastOrderDate: customer.lastOrderAt
				? new Date(customer.lastOrderAt).toISOString().slice(0, 10)
				: null,
			totalOrders: customer.totalOrders ?? 0,
			createdAt: new Date(customer.createdAt).toISOString().slice(0, 10),
		}));
	}, [data?.customers]);

	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, setPage, totalPages]);

	function handleDelete(customer: Customer) {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		confirm({
			title: "Delete customer",
			message: `Delete ${customer.name}? This action cannot be undone.`,
			destructive: true,
			onConfirm: async () => {
				await deleteCustomerMutation.mutateAsync({
					organizationId,
					id: customer.id,
				});

				await invalidateCustomers();
				toast.success(`${customer.name} deleted.`);
			},
		});
	}

	const onDownloadTemplate = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		const result = await queryClient.fetchQuery(
			orpc.customers.importTemplate.queryOptions({
				input: { organizationId },
			}),
		);

		downloadCsvFile({ fileName: result.fileName, csv: result.csv });
	};

	const onExport = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		const result = await queryClient.fetchQuery(
			orpc.customers.export.queryOptions({
				input: {
					organizationId,
					query: search.trim() || undefined,
				},
			}),
		);

		downloadCsvFile({ fileName: result.fileName, csv: result.csv });
		toast.success(`Exported ${result.count} customers.`);
	};

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					Customers
				</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" asChild>
						<Link
							href="/app/customers/import"
							aria-label="Import customers"
						>
							<UploadIcon className="size-4" />
						</Link>
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Download customer template"
						onClick={() => {
							void onDownloadTemplate();
						}}
					>
						<DownloadIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						aria-label="Export customers"
						onClick={() => {
							void onExport();
						}}
					>
						<FileSpreadsheetIcon className="size-4" />
					</Button>
					<Button asChild>
						<Link href="/app/customers/create">
							<PlusIcon className="size-4" />
							Create Customer
						</Link>
					</Button>
				</div>
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
								<TableHead className="text-right">
									Actions
								</TableHead>
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
												<Skeleton className="ml-auto h-8 w-8 rounded-md" />
											</TableCell>
										</TableRow>
									))
								: customers.map((customer) => (
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
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
														<Button
															variant="ghost"
															size="icon"
															className="size-8"
														>
															<MoreVerticalIcon className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															asChild
														>
															<Link
																href={`/app/customers/${customer.id}`}
															>
																View
															</Link>
														</DropdownMenuItem>
														<DropdownMenuItem
															asChild
														>
															<Link
																href={`/app/customers/${customer.id}`}
															>
																Edit
															</Link>
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive focus:text-destructive"
															onClick={() =>
																handleDelete(
																	customer,
																)
															}
														>
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
							{!isLoading && customers.length === 0 && (
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

					{total > ITEMS_PER_PAGE && (
						<div className="border-t px-4 py-3">
							<Pagination
								totalItems={total}
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
