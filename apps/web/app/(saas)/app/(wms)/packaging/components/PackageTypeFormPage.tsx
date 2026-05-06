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

type PackageTypeFormMode = "create" | "edit";

const PACKAGE_TYPE_OPTIONS = [
	{ value: "box", label: "Box" },
	{ value: "envelope", label: "Envelope" },
	{ value: "tube", label: "Tube" },
	{ value: "pallet", label: "Pallet" },
];

const MOCK_PACKAGE_BY_ID: Record<
	string,
	{
		name: string;
		description: string;
		price: string;
		type: string;
		length: string;
		width: string;
		height: string;
		weight: string;
		applyToAllWarehouses: boolean;
	}
> = {
	pkg_small_box: {
		name: "Small Box",
		description: "General purpose corrugated box for light orders.",
		price: "0.00",
		type: "box",
		length: "10",
		width: "8",
		height: "4",
		weight: "1",
		applyToAllWarehouses: true,
	},
	pkg_poly_mailer: {
		name: "Poly Mailer 12x9",
		description: "Flexible mailer for soft goods and apparel shipments.",
		price: "0.00",
		type: "envelope",
		length: "12",
		width: "9",
		height: "1",
		weight: "1",
		applyToAllWarehouses: false,
	},
};

export function PackageTypeFormPage({
	mode,
	packageId,
}: {
	mode: PackageTypeFormMode;
	packageId?: string;
}) {
	const packageData = (mode === "edit" && packageId
		? MOCK_PACKAGE_BY_ID[packageId]
		: undefined) ?? {
		name: "",
		description: "",
		price: "0.00",
		type: "box",
		length: "1",
		width: "1",
		height: "1",
		weight: "1",
		applyToAllWarehouses: true,
	};

	const heading = mode === "edit" ? "Edit Package Type" : "Create Packaging";
	const submitLabel =
		mode === "edit" ? "Save Package Changes" : "Create Packaging";

	return (
		<div className="container mx-auto max-w-7xl space-y-6 py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">
					{heading}
				</h1>
				<div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center">
					<Label className="shrink-0 font-medium">
						Package Type:
					</Label>
					<Select defaultValue={packageData.type}>
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
					<Button>{submitLabel}</Button>
				</div>
			</div>

			<Card>
				<CardContent className="space-y-6 p-6">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_160px]">
						<div className="space-y-2">
							<Label htmlFor="package-name">Name *</Label>
							<Input
								id="package-name"
								defaultValue={packageData.name}
								placeholder="Small Box"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="package-price">Price *</Label>
							<div className="flex items-center gap-2 rounded-md border px-3">
								<span className="font-semibold text-xl">$</span>
								<Input
									id="package-price"
									defaultValue={packageData.price}
									className="border-0 px-0"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="package-description">Description</Label>
						<Textarea
							id="package-description"
							defaultValue={packageData.description}
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
							defaultChecked={packageData.applyToAllWarehouses}
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
								defaultValue={packageData.length}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="width">Width *</Label>
							<Input
								id="width"
								defaultValue={packageData.width}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="height">Height *</Label>
							<Input
								id="height"
								defaultValue={packageData.height}
							/>
						</div>
						<div className="space-y-2">
							<Label>Dimension Unit</Label>
							<Select defaultValue="in">
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
									defaultValue={packageData.weight}
								/>
								<Select defaultValue="lb">
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
