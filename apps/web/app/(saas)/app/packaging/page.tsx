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
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ExternalLinkIcon,
	MoreHorizontalIcon,
	PlusIcon,
	SearchIcon,
} from "lucide-react";
import Link from "next/link";

const PACKAGES = [
	{
		id: "pkg_small_box",
		name: "Small Box",
		dimensions: "10 x 8 x 4 in",
		type: "Box",
		carrier: "All Carriers",
	},
	{
		id: "pkg_poly_mailer",
		name: "Poly Mailer 12x9",
		dimensions: "12 x 9 x 1 in",
		type: "Envelope",
		carrier: "UPS, FedEx",
	},
	{
		id: "pkg_tube_large",
		name: "Poster Tube",
		dimensions: "24 x 3 x 3 in",
		type: "Tube",
		carrier: "DHL",
	},
];

export default function PackagingPage() {
	return (
		<div className="container mx-auto max-w-7xl space-y-8 py-8">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-semibold tracking-tight">
					Packaging
				</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" aria-label="Actions">
						<MoreHorizontalIcon className="size-4" />
					</Button>
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
							/>
						</div>

						<div className="flex items-center gap-2 self-end md:self-auto">
							<Button variant="outline" size="icon" disabled>
								<ChevronLeftIcon className="size-4" />
							</Button>
							<div className="flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium">
								1
							</div>
							<Button variant="outline" size="icon" disabled>
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
							{PACKAGES.map((pkg) => (
								<TableRow key={pkg.id}>
									<TableCell className="font-medium">
										{pkg.name}
									</TableCell>
									<TableCell>{pkg.dimensions}</TableCell>
									<TableCell>{pkg.type}</TableCell>
									<TableCell>{pkg.carrier}</TableCell>
									<TableCell className="text-right">
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
									</TableCell>
								</TableRow>
							))}
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
