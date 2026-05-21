"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { TabsContent } from "@repo/ui/tabs";
import { Textarea } from "@repo/ui/textarea";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	Loader2Icon,
	Trash2Icon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export type ImportField = {
	column: string;
	description: string;
	required: boolean;
};

export type SKURow = {
	id: string;
	name: string;
	skuCode: string;
	lifecycle: string;
};

type SkuTabContentProps = {
	skus: SKURow[];
	isLoading: boolean;
	search: string;
	onSearchChange: (value: string) => void;
	onDelete: (sku: SKURow) => void;
	onCreateClick: () => void;
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

const createSKUSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(255),
	description: z.string().trim().optional(),
	skuCode: z.string().trim().min(1, "SKU code is required").max(100),
	lengthMm: z.preprocess(
		(v) =>
			v === "" || v === undefined || (typeof v === "number" && isNaN(v))
				? undefined
				: Number(v),
		z.number().positive().optional(),
	),
	widthMm: z.preprocess(
		(v) =>
			v === "" || v === undefined || (typeof v === "number" && isNaN(v))
				? undefined
				: Number(v),
		z.number().positive().optional(),
	),
	heightMm: z.preprocess(
		(v) =>
			v === "" || v === undefined || (typeof v === "number" && isNaN(v))
				? undefined
				: Number(v),
		z.number().positive().optional(),
	),
});

type CreateSKUFormValues = z.infer<typeof createSKUSchema>;

type InventoryTabContentProps = {
	organizationId: string | null;
	onSuccess: () => void;
};

export function SkuTabContent({
	skus,
	isLoading,
	search,
	onSearchChange,
	onDelete,
	onCreateClick,
	page,
	totalPages,
	onPageChange,
}: SkuTabContentProps) {
	return (
		<TabsContent value="sku" className="space-y-4">
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">Product Variants</CardTitle>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							...
						</Button>
						<Button size="sm" onClick={onCreateClick}>
							Create Product
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="grid gap-3 md:grid-cols-2">
						<Input
							placeholder="Search"
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
						<Input placeholder="Status" disabled />
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading && (
								<TableRow>
									<TableCell colSpan={4} className="h-14">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Loader2Icon className="size-4 animate-spin" />
											Loading SKUs...
										</div>
									</TableCell>
								</TableRow>
							)}
							{!isLoading && skus.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={4}
										className="h-14 text-muted-foreground"
									>
										No SKUs found.
									</TableCell>
								</TableRow>
							)}
							{skus.map((sku) => (
								<TableRow key={sku.id}>
									<TableCell className="font-medium underline underline-offset-2">
										{sku.name}
									</TableCell>
									<TableCell>{sku.skuCode}</TableCell>
									<TableCell className="text-sm">
										<span className="rounded-full bg-green-100 px-2.5 py-0.5 text-green-800">
											{sku.lifecycle}
										</span>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(sku)}
											aria-label={`Delete ${sku.name}`}
										>
											<Trash2Icon className="size-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t pt-3">
						<p className="text-sm text-muted-foreground">
							Page {page} of {totalPages}
						</p>
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="icon"
								onClick={() => onPageChange(page - 1)}
								disabled={page <= 1}
								aria-label="Previous page"
							>
								<ChevronLeftIcon className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => onPageChange(page + 1)}
								disabled={page >= totalPages}
								aria-label="Next page"
							>
								<ChevronRightIcon className="size-4" />
							</Button>
						</div>
					</div>
				)}
			</Card>
		</TabsContent>
	);
}

export function InventoryTabContent({
	organizationId,
	onSuccess,
}: InventoryTabContentProps) {
	const createSKUMutation = useMutation(
		orpc.products.create.mutationOptions(),
	);

	const form = useForm<CreateSKUFormValues>({
		resolver: zodResolver(createSKUSchema),
		defaultValues: {
			name: "",
			description: "",
			skuCode: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}
		try {
			await createSKUMutation.mutateAsync({
				organizationId,
				name: values.name,
				description: values.description || undefined,
				skuCode: values.skuCode,
				lengthMm: values.lengthMm,
				widthMm: values.widthMm,
				heightMm: values.heightMm,
			});
			toast.success("Product created successfully.");
			form.reset();
			onSuccess();
		} catch {
			toast.error("Failed to create product.");
		}
	});

	return (
		<TabsContent value="inventory" className="space-y-4">
			<form onSubmit={onSubmit} className="space-y-4">
				<Card className="border">
					<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
						<CardTitle className="text-xl">
							Create Product
						</CardTitle>
						<Button
							type="submit"
							size="sm"
							disabled={
								createSKUMutation.isPending || !organizationId
							}
						>
							{createSKUMutation.isPending ? (
								<>
									<Loader2Icon className="mr-2 size-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create Product"
							)}
						</Button>
					</CardHeader>
					<CardContent className="space-y-6 p-4">
						<div className="space-y-2">
							<p className="text-sm font-medium">Name*</p>
							<Input {...form.register("name")} />
							{form.formState.errors.name && (
								<p className="text-sm text-destructive">
									{form.formState.errors.name.message}
								</p>
							)}
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<p className="text-sm font-medium">Tags</p>
								<Input placeholder="Product Tag" disabled />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">
									Description
								</p>
								<Input {...form.register("description")} />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border">
					<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
						<CardTitle className="text-sm font-semibold uppercase tracking-wider">
							Variants
						</CardTitle>
						<Button variant="outline" size="sm" type="button">
							Add Option
						</Button>
					</CardHeader>
					<CardContent className="p-4">
						<div className="grid gap-3 md:grid-cols-[1fr_0.8fr_1fr_1fr_1fr_auto]">
							<Input
								placeholder="SKU"
								{...form.register("skuCode")}
							/>
							<Input placeholder="$ 9.99" disabled />
							<Input
								placeholder="Length (mm)"
								type="number"
								min={0}
								{...form.register("lengthMm", {
									valueAsNumber: true,
								})}
							/>
							<Input
								placeholder="Width (mm)"
								type="number"
								min={0}
								{...form.register("widthMm", {
									valueAsNumber: true,
								})}
							/>
							<Input
								placeholder="Height (mm)"
								type="number"
								min={0}
								{...form.register("heightMm", {
									valueAsNumber: true,
								})}
							/>
							<Button variant="outline" size="icon" type="button">
								+
							</Button>
						</div>
						{form.formState.errors.skuCode && (
							<p className="mt-1 text-sm text-destructive">
								{form.formState.errors.skuCode.message}
							</p>
						)}
					</CardContent>
				</Card>

				<Card className="border">
					<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
						<CardTitle className="text-sm font-semibold uppercase tracking-wider">
							Product Image
						</CardTitle>
						<Button variant="outline" size="sm" type="button">
							Browse
						</Button>
					</CardHeader>
					<CardContent className="p-4">
						<div className="flex h-36 w-36 items-center justify-center rounded-md border border-dashed text-sm font-medium text-muted-foreground">
							+ Add Image
						</div>
					</CardContent>
				</Card>
			</form>
		</TabsContent>
	);
}

export function LotsTabContent() {
	return (
		<TabsContent value="lots" className="space-y-4">
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">Lots</CardTitle>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							Lot Classifications
						</Button>
						<Button variant="outline" size="sm">
							Notification Settings
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="grid gap-3 md:grid-cols-3">
						<Input placeholder="Filter: All" />
						<Input placeholder="In Stock" />
						<Input placeholder="Page 1" />
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Expiration</TableHead>
								<TableHead>Items</TableHead>
								<TableHead className="text-right">
									Total Qty
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell
									className="text-muted-foreground"
									colSpan={4}
								>
									No lots found.
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">
						Lot Classifications
					</CardTitle>
					<Button size="sm">Create</Button>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
						Lot classifications define expiration day ranges (e.g.
						0-30, 31-180) that can be targeted during batch picking.
					</div>

					<div className="mx-auto max-w-2xl rounded-lg border p-4">
						<div className="mb-4 flex items-center justify-between">
							<p className="text-sm font-semibold uppercase">
								Create Lot Classification
							</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									Cancel
								</Button>
								<Button size="sm">Create</Button>
							</div>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2 md:col-span-2">
								<p className="text-sm font-medium">Name*</p>
								<Input placeholder="e.g. Class A" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">Min Days*</p>
								<Input type="number" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium">Max Days*</p>
								<Input type="number" />
							</div>
							<div className="space-y-2 md:col-span-2">
								<p className="text-sm font-medium">Color</p>
								<div className="grid grid-cols-[44px_1fr] gap-2">
									<Input
										type="color"
										defaultValue="#000000"
									/>
									<Input defaultValue="#000000" />
								</div>
							</div>
							<div className="space-y-2 md:col-span-2">
								<p className="text-sm font-medium">
									Order Tags
								</p>
								<Input placeholder="Add tag" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

export function BundlesTabContent() {
	return (
		<TabsContent value="bundles" className="space-y-4">
			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-xl">Create Kit</CardTitle>
					<Button size="sm" disabled>
						Create
					</Button>
				</CardHeader>
				<CardContent className="space-y-4 p-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">Name</p>
						<Input />
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium">Description</p>
						<Textarea rows={3} />
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Kit Input
					</CardTitle>
					<Button size="sm" variant="outline">
						Add Item
					</Button>
				</CardHeader>
				<CardContent className="space-y-3 p-4">
					<div className="rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-destructive">
						Must have at least one input
					</div>
					<div className="grid gap-3 md:grid-cols-[1fr_120px]">
						<Input defaultValue="Chappal" />
						<Input type="number" defaultValue="1" />
					</div>
				</CardContent>
			</Card>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Kit Output
					</CardTitle>
					<Button size="sm" variant="outline">
						Add Item
					</Button>
				</CardHeader>
				<CardContent className="space-y-3 p-4">
					<div className="rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-destructive">
						Must have at least one output
					</div>
					<div className="grid gap-3 md:grid-cols-[1fr_120px]">
						<Input defaultValue="Chappal" />
						<Input type="number" defaultValue="1" />
					</div>
				</CardContent>
			</Card>
		</TabsContent>
	);
}

type ImportsTabContentProps = {
	importFields: ImportField[];
};

export function ImportsTabContent({ importFields }: ImportsTabContentProps) {
	return (
		<TabsContent value="imports" className="space-y-4">
			<div className="rounded-xl border-2 border-dashed px-6 py-12 text-center">
				<p className="text-3xl font-semibold tracking-tight">
					Drop a CSV, Excel, or JSON file here
				</p>
				<p className="my-4 text-sm font-semibold text-muted-foreground">
					OR
				</p>
				<Button variant="outline">Browse Files</Button>
			</div>

			<Card className="border">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3">
					<CardTitle className="text-sm font-semibold uppercase tracking-wider">
						Import Fields
					</CardTitle>
					<Button variant="outline" size="sm">
						Template
					</Button>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-40">Column</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="w-24 text-right">
									Required
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{importFields.map((field) => (
								<TableRow key={field.column}>
									<TableCell className="font-medium">
										{field.column}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{field.description}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end">
											<span
												className={`inline-flex h-5 w-5 rounded-full border ${
													field.required
														? "border-primary bg-primary"
														: "border-input"
												}`}
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
