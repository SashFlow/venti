"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useSession } from "@saas/auth/hooks/use-session";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateWarehousePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { organization } = useSession();

	const createWarehouseMutation = useMutation(
		orpc.warehouse.create.mutationOptions(),
	);

	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [timezone, setTimezone] = useState("UTC");
	const [sameReturn, setSameReturn] = useState(true);

	const [address, setAddress] = useState({
		line1: "",
		line2: "",
		city: "",
		state: "",
		zip: "",
		country: "",
	});

	const [returnAddress, setReturnAddress] = useState({
		line1: "",
		line2: "",
		city: "",
		state: "",
		zip: "",
		country: "",
	});
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

		if (
			!address.line1 ||
			!address.city ||
			!address.state ||
			!address.zip ||
			!address.country
		) {
			toast.error(
				"All main address fields (except line 2) are required.",
			);
			return;
		}

		if (
			!sameReturn &&
			(!returnAddress.line1 ||
				!returnAddress.city ||
				!returnAddress.state ||
				!returnAddress.zip ||
				!returnAddress.country)
		) {
			toast.error(
				"All return address fields (except line 2) are required when not using main address.",
			);
			return;
		}

		try {
			const createPromise = createWarehouseMutation.mutateAsync({
				organizationId,
				name: name.trim(),
				code: code.trim(),
				timezone: timezone.trim() || undefined,
				sameReturn,
				address,
				returnAddress: sameReturn ? undefined : returnAddress,
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
							<Label htmlFor="address-line1">
								Address Line 1{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="address-line1"
								value={address.line1}
								onChange={(e) =>
									setAddress({
										...address,
										line1: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="space-y-1.5 md:col-span-2">
							<Label htmlFor="address-line2">
								Address Line 2
							</Label>
							<Input
								id="address-line2"
								value={address.line2}
								onChange={(e) =>
									setAddress({
										...address,
										line2: e.target.value,
									})
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="address-city">
								City <span className="text-destructive">*</span>
							</Label>
							<Input
								id="address-city"
								value={address.city}
								onChange={(e) =>
									setAddress({
										...address,
										city: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="address-state">
								State / Province{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="address-state"
								value={address.state}
								onChange={(e) =>
									setAddress({
										...address,
										state: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="address-zip">
								Zip / Postal Code{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="address-zip"
								value={address.zip}
								onChange={(e) =>
									setAddress({
										...address,
										zip: e.target.value,
									})
								}
								required
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="address-country">
								Country{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id="address-country"
								value={address.country}
								onChange={(e) =>
									setAddress({
										...address,
										country: e.target.value,
									})
								}
								required
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="border">
					<CardHeader>
						<CardTitle>Return Address</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="same-return"
								checked={sameReturn}
								onCheckedChange={(checked) =>
									setSameReturn(checked as boolean)
								}
							/>
							<Label htmlFor="same-return">
								Same as Main Address
							</Label>
						</div>

						{!sameReturn && (
							<div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t">
								<div className="space-y-1.5 md:col-span-2">
									<Label htmlFor="return-line1">
										Address Line 1{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										id="return-line1"
										value={returnAddress.line1}
										onChange={(e) =>
											setReturnAddress({
												...returnAddress,
												line1: e.target.value,
											})
										}
										required={!sameReturn}
									/>
								</div>
								<div className="space-y-1.5 md:col-span-2">
									<Label htmlFor="return-line2">
										Address Line 2
									</Label>
									<Input
										id="return-line2"
										value={returnAddress.line2}
										onChange={(e) =>
											setReturnAddress({
												...returnAddress,
												line2: e.target.value,
											})
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="return-city">
										City{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										id="return-city"
										value={returnAddress.city}
										onChange={(e) =>
											setReturnAddress({
												...returnAddress,
												city: e.target.value,
											})
										}
										required={!sameReturn}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="return-state">
										State / Province{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										id="return-state"
										value={returnAddress.state}
										onChange={(e) =>
											setReturnAddress({
												...returnAddress,
												state: e.target.value,
											})
										}
										required={!sameReturn}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="return-zip">
										Zip / Postal Code{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										id="return-zip"
										value={returnAddress.zip}
										onChange={(e) =>
											setReturnAddress({
												...returnAddress,
												zip: e.target.value,
											})
										}
										required={!sameReturn}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="return-country">
										Country{" "}
										<span className="text-destructive">
											*
										</span>
									</Label>
									<Input
										id="return-country"
										value={returnAddress.country}
										onChange={(e) =>
											setReturnAddress({
												...returnAddress,
												country: e.target.value,
											})
										}
										required={!sameReturn}
									/>
								</div>
							</div>
						)}
					</CardContent>
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
