"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ImagePlusIcon,
	Loader2Icon,
	ScanBarcodeIcon,
	XIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ProductLifecycleFlow } from "../../components/product-lifecycle-flow";

const variantSchema = z.object({
	id: z.string().optional(),
	sku: z.string().trim().min(1, "SKU is required"),
	unitPrice: z.number().positive().optional(),
	length: z.number().positive().optional(),
	width: z.number().positive().optional(),
	height: z.number().positive().optional(),
	weight: z.number().positive().optional(),
	metadata: z.record(z.string(), z.string()).optional(),
});

const updateProductSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	description: z.string().optional(),
	isPerishable: z.boolean(),
	isBatchTracked: z.boolean(),
	isSerialTracked: z.boolean(),
	life: z.number().optional(),
	returnEnabled: z.boolean(),
	defaultReturnWindowDays: z.number().optional(),
	onReturn: z.string().optional(),
	deadStockValue: z.number().optional(),
	deadStockAction: z.string().optional(),
	options: z.array(
		z
			.object({
				id: z.string(),
				name: z.string().min(1, "Option name is required"),
			})
			.optional(),
	),
	variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

// Generates a simple unique id
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function EditProductPage() {
	const params = useParams();
	const productId = params.productId as string;
	const router = useRouter();
	const { organization } = useSession();
	const organizationId = organization?.id ?? null;

	const { data: product, isPending: isProductLoading } = useQuery({
		...orpc.products.get.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				id: productId,
			},
		}),
		enabled: Boolean(organizationId && productId),
	});

	const updateProductMutation = useMutation(
		orpc.products.update.mutationOptions(),
	);

	const form = useForm<UpdateProductFormValues>({
		resolver: zodResolver(updateProductSchema),
		defaultValues: {
			name: "",
			description: "",
			isPerishable: false,
			isBatchTracked: false,
			isSerialTracked: false,
			life: 0,
			returnEnabled: false,
			defaultReturnWindowDays: 30,
			onReturn: "RESTOCK",
			deadStockValue: undefined,
			deadStockAction: "REFURBISH",
			options: [],
			variants: [],
		},
	});

	const {
		fields: optionFields,
		append: appendOption,
		remove: removeOption,
		update: updateOption,
	} = useFieldArray({
		control: form.control,
		name: "options",
	});

	const {
		fields: variantFields,
		append: appendVariant,
		remove: removeVariant,
	} = useFieldArray({
		control: form.control,
		name: "variants",
	});

	const [hasInitialized, setHasInitialized] = useState(false);

	useEffect(() => {
		if (product && !hasInitialized) {
			const skus = product.skus || [];

			// Try to reverse-engineer options from metadata
			const optionNames = new Set<string>();
			skus.forEach((sku: any) => {
				if (sku.metadata) {
					Object.keys(sku.metadata).forEach((key) => {
						optionNames.add(key);
					});
				}
			});

			const options = Array.from(optionNames).map((name) => ({
				id: generateId(),
				name,
			}));

			form.reset({
				name: product.name,
				description: product.description || "",
				isPerishable: product.isPerishable,
				isBatchTracked: product.isBatchTracked,
				isSerialTracked: product.isSerialTracked,
				life: product.life ?? 0,
				returnEnabled: product.returnEnabled ?? false,
				defaultReturnWindowDays: product.defaultReturnWindowDays ?? 30,
				onReturn: product.onReturn ?? "RESTOCK",
				deadStockValue: product.deadStockValue
					? Number(product.deadStockValue)
					: undefined,
				deadStockAction: product.deadStockAction ?? "REFURBISH",
				options,
				variants: skus.map((sku: any) => {
					const metadataObj: Record<string, string> = {};
					if (sku.metadata) {
						options.forEach((opt) => {
							if (sku.metadata[opt.name]) {
								metadataObj[opt.id] = sku.metadata[opt.name];
							}
						});
					}

					return {
						id: sku.id,
						sku: sku.code,
						unitPrice: sku.unitPrice
							? Number(sku.unitPrice)
							: undefined,
						length: sku.length ? Number(sku.length) : undefined,
						width: sku.width ? Number(sku.width) : undefined,
						height: sku.height ? Number(sku.height) : undefined,
						weight: sku.weight ? Number(sku.weight) : undefined,
						metadata: metadataObj,
					};
				}),
			});

			if (skus.length === 0) {
				appendVariant({
					sku: "",
					metadata: {},
				});
			}

			setHasInitialized(true);
		}
	}, [product, hasInitialized, form, appendVariant]);

	const onSubmit = form.handleSubmit(async (values) => {
		console.log("test");
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		try {
			await updateProductMutation.mutateAsync({
				organizationId,
				id: productId,
				name: values.name,
				description: values.description,
				isPerishable: values.isPerishable,
				isBatchTracked: values.isBatchTracked,
				isSerialTracked: values.isSerialTracked,
				life: values.life,
				returnEnabled: values.returnEnabled,
				defaultReturnWindowDays: values.defaultReturnWindowDays,
				onReturn: values.onReturn as any,
				deadStockValue: values.deadStockValue,
				deadStockAction: values.deadStockAction as any,
				skus: values.variants.map((v: any) => {
					const metadataRecord: Record<string, string> = {};
					values.options.forEach((opt: any) => {
						const val = v.metadata?.[opt.id];
						if (val) {
							metadataRecord[opt.name] = val;
						}
					});

					return {
						id: v.id,
						code: v.sku,
						unitPrice: v.unitPrice,
						length: v.length,
						width: v.width,
						height: v.height,
						weight: v.weight,
						metadata: metadataRecord,
					};
				}),
			});
			toast.success("Product updated successfully.");
			router.push("/app/products");
			router.refresh();
		} catch {
			toast.error("Failed to update product.");
		}
	});

	if (isProductLoading) {
		return (
			<div className="flex h-[400px] w-full items-center justify-center">
				<Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-[1200px] space-y-6 py-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					Edit Product
				</h1>
			</div>

			<form onSubmit={onSubmit} className="flex flex-col gap-6">
				{/* Top Section */}
				<div className="p-6 border rounded-lg shadow-sm space-y-6 bg-card">
					<div className="grid gap-6">
						<div className="space-y-2">
							<p className="text-xs font-bold uppercase text-muted-foreground">
								Name<span className="text-destructive">*</span>
							</p>
							<Input {...form.register("name")} />
							{form.formState.errors.name && (
								<p className="text-xs text-destructive">
									{form.formState.errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<p className="text-xs font-bold uppercase text-muted-foreground">
								Description
							</p>
							<Input {...form.register("description")} />
							{form.formState.errors.description && (
								<p className="text-xs text-destructive">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Tracking & Lifecycle Section */}
				<div className="p-6 border rounded-lg shadow-sm space-y-6 bg-card">
					<div className="grid gap-6 sm:grid-cols-3">
						<Controller
							control={form.control}
							name="isPerishable"
							render={({ field }) => (
								<div className="flex flex-col gap-2">
									<label
										htmlFor="perishable"
										className="flex items-center gap-2 cursor-pointer"
									>
										<Checkbox
											name="perishable"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<span className="text-xs font-bold uppercase text-muted-foreground">
											Is Perishable
										</span>
									</label>
								</div>
							)}
						/>
						<Controller
							control={form.control}
							name="isBatchTracked"
							render={({ field }) => (
								<div className="flex flex-col gap-2">
									<label
										htmlFor="batch"
										className="flex items-center gap-2 cursor-pointer"
									>
										<Checkbox
											name="batch"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<span className="text-xs font-bold uppercase text-muted-foreground">
											Batch Tracked
										</span>
									</label>
								</div>
							)}
						/>
						<Controller
							control={form.control}
							name="isSerialTracked"
							render={({ field }) => (
								<div className="flex flex-col gap-2">
									<label
										htmlFor="serial"
										className="flex items-center gap-2 cursor-pointer"
									>
										<Checkbox
											name="serial"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<span className="text-xs font-bold uppercase text-muted-foreground">
											Serial Tracked
										</span>
									</label>
								</div>
							)}
						/>
					</div>

					{form.watch("isPerishable") && (
						<div className="space-y-2">
							<p className="text-xs font-bold uppercase text-muted-foreground">
								Life (Days)
							</p>
							<Input
								type="number"
								{...form.register("life", {
									valueAsNumber: true,
								})}
								placeholder="e.g. 30"
							/>
							{form.formState.errors.life && (
								<p className="text-xs text-destructive">
									{form.formState.errors.life.message}
								</p>
							)}
						</div>
					)}
				</div>

				{/* Returns & Dead Stock Section */}
				<div className="p-6 border rounded-lg shadow-sm space-y-6 bg-card">
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="space-y-6">
							<h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
								Returns Configuration
							</h3>
							<Controller
								control={form.control}
								name="returnEnabled"
								render={({ field }) => (
									<div className="flex items-center gap-2 cursor-pointer">
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<span className="text-xs font-bold uppercase text-muted-foreground">
											Enable Returns
										</span>
									</div>
								)}
							/>
							{form.watch("returnEnabled") && (
								<>
									<div className="space-y-2">
										<p className="text-xs font-bold uppercase text-muted-foreground">
											Default Return Window (Days)
										</p>
										<Input
											type="number"
											{...form.register(
												"defaultReturnWindowDays",
												{ valueAsNumber: true },
											)}
										/>
									</div>
									<div className="space-y-2">
										<p className="text-xs font-bold uppercase text-muted-foreground">
											On Return Action
										</p>
										<Controller
											control={form.control}
											name="onReturn"
											render={({ field }) => (
												<Select
													value={field.value}
													onValueChange={
														field.onChange
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select Action" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="RESTOCK">
															Restock
														</SelectItem>
														<SelectItem value="SCRAP">
															Scrap
														</SelectItem>
														<SelectItem value="REFURBISH">
															Refurbish
														</SelectItem>
														<SelectItem value="RETURN_TO_VENDOR">
															Return to Vendor
														</SelectItem>
														<SelectItem value="RETURN_TO_FACTORY">
															Return to Factory
														</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>
								</>
							)}
						</div>

						<div className="space-y-6">
							<h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
								Dead Stock Configuration
							</h3>
							{/* <div className="space-y-2">
								<p className="text-xs font-bold uppercase text-muted-foreground">
									Dead Stock Value Threshold
								</p>
								<Input
									type="number"
									step="0.01"
									{...form.register("deadStockValue", {
										valueAsNumber: true,
									})}
									placeholder="e.g. 10.00"
								/>
							</div> */}
							<div className="space-y-2">
								<p className="text-xs font-bold uppercase text-muted-foreground">
									Dead Stock Action
								</p>
								<Controller
									control={form.control}
									name="deadStockAction"
									render={({ field }) => (
										<Select
											value={field.value}
											onValueChange={field.onChange}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Action" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="SCRAP">
													Scrap
												</SelectItem>
												<SelectItem value="REFURBISH">
													Refurbish
												</SelectItem>
												<SelectItem value="RETURN_TO_VENDOR">
													Return to Vendor
												</SelectItem>
												<SelectItem value="RETURN_TO_FACTORY">
													Return to Factory
												</SelectItem>
											</SelectContent>
										</Select>
									)}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Variants Section */}
				<div className="border rounded-lg shadow-sm bg-card">
					<div className="p-4 border-b flex justify-between items-center">
						<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
							Variants
						</h3>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="text-xs text-primary border-primary/20 hover:bg-primary/10"
								onClick={() =>
									appendOption({
										id: generateId(),
										name: `Option ${optionFields.length + 1}`,
									})
								}
							>
								ADD OPTION
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="text-xs text-primary border-primary/20 hover:bg-primary/10"
								onClick={() =>
									appendVariant({
										sku: "",
									})
								}
							>
								ADD VARIANT
							</Button>
						</div>
					</div>

					<div className="overflow-x-auto p-4">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									{optionFields.map((opt, i) => (
										<TableHead
											key={opt.id}
											className="min-w-[150px]"
										>
											<div className="flex items-center gap-1 border rounded px-2 h-8 bg-muted/50">
												<input
													className="bg-transparent border-none outline-none text-xs w-full font-semibold uppercase text-muted-foreground focus:ring-0"
													value={opt.name}
													onChange={(e) =>
														updateOption(i, {
															...opt,
															name: e.target
																.value,
														})
													}
												/>
												<button
													type="button"
													onClick={() =>
														removeOption(i)
													}
												>
													<XIcon className="w-3 h-3 text-muted-foreground hover:text-foreground" />
												</button>
											</div>
										</TableHead>
									))}
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[150px] text-center">
										SKU
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[120px] text-center">
										Price
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[200px] text-center">
										Dimensions (L-W-H)
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[150px] text-center">
										Weight
									</TableHead>
									<TableHead className="w-[50px]" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{variantFields.map((v, vi) => (
									<TableRow
										key={v.id}
										className="hover:bg-transparent group"
									>
										{optionFields.map((opt) => (
											<TableCell
												key={opt.id}
												className="align-top py-3"
											>
												<Input
													{...form.register(
														`variants.${vi}.metadata.${opt.id}` as const,
													)}
													className="h-9"
													placeholder={opt.name}
												/>
											</TableCell>
										))}
										<TableCell className="align-top py-3">
											<Input
												{...form.register(
													`variants.${vi}.sku`,
												)}
												className={`h-9 ${form.formState.errors.variants?.[vi]?.sku ? "border-destructive" : ""}`}
											/>
											{form.formState.errors.variants?.[
												vi
											]?.sku && (
												<p className="text-[10px] text-destructive mt-1">
													SKU is required
												</p>
											)}
										</TableCell>
										<TableCell className="align-top py-3">
											<div className="relative">
												<Input
													{...form.register(
														`variants.${vi}.unitPrice`,
														{ valueAsNumber: true },
													)}
													className="h-9 pl-7 pr-6 text-right"
													placeholder="0.00"
													type="number"
													step="0.01"
												/>
											</div>
										</TableCell>
										<TableCell className="align-top py-3">
											<div className="flex items-center gap-2">
												<div className="relative flex-1">
													<Input
														{...form.register(
															`variants.${vi}.length`,
															{
																valueAsNumber: true,
															},
														)}
														className="h-9 pr-4 text-right"
														type="number"
													/>
												</div>
												<div className="relative flex-1">
													<Input
														{...form.register(
															`variants.${vi}.width`,
															{
																valueAsNumber: true,
															},
														)}
														className="h-9 pr-4 text-right"
														type="number"
													/>
												</div>
												<div className="relative flex-1">
													<Input
														{...form.register(
															`variants.${vi}.height`,
															{
																valueAsNumber: true,
															},
														)}
														className="h-9 pr-4 text-right"
														type="number"
													/>
												</div>
											</div>
										</TableCell>
										<TableCell className="align-top py-3">
											<div className="flex items-center gap-2">
												<div className="relative flex-1">
													<Input
														{...form.register(
															`variants.${vi}.weight`,
															{
																valueAsNumber: true,
															},
														)}
														className="h-9 pr-4 text-right"
														type="number"
													/>
												</div>
											</div>
										</TableCell>
										<TableCell className="align-top py-3">
											<div className="flex flex-col gap-1 items-center">
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="h-8 w-8 text-primary border-primary/20 bg-primary/5"
												>
													<ScanBarcodeIcon className="h-4 w-4" />
												</Button>
												{variantFields.length > 1 && (
													<button
														type="button"
														onClick={() =>
															removeVariant(vi)
														}
														className="text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
													>
														Remove
													</button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* Lifecycle Flow Visualization */}
				<div className="border rounded-lg shadow-sm bg-card p-6 space-y-4">
					<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						Product Lifecycle Preview
					</h3>
					<ProductLifecycleFlow
						returnEnabled={form.watch("returnEnabled")}
						onReturn={form.watch("onReturn")}
						deadStockAction={form.watch("deadStockAction")}
					/>
				</div>

				{/* Product Image Section */}
				<div className="border rounded-lg shadow-sm bg-card">
					<div className="p-4 border-b flex justify-between items-center">
						<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
							Product Image
						</h3>
						<div className="flex items-center gap-2 border rounded-md p-1 pl-3 bg-muted/30 text-xs">
							<span className="text-muted-foreground">
								Choose a file
							</span>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7 text-primary border-primary/20 bg-transparent"
							>
								BROWSE
							</Button>
						</div>
					</div>
					<div className="p-6">
						<div className="border border-dashed rounded-lg h-32 w-32 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
							<ImagePlusIcon className="w-6 h-6 mb-2" />
							<span className="text-[10px] font-bold uppercase">
								+ Add Image
							</span>
						</div>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="flex justify-end gap-3 pb-8">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={
							updateProductMutation.isPending || !organizationId
						}
						className="min-w-[120px]"
					>
						{updateProductMutation.isPending && (
							<Loader2Icon className="mr-2 size-4 animate-spin" />
						)}
						Save Changes
					</Button>
				</div>
			</form>
		</div>
	);
}
