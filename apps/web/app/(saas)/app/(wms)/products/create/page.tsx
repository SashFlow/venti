"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Switch } from "@repo/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Textarea } from "@repo/ui/textarea";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ImagePlusIcon,
	Loader2Icon,
	ScanBarcodeIcon,
	XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const optionalNumber = z.preprocess(
	(v) =>
		v === "" || v === undefined || (typeof v === "number" && isNaN(v))
			? undefined
			: Number(v),
	z.number().positive().optional(),
);

const variantSchema = z.object({
	id: z.string(),
	sku: z.string().trim().min(1, "SKU is required"),
	name: z.string().trim().min(1, "SKU Name is required"),
	barcode: z.string().optional(),
	baseUomId: z.string().min(1, "UOM is required"),
	price: optionalNumber,
	length: optionalNumber,
	width: optionalNumber,
	height: optionalNumber,
	weight: optionalNumber,
	weightUnit: z.string().default("LB"),
	optionValues: z.record(z.string(), z.string()).optional(),
});

const createProductSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	code: z.string().trim().min(1, "Product code is required"),
	description: z.string().optional(),
	isPerishable: z.boolean().default(false),
	life: optionalNumber,
	isBatchTracked: z.boolean().default(false),
	isSerialTracked: z.boolean().default(false),
	options: z.array(
		z.object({
			id: z.string(),
			name: z.string().min(1, "Option name is required"),
		}),
	),
	variants: z.array(variantSchema).min(1, "At least one variant is required"),
});

const createProductFormSchema = createProductSchema.refine(
	(data) => {
		if (data.isPerishable && !data.life) {
			return false;
		}
		return true;
	},
	{
		message: "Shelf life in days is required for perishable products",
		path: ["life"],
	},
);

type CreateProductFormValues = z.infer<typeof createProductSchema>;

// Generates a simple unique id
const generateId = () => Math.random().toString(36).substring(2, 9);
// Generates a 13-digit mock barcode
const generateBarcode = () =>
	Math.floor(Math.random() * 10000000000000)
		.toString()
		.padStart(13, "0");

export default function CreateProductPage() {
	const router = useRouter();
	const { organization } = useSession();
	const organizationId = organization?.id ?? null;
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [imagePreview, setImagePreview] = React.useState<string | null>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const createProductMutation = useMutation(
		orpc.products.create.mutationOptions(),
	);
	const { data: uomsData } = useQuery(
		orpc.masterData.uoms.list.queryOptions(),
	);

	const form = useForm<CreateProductFormValues>({
		resolver: zodResolver(createProductFormSchema),
		defaultValues: {
			name: "",
			code: "",
			description: "",
			isPerishable: false,
			life: undefined,
			isBatchTracked: false,
			isSerialTracked: false,
			options: [{ id: generateId(), name: "Option 1" }],
			variants: [
				{
					id: generateId(),
					sku: "",
					name: "",
					barcode: generateBarcode(),
					optionValues: {},
					weightUnit: "LB",
					price: undefined,
					length: undefined,
					width: undefined,
					height: undefined,
					weight: undefined,
				},
			],
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

	const onSubmit = form.handleSubmit(async (values) => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		try {
			await createProductMutation.mutateAsync({
				organizationId,
				name: values.name,
				code: values.code,
				description: values.description,
				isPerishable: values.isPerishable,
				life: values.life,
				isBatchTracked: values.isBatchTracked,
				isSerialTracked: values.isSerialTracked,
				skus: values.variants.map((v: any) => {
					// Map local optionValues to metadata using the option names as keys
					const metadataRecord: Record<string, string> = {};
					values.options.forEach((opt: any) => {
						const val = v.optionValues?.[opt.id];
						if (val) {
							metadataRecord[opt.name] = val;
						}
					});

					return {
						code: v.sku,
						name: v.name,
						barcode: v.barcode,
						baseUomId: v.baseUomId,
						price: v.price,
						length: v.length,
						width: v.width,
						height: v.height,
						weight: v.weight,
						metadata: metadataRecord,
					};
				}),
			});
			toast.success("Product created successfully.");
			router.push("/app/products");
			router.refresh();
		} catch (error) {
			toast.error("Failed to create product.");
		}
	});

	return (
		<div className="container mx-auto max-w-[1200px] space-y-6 py-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					Create Product
				</h1>
			</div>

			<form onSubmit={onSubmit} className="flex flex-col gap-6">
				{/* Top Section */}
				<div className="p-6 border rounded-lg shadow-sm space-y-6 bg-card">
					<div className="grid gap-6 md:grid-cols-2">
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
								Product Code
								<span className="text-destructive">*</span>
							</p>
							<Input {...form.register("code")} />
							{form.formState.errors.code && (
								<p className="text-xs text-destructive">
									{form.formState.errors.code.message}
								</p>
							)}
						</div>
						<div className="space-y-2 md:col-span-2">
							<p className="text-xs font-bold uppercase text-muted-foreground">
								Description
							</p>
							<Textarea
								{...form.register("description")}
								placeholder="Optional product description"
							/>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-3 pt-4 border-t">
						<div className="flex flex-col gap-4">
							<div className="flex items-center justify-between space-x-2">
								<div className="flex flex-col space-y-1">
									<p className="text-xs font-bold uppercase text-muted-foreground">
										Perishable
									</p>
									<p className="text-[10px] text-muted-foreground">
										Track expiration dates
									</p>
								</div>
								<Switch
									checked={form.watch("isPerishable")}
									onCheckedChange={(val) => {
										form.setValue("isPerishable", val);
										if (!val) {
											form.setValue("life", undefined);
											form.clearErrors("life");
										}
									}}
								/>
							</div>
							{form.watch("isPerishable") && (
								<div className="space-y-2">
									<p className="text-xs font-bold uppercase text-muted-foreground">
										Shelf Life (Days)
										<span className="text-destructive">
											*
										</span>
									</p>
									<Input
										{...form.register("life")}
										type="number"
										placeholder="e.g. 30"
										className={
											form.formState.errors.life
												? "border-destructive"
												: ""
										}
									/>
									{form.formState.errors.life && (
										<p className="text-xs text-destructive">
											{form.formState.errors.life.message}
										</p>
									)}
								</div>
							)}
						</div>
						<div className="flex items-start justify-between space-x-2">
							<div className="flex flex-col space-y-1">
								<p className="text-xs font-bold uppercase text-muted-foreground">
									Batch Tracked
								</p>
								<p className="text-[10px] text-muted-foreground">
									Require batch number
								</p>
							</div>
							<Switch
								checked={form.watch("isBatchTracked")}
								onCheckedChange={(val) =>
									form.setValue("isBatchTracked", val)
								}
							/>
						</div>
						<div className="flex items-start justify-between space-x-2">
							<div className="flex flex-col space-y-1">
								<p className="text-xs font-bold uppercase text-muted-foreground">
									Serial Tracked
								</p>
								<p className="text-[10px] text-muted-foreground">
									Require serial number
								</p>
							</div>
							<Switch
								checked={form.watch("isSerialTracked")}
								onCheckedChange={(val) =>
									form.setValue("isSerialTracked", val)
								}
							/>
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
										id: generateId(),
										sku: "",
										name: "",
										barcode: generateBarcode(),
										baseUomId: "",
										optionValues: {},
										weightUnit: "LB",
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
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[150px]">
										SKU
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[150px]">
										Name
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[120px]">
										Price
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[200px]">
										Dimensions (L-W-H)
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[150px]">
										Weight
									</TableHead>
									<TableHead className="text-xs font-bold uppercase text-muted-foreground min-w-[150px]">
										UOM
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
														`variants.${vi}.optionValues.${opt.id}` as const,
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
											<Input
												{...form.register(
													`variants.${vi}.name`,
												)}
												className={`h-9 ${form.formState.errors.variants?.[vi]?.name ? "border-destructive" : ""}`}
											/>
											{form.formState.errors.variants?.[
												vi
											]?.name && (
												<p className="text-[10px] text-destructive mt-1">
													Name required
												</p>
											)}
										</TableCell>
										<TableCell className="align-top py-3">
											<div className="relative">
												<Input
													{...form.register(
														`variants.${vi}.price`,
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
														)}
														className="h-9 pr-4 text-right"
														type="number"
													/>
												</div>
												<div className="relative flex-1">
													<Input
														{...form.register(
															`variants.${vi}.width`,
														)}
														className="h-9 pr-4 text-right"
														type="number"
													/>
												</div>
												<div className="relative flex-1">
													<Input
														{...form.register(
															`variants.${vi}.height`,
														)}
														className="h-9 pr-4 text-right"
														type="number"
													/>
												</div>
											</div>
										</TableCell>
										<TableCell className="align-top py-3">
											<div className="relative flex-1">
												<Input
													{...form.register(
														`variants.${vi}.weight`,
													)}
													className="h-9 pr-4 text-right"
													type="number"
												/>
											</div>
										</TableCell>
										<TableCell className="align-top py-3">
											<Select
												value={
													form.watch(
														`variants.${vi}.baseUomId`,
													) || ("" as any)
												}
												onValueChange={(val: any) =>
													form.setValue(
														`variants.${vi}.baseUomId`,
														val,
													)
												}
											>
												<SelectTrigger
													className={`h-9 ${form.formState.errors.variants?.[vi]?.baseUomId ? "border-destructive" : ""}`}
												>
													<SelectValue>
														{(() => {
															const selected =
																uomsData?.find(
																	(
																		uom: any,
																	) =>
																		uom.id ===
																		form.watch(
																			`variants.${vi}.baseUomId`,
																		),
																);
															return selected
																? `${selected.name} (${selected.code})`
																: "UOM";
														})()}
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{uomsData?.map(
														(uom: any) => (
															<SelectItem
																key={uom.id}
																value={uom.id}
															>
																{uom.name} (
																{uom.code})
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
											{form.formState.errors.variants?.[
												vi
											]?.baseUomId && (
												<p className="text-[10px] text-destructive mt-1">
													UOM required
												</p>
											)}
										</TableCell>
										<TableCell className="align-top py-3">
											<div className="flex flex-col gap-1 items-center">
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="h-8 w-8 text-primary border-primary/20 bg-primary/5"
													onClick={() =>
														form.setValue(
															`variants.${vi}.barcode`,
															generateBarcode(),
														)
													}
													title="Regenerate Barcode"
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
							<input
								type="file"
								accept="image/*"
								className="hidden"
								ref={fileInputRef}
								onChange={handleImageChange}
							/>
							<Button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								variant="outline"
								size="sm"
								className="h-7 text-primary border-primary/20 bg-transparent"
							>
								BROWSE
							</Button>
						</div>
					</div>
					<div className="p-6">
						{imagePreview ? (
							<div className="border rounded-lg h-32 w-32 relative overflow-hidden group">
								<img
									src={imagePreview}
									alt="Preview"
									className="object-cover w-full h-full"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={() => {
											setImagePreview(null);
											if (fileInputRef.current)
												fileInputRef.current.value = "";
										}}
									>
										Remove
									</Button>
								</div>
							</div>
						) : (
							<div
								onClick={() => fileInputRef.current?.click()}
								className="border border-dashed rounded-lg h-32 w-32 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
							>
								<ImagePlusIcon className="w-6 h-6 mb-2" />
								<span className="text-[10px] font-bold uppercase">
									+ Add Image
								</span>
							</div>
						)}
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
							createProductMutation.isPending || !organizationId
						}
						className="min-w-[120px]"
					>
						{createProductMutation.isPending && (
							<Loader2Icon className="mr-2 size-4 animate-spin" />
						)}
						Save Product
					</Button>
				</div>
			</form>
		</div>
	);
}
