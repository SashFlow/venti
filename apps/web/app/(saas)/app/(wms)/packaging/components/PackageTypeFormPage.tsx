"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Switch } from "@repo/ui/switch";
import { Textarea } from "@repo/ui/textarea";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePackagingContext } from "../lib/packaging-context";

type PackageTypeFormMode = "create" | "edit";

const PACKAGE_TYPE_OPTIONS = [
	{ value: "box", label: "Box" },
	{ value: "envelope", label: "Envelope" },
	{ value: "tube", label: "Tube" },
	{ value: "pallet", label: "Pallet" },
];

type PackageFormState = {
	name: string;
	description: string;
	price: string;
	type: string;
	length: string;
	width: string;
	height: string;
	weight: string;
	dimensionUnit: "in" | "cm";
	weightUnit: "lb" | "kg";
	applyToAllWarehouses: boolean;
};

const EMPTY_STATE: PackageFormState = {
	name: "",
	description: "",
	price: "0.00",
	type: "box",
	length: "1",
	width: "1",
	height: "1",
	weight: "1",
	dimensionUnit: "in",
	weightUnit: "lb",
	applyToAllWarehouses: true,
};

function toPositiveNumber(value: string, fallback: number) {
	const parsed = Number.parseFloat(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}

	return parsed;
}

function toNonNegativeNumber(value: string, fallback: number) {
	const parsed = Number.parseFloat(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return fallback;
	}

	return parsed;
}

export function PackageTypeFormPage({
	mode,
	packageId,
}: {
	mode: PackageTypeFormMode;
	packageId?: string;
}) {
	const router = useRouter();
	const { confirm } = useConfirmationAlert();
	const { organizationId, invalidatePackaging } = usePackagingContext();
	const [form, setForm] = useState<PackageFormState>(EMPTY_STATE);

	const { data, isPending: isLoadingPackage } = useQuery({
		...orpc.packaging.get.queryOptions({
			input: {
				organizationId: organizationId ?? "",
				id: packageId ?? "",
			},
		}),
		enabled: mode === "edit" && Boolean(organizationId && packageId),
	});

	const createPackageMutation = useMutation(
		orpc.packaging.create.mutationOptions(),
	);
	const updatePackageMutation = useMutation(
		orpc.packaging.update.mutationOptions(),
	);
	const deletePackageMutation = useMutation(
		orpc.packaging.delete.mutationOptions(),
	);

	useEffect(() => {
		const packageType = data?.packageType;
		if (!packageType) {
			return;
		}

		setForm({
			name: packageType.name,
			description: packageType.description ?? "",
			price: packageType.price.toString(),
			type: packageType.packageType,
			length: packageType.length.toString(),
			width: packageType.width.toString(),
			height: packageType.height.toString(),
			weight: packageType.weight.toString(),
			dimensionUnit: packageType.dimensionUnit === "cm" ? "cm" : "in",
			weightUnit: packageType.weightUnit === "kg" ? "kg" : "lb",
			applyToAllWarehouses: packageType.applyToAllWarehouses,
		});
	}, [data?.packageType]);

	const heading = mode === "edit" ? "Edit Package Type" : "Create Packaging";
	const submitLabel =
		mode === "edit" ? "Save Package Changes" : "Create Packaging";

	const isSubmitting =
		createPackageMutation.isPending || updatePackageMutation.isPending;

	const onSubmit = async () => {
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		if (!form.name.trim()) {
			toast.error("Package name is required.");
			return;
		}

		const payload = {
			organizationId,
			name: form.name.trim(),
			description: form.description.trim() || undefined,
			packageType: form.type,
			price: toNonNegativeNumber(form.price, 0),
			length: toPositiveNumber(form.length, 1),
			width: toPositiveNumber(form.width, 1),
			height: toPositiveNumber(form.height, 1),
			weight: toPositiveNumber(form.weight, 1),
			dimensionUnit: form.dimensionUnit,
			weightUnit: form.weightUnit,
			applyToAllWarehouses: form.applyToAllWarehouses,
		};

		if (mode === "edit" && packageId) {
			await toast.promise(
				updatePackageMutation.mutateAsync({
					id: packageId,
					...payload,
				}),
				{
					loading: "Updating package type...",
					success: "Package type updated.",
					error: "Failed to update package type.",
				},
			);
		} else {
			await toast.promise(createPackageMutation.mutateAsync(payload), {
				loading: "Creating package type...",
				success: "Package type created.",
				error: "Failed to create package type.",
			});
		}

		await invalidatePackaging();
		router.push("/app/packaging");
	};

	const onDelete = () => {
		if (!organizationId || !packageId) {
			return;
		}

		confirm({
			title: "Delete package type",
			message: "This action cannot be undone.",
			destructive: true,
			onConfirm: async () => {
				await deletePackageMutation.mutateAsync({
					organizationId,
					id: packageId,
				});

				await invalidatePackaging();
				toast.success("Package type deleted.");
				router.push("/app/packaging");
			},
		});
	};

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			{isLoadingPackage && mode === "edit" && (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2Icon className="size-4 animate-spin" />
					Loading package type...
				</div>
			)}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					{heading}
				</h1>
				<div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center">
					<Label className="shrink-0 font-medium">
						Package Type:
					</Label>
					<Select
						value={form.type}
						onValueChange={(value) => {
							if (!value) {
								return;
							}

							setForm((current) => ({
								...current,
								type: value,
							}));
						}}
					>
						<SelectTrigger className="w-full sm:w-52">
							<SelectValue placeholder="Select package type" />
						</SelectTrigger>
						<SelectContent>
							{PACKAGE_TYPE_OPTIONS.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{mode === "edit" && (
						<Button
							variant="outline"
							size="icon"
							onClick={onDelete}
							aria-label="Delete package type"
						>
							<Trash2Icon className="size-4" />
						</Button>
					)}
					<Button
						onClick={() => void onSubmit()}
						disabled={isSubmitting}
					>
						{submitLabel}
					</Button>
				</div>
			</div>

			<Card>
				<CardContent className="space-y-6 p-6">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_160px]">
						<div className="space-y-2">
							<Label htmlFor="package-name">Name *</Label>
							<Input
								id="package-name"
								value={form.name}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										name: event.target.value,
									}))
								}
								placeholder="Small Box"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="package-price">Price *</Label>
							<div className="flex items-center gap-2 rounded-md border px-3">
								<span className="font-semibold text-xl">$</span>
								<Input
									id="package-price"
									value={form.price}
									onChange={(event) =>
										setForm((current) => ({
											...current,
											price: event.target.value,
										}))
									}
									className="border-0 px-0"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="package-description">Description</Label>
						<Textarea
							id="package-description"
							value={form.description}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									description: event.target.value,
								}))
							}
							placeholder="Optional notes for packers"
							className="min-h-36"
						/>
					</div>

					<div className="flex items-center justify-between rounded-md border px-4 py-3">
						<Label
							htmlFor="apply-warehouses"
							className="font-medium"
						>
							Add as an option to all warehouses
						</Label>
						<Switch
							id="apply-warehouses"
							checked={form.applyToAllWarehouses}
							onCheckedChange={(checked) =>
								setForm((current) => ({
									...current,
									applyToAllWarehouses: checked,
								}))
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b">
					<CardTitle className="text-lg tracking-wide uppercase">
						Dimensions
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 p-6">
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
						<div className="space-y-2">
							<Label htmlFor="length">Length *</Label>
							<Input
								id="length"
								value={form.length}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										length: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="width">Width *</Label>
							<Input
								id="width"
								value={form.width}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										width: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="height">Height *</Label>
							<Input
								id="height"
								value={form.height}
								onChange={(event) =>
									setForm((current) => ({
										...current,
										height: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Dimension Unit</Label>
							<Select
								value={form.dimensionUnit}
								onValueChange={(value) => {
									if (value !== "in" && value !== "cm") {
										return;
									}

									setForm((current) => ({
										...current,
										dimensionUnit: value,
									}));
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Unit" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="in">IN</SelectItem>
									<SelectItem value="cm">CM</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="weight">Weight *</Label>
							<div className="flex gap-2">
								<Input
									id="weight"
									value={form.weight}
									onChange={(event) =>
										setForm((current) => ({
											...current,
											weight: event.target.value,
										}))
									}
								/>
								<Select
									value={form.weightUnit}
									onValueChange={(value) => {
										if (value !== "lb" && value !== "kg") {
											return;
										}

										setForm((current) => ({
											...current,
											weightUnit: value,
										}));
									}}
								>
									<SelectTrigger className="w-24">
										<SelectValue placeholder="Unit" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="lb">LB</SelectItem>
										<SelectItem value="kg">KG</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
