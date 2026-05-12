"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ExternalLinkIcon,
	Loader2Icon,
	PlusIcon,
	SearchIcon,
	Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { usePackagingContext } from "./lib/packaging-context";

const ITEMS_PER_PAGE = 20;

type PackagingRow = {
	id: string;
	name: string;
	type: string;
	dimensions: string;
	carrier: string;
};

function formatDimensions(params: {
	length: string;
	width: string;
	height: string;
	unit: string;
}) {
	return `${params.length} x ${params.width} x ${params.height} ${params.unit}`;
}

export default function PackagingPage() {
	const { confirm } = useConfirmationAlert();
	const {
		organizationId,
		search,
		setSearch,
		page,
		setPage,
		invalidatePackaging,
	} = usePackagingContext();

	const { data, isPending } = useQuery({
		...orpc.packaging.list.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				query: search.trim() || undefined,
				limit: ITEMS_PER_PAGE,
				offset: (page - 1) * ITEMS_PER_PAGE,
			},
		}),
		enabled: Boolean(organizationId),
	});

	const deletePackageMutation = useMutation(
		orpc.packaging.delete.mutationOptions(),
	);

	const packages = useMemo<PackagingRow[]>(() => {
		return (data?.packageTypes ?? []).map((pkg) => {
			const metadata =
				pkg.metadata && typeof pkg.metadata === "object"
					? (pkg.metadata as Record<string, unknown>)
					: {};

			return {
				id: pkg.id,
				name: pkg.name,
				type: pkg.packageType,
				dimensions: formatDimensions({
					length: pkg.length.toString(),
					width: pkg.width.toString(),
					height: pkg.height.toString(),
					unit: pkg.dimensionUnit.toUpperCase(),
				}),
				carrier:
					typeof metadata.carrier === "string" &&
					metadata.carrier.length > 0
						? metadata.carrier
						: "All Carriers",
			};
		});
	}, [data?.packageTypes]);

	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, setPage, totalPages]);

	const onDelete = (pkg: PackagingRow) => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		confirm({
			title: "Delete package type",
			message: `Delete ${pkg.name}? This action cannot be undone.`,
			destructive: true,
			onConfirm: async () => {
				await deletePackageMutation.mutateAsync({
					organizationId,
					id: pkg.id,
				});

				await invalidatePackaging();
				toast.success("Package type deleted.");
			},
		});
	};

	return (
		<div className="container mx-auto max-w-7xl space-y-8 py-8">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-semibold tracking-tight">
					Packaging
				</h1>
				<div className="flex items-center gap-2">
					<Button asChild>
						<Link href="/app/packaging/create">
							<PlusIcon className="mr-2 size-4" />
							Create
						</Link>
					</Button>
				</div>
			</div>

			<Card>
				<CardContent className="space-y-4 p-4">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div className="relative w-full md:max-w-md">
							<SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Filter"
								className="pl-9"
								aria-label="Filter packages"
								value={search}
								onChange={(event) => {
									setSearch(event.target.value);
									setPage(1);
								}}
							/>
						</div>

						<div className="flex items-center gap-2 self-end md:self-auto">
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									setPage((current) =>
										Math.max(1, current - 1),
									)
								}
								disabled={page <= 1}
							>
								<ChevronLeftIcon className="size-4" />
							</Button>
							<div className="flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium">
								{page}
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									setPage((current) => current + 1)
								}
								disabled={page >= totalPages}
							>
								<ChevronRightIcon className="size-4" />
							</Button>
						</div>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Dimensions</TableHead>
								<TableHead>Package Type</TableHead>
								<TableHead>Carrier</TableHead>
								<TableHead className="w-[80px] text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending && (
								<TableRow>
									<TableCell colSpan={5} className="h-14">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Loader2Icon className="size-4 animate-spin" />
											Loading packaging...
										</div>
									</TableCell>
								</TableRow>
							)}
							{packages.map((pkg) => (
								<TableRow key={pkg.id}>
									<TableCell className="font-medium">
										<Link
											href={`/app/packaging/${pkg.id}`}
											className="hover:underline"
										>
											{pkg.name}
										</Link>
									</TableCell>
									<TableCell>{pkg.dimensions}</TableCell>
									<TableCell>{pkg.type}</TableCell>
									<TableCell>{pkg.carrier}</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1">
											<Button
												asChild
												variant="ghost"
												size="sm"
											>
												<Link
													href={`/app/packaging/${pkg.id}`}
												>
													Edit
												</Link>
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => onDelete(pkg)}
												aria-label={`Delete ${pkg.name}`}
											>
												<Trash2Icon className="size-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
							{!isPending && packages.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-14 text-muted-foreground"
									>
										No packaging found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<section className="space-y-5">
				<div className="space-y-2 text-center">
					<h2 className="text-balance font-semibold text-3xl tracking-tight">
						Add packaging to ship orders
					</h2>
					<Link
						href="#"
						className="inline-flex items-center gap-2 font-medium text-primary text-sm"
					>
						View Packaging Guide
						<ExternalLinkIcon className="size-4" />
					</Link>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Button
						asChild
						variant="outline"
						className="h-16 justify-between px-5 text-base"
					>
						<Link href="/app/packaging/create">
							Create Packaging
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="h-16 justify-between px-5 text-base"
					>
						<Link href="/app/packaging/create?type=carrier-specific">
							Get Carrier Specific Packaging
						</Link>
					</Button>
				</div>

				<div className="overflow-hidden rounded-xl border bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
					<p className="text-sm uppercase tracking-[0.16em] text-sky-300">
						Shipping Spotlight
					</p>
					<h3 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
						Multi-box shipping with fewer errors.
					</h3>
					<p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
						Group package types by product profile and carrier rules
						so packing stations can select the right carton quickly.
					</p>
				</div>
			</section>
		</div>
	);
}
