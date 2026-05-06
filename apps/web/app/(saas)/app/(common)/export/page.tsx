"use client";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import {
	ChevronLeft,
	ChevronRight,
	Ellipsis,
	MoveRight,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExportPage() {
	const router = useRouter();
	return (
		<div className="mx-auto w-full max-w-7xl space-y-8 py-8">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-4xl font-semibold tracking-tight">
					Export
				</h1>

				<Button
					className="h-12 rounded-xl px-7 text-sm tracking-wide"
					onClick={() => router.push("/app/export/create")}
				>
					CREATE
				</Button>
			</div>

			<section className="space-y-8 rounded-2xl border bg-card p-6 shadow-xs">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="relative w-full lg:max-w-5xl">
						<Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
						<Input
							aria-label="Filter exports"
							placeholder="Filter"
							className="h-14 rounded-2xl border-muted bg-muted/30 pl-13 text-lg"
						/>
					</div>

					<div className="flex items-center gap-3 self-end lg:self-auto">
						<div className="flex overflow-hidden rounded-xl border">
							<Button
								variant="ghost"
								size="icon"
								className="h-12 w-12 rounded-none border-r"
							>
								<ChevronLeft className="size-5" />
							</Button>
							<div className="flex h-12 min-w-16 items-center justify-center border-r px-4 text-m font-semibold">
								1
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-12 w-12 rounded-none"
							>
								<ChevronRight className="size-5" />
							</Button>
						</div>

						<Button
							variant="outline"
							size="icon"
							className="h-12 w-12 rounded-xl"
						>
							<Ellipsis className="size-5" />
						</Button>
					</div>
				</div>

				<div className="rounded-xl border bg-background">
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Type
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Created
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Completed
								</TableHead>
								<TableHead className="h-14 px-6 text-sm font-semibold tracking-wide uppercase">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={4}
									className="h-72 p-6 text-center align-middle"
								>
									<div className="space-y-4">
										<h2 className="text-xl font-semibold tracking-tight">
											No exports yet...Create one to get
											data
										</h2>
										<Link
											href="#"
											className="text-foreground inline-flex items-center gap-3 text-l font-semibold"
										>
											View Different Report Types
											<MoveRight className="text-primary size-7" />
										</Link>
									</div>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					<Link
						href="#"
						className="group flex min-h-30 items-center justify-between rounded-2xl border bg-card px-10 py-8 text-xl font-semibold tracking-tight shadow-xs transition-colors hover:bg-muted/20"
					>
						<span>Create a New Export</span>
						<MoveRight className="text-primary size-9 transition-transform group-hover:translate-x-1" />
					</Link>

					<Link
						href="#"
						className="group flex min-h-30 items-center justify-between rounded-2xl border bg-card px-10 py-8 text-xl font-semibold tracking-tight shadow-xs transition-colors hover:bg-muted/20"
					>
						<span>Learn About Reports</span>
						<MoveRight className="text-primary size-9 transition-transform group-hover:translate-x-1" />
					</Link>
				</div>
			</section>
		</div>
	);
}
