"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import { Textarea } from "@repo/ui/textarea";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type AddressForm = {
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	zip: string;
	country: string;
};

const EMPTY_ADDRESS: AddressForm = {
	addressLine1: "",
	addressLine2: "",
	city: "",
	state: "",
	zip: "",
	country: "",
};

function hasAddressValue(address: AddressForm) {
	return (
		address.addressLine1.trim().length > 0 ||
		address.addressLine2.trim().length > 0 ||
		address.city.trim().length > 0 ||
		address.state.trim().length > 0 ||
		address.zip.trim().length > 0 ||
		address.country.trim().length > 0
	);
}

function normalizeAddress(address: AddressForm) {
	if (!hasAddressValue(address)) {
		return undefined;
	}

	return {
		addressLine1: address.addressLine1.trim() || undefined,
		addressLine2: address.addressLine2.trim() || undefined,
		city: address.city.trim() || undefined,
		state: address.state.trim() || undefined,
		zip: address.zip.trim() || undefined,
		country: address.country.trim() || undefined,
	};
}

export default function CreateWarehousePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { organization } = useSession();

	const createWarehouseMutation = useMutation(
		orpc.warehouse.create.mutationOptions(),
	);

	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [description, setDescription] = useState("");
	const [timezone, setTimezone] = useState("UTC");
	const [mainAddress, setMainAddress] = useState<AddressForm>(EMPTY_ADDRESS);
	const [hasDifferentReturnAddress, setHasDifferentReturnAddress] =
		useState(false);
	const [returnAddress, setReturnAddress] =
		useState<AddressForm>(EMPTY_ADDRESS);

	const isSubmitting = createWarehouseMutation.isPending;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const organizationId = organization?.id;
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		if (!name.trim() || !code.trim()) {
			toast.error("Warehouse name and code are required.");
			return;
		}

		try {
			const createPromise = createWarehouseMutation.mutateAsync({
				organizationId,
				name: name.trim(),
				code: code.trim(),
				description: description.trim() || undefined,
				timezone: timezone.trim() || undefined,
				address: normalizeAddress(mainAddress),
				returnAddress: hasDifferentReturnAddress
					? normalizeAddress(returnAddress)
					: null,
			});

			await toast.promise(createPromise, {
				loading: "Creating warehouse...",
				success: "Warehouse created.",
				error: "Failed to create warehouse.",
			});

			const result = await createPromise;

			await queryClient.invalidateQueries({
				queryKey: orpc.warehouse.list.key(),
			});

			router.push(`/app/warehouse/${result.warehouse.id}`);
		} catch {
			// toast.promise handles messaging
		}
	};

	return (
		<div className="container mx-auto max-w-5xl space-y-6 py-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/app/warehouse" aria-label="Back to warehouses">
						<ArrowLeftIcon className="size-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Create Warehouse
					</h1>
					<p className="text-sm text-muted-foreground">
						Set up the warehouse profile and address details.
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="border">
					<CardHeader>
						<CardTitle>Warehouse Profile</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="warehouse-name">
								Warehouse Name{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="warehouse-name"
								value={name}
								onChange={(event) =>
									setName(event.target.value)
								}
								placeholder="Main Distribution Center"
								required
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="warehouse-code">
								Warehouse Code{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="warehouse-code"
								value={code}
								onChange={(event) =>
									setCode(event.target.value.toUpperCase())
								}
								placeholder="WH-NYC-01"
								required
							/>
						</div>
						<div className="space-y-1.5 md:col-span-2">
							<Label htmlFor="warehouse-description">
								Description
							</Label>
							<Textarea
								id="warehouse-description"
								value={description}
								onChange={(event) =>
									setDescription(event.target.value)
								}
								placeholder="Optional warehouse description"
								rows={3}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="warehouse-timezone">Timezone</Label>
							<Input
								id="warehouse-timezone"
								value={timezone}
								onChange={(event) =>
									setTimezone(event.target.value)
								}
								placeholder="UTC"
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="border">
					<CardHeader>
						<CardTitle>Main Address</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1.5 md:col-span-2">
							<Label htmlFor="main-address-line1">
								Address Line 1
							</Label>
							<Input
								id="main-address-line1"
								value={mainAddress.addressLine1}
								onChange={(event) =>
									setMainAddress((previous) => ({
										...previous,
										addressLine1: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-1.5 md:col-span-2">
							<Label htmlFor="main-address-line2">
								Address Line 2
							</Label>
							<Input
								id="main-address-line2"
								value={mainAddress.addressLine2}
								onChange={(event) =>
									setMainAddress((previous) => ({
										...previous,
										addressLine2: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="main-city">City</Label>
							<Input
								id="main-city"
								value={mainAddress.city}
								onChange={(event) =>
									setMainAddress((previous) => ({
										...previous,
										city: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="main-state">State</Label>
							<Input
								id="main-state"
								value={mainAddress.state}
								onChange={(event) =>
									setMainAddress((previous) => ({
										...previous,
										state: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="main-zip">Zip</Label>
							<Input
								id="main-zip"
								value={mainAddress.zip}
								onChange={(event) =>
									setMainAddress((previous) => ({
										...previous,
										zip: event.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="main-country">Country</Label>
							<Input
								id="main-country"
								value={mainAddress.country}
								onChange={(event) =>
									setMainAddress((previous) => ({
										...previous,
										country: event.target.value,
									}))
								}
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="border">
					<CardHeader>
						<div className="flex items-center justify-between gap-3">
							<CardTitle>Return Address</CardTitle>
							<div className="flex items-center gap-2">
								<Label htmlFor="different-return-address">
									Use a different return address
								</Label>
								<Switch
									id="different-return-address"
									checked={hasDifferentReturnAddress}
									onCheckedChange={
										setHasDifferentReturnAddress
									}
								/>
							</div>
						</div>
					</CardHeader>
					{hasDifferentReturnAddress ? (
						<CardContent className="grid gap-4 md:grid-cols-2">
							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="return-address-line1">
									Address Line 1
								</Label>
								<Input
									id="return-address-line1"
									value={returnAddress.addressLine1}
									onChange={(event) =>
										setReturnAddress((previous) => ({
											...previous,
											addressLine1: event.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="return-address-line2">
									Address Line 2
								</Label>
								<Input
									id="return-address-line2"
									value={returnAddress.addressLine2}
									onChange={(event) =>
										setReturnAddress((previous) => ({
											...previous,
											addressLine2: event.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="return-city">City</Label>
								<Input
									id="return-city"
									value={returnAddress.city}
									onChange={(event) =>
										setReturnAddress((previous) => ({
											...previous,
											city: event.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="return-state">State</Label>
								<Input
									id="return-state"
									value={returnAddress.state}
									onChange={(event) =>
										setReturnAddress((previous) => ({
											...previous,
											state: event.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="return-zip">Zip</Label>
								<Input
									id="return-zip"
									value={returnAddress.zip}
									onChange={(event) =>
										setReturnAddress((previous) => ({
											...previous,
											zip: event.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="return-country">Country</Label>
								<Input
									id="return-country"
									value={returnAddress.country}
									onChange={(event) =>
										setReturnAddress((previous) => ({
											...previous,
											country: event.target.value,
										}))
									}
								/>
							</div>
						</CardContent>
					) : null}
				</Card>

				<div className="flex items-center justify-end gap-2">
					<Button variant="outline" asChild>
						<Link href="/app/warehouse">Cancel</Link>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Warehouse"}
					</Button>
				</div>
			</form>
		</div>
	);
}
