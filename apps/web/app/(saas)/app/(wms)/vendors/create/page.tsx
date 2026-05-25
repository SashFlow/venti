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
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { buildVendorMetadata, deriveSupplierCode } from "../lib/vendor-utils";
import { useVendorsContext } from "../lib/vendors-context";

type VendorAddress = {
	address1: string;
	address2: string;
	city: string;
	country: string;
	state: string;
	zip: string;
};

type CreateVendorInput = {
	name: string;
	prefix: string;
	email: string;
	phone: string;
	communicationPreference: string;
	representativeName: string;
	accountNumber: string;
	notes: string;
	brands: string;
	shipping: VendorAddress;
	billing: VendorAddress | null;
};

const COMMUNICATION_OPTIONS = [
	{ value: "none", label: "None" },
	{ value: "email", label: "Email" },
	{ value: "phone", label: "Phone" },
	{ value: "both", label: "Email and Phone" },
];

function AddressFields({
	prefix,
	address,
	onChange,
}: {
	prefix: string;
	address: VendorAddress;
	onChange: (patch: Partial<VendorAddress>) => void;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<div className="space-y-1.5">
				<Label htmlFor={`${prefix}-address-1`}>
					Address <span className="text-destructive">*</span>
				</Label>
				<Input
					id={`${prefix}-address-1`}
					value={address.address1}
					onChange={(event) =>
						onChange({ address1: event.target.value })
					}
					required
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${prefix}-address-2`}>Address Line 2</Label>
				<Input
					id={`${prefix}-address-2`}
					value={address.address2}
					onChange={(event) =>
						onChange({ address2: event.target.value })
					}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${prefix}-city`}>
					City <span className="text-destructive">*</span>
				</Label>
				<Input
					id={`${prefix}-city`}
					value={address.city}
					onChange={(event) => onChange({ city: event.target.value })}
					required
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${prefix}-country`}>Country</Label>
				<Input
					id={`${prefix}-country`}
					placeholder="e.g. United States"
					value={address.country}
					onChange={(event) =>
						onChange({ country: event.target.value })
					}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${prefix}-state`}>State</Label>
				<Input
					id={`${prefix}-state`}
					placeholder="e.g. California"
					value={address.state}
					onChange={(event) =>
						onChange({ state: event.target.value })
					}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${prefix}-zip`}>
					Zip <span className="text-destructive">*</span>
				</Label>
				<Input
					id={`${prefix}-zip`}
					value={address.zip}
					onChange={(event) => onChange({ zip: event.target.value })}
					required
				/>
			</div>
		</div>
	);
}

export default function CreateVendorPage() {
	const router = useRouter();
	const { organizationId, invalidateVendors } = useVendorsContext();
	const createSupplierMutation = useMutation(
		orpc.masterData.suppliers.create.mutationOptions(),
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [sameAsShipping, setSameAsShipping] = useState(true);

	const [name, setName] = useState("");
	const [prefix, setPrefix] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [communicationPreference, setCommunicationPreference] =
		useState("none");
	const [representativeName, setRepresentativeName] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [notes, setNotes] = useState("");
	const [brands, setBrands] = useState("");

	const [shippingAddress, setShippingAddress] = useState<VendorAddress>({
		address1: "",
		address2: "",
		city: "",
		country: "",
		state: "",
		zip: "",
	});

	const [billingAddress, setBillingAddress] = useState<VendorAddress>({
		address1: "",
		address2: "",
		city: "",
		country: "",
		state: "",
		zip: "",
	});

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		if (!name.trim() || !email.trim()) {
			toast.error("Vendor name and email are required.");
			return;
		}

		setIsSubmitting(true);
		try {
			const payload: CreateVendorInput = {
				name,
				prefix,
				email,
				phone,
				communicationPreference,
				representativeName,
				accountNumber,
				notes,
				brands,
				shipping: shippingAddress,
				billing: sameAsShipping ? null : billingAddress,
			};

			const createPromise = createSupplierMutation.mutateAsync({
				organizationId,
				name: payload.name.trim(),
				code: deriveSupplierCode(payload.name, payload.prefix),
				email: payload.email.trim(),
				phone: payload.phone.trim() || undefined,
				metadata: buildVendorMetadata({
					accountNumber: payload.accountNumber,
					representativeName: payload.representativeName,
					communicationPreference: payload.communicationPreference,
					notes: payload.notes,
					brands: payload.brands,
					address1: payload.shipping.address1,
					address2: payload.shipping.address2,
					city: payload.shipping.city,
					state: payload.shipping.state,
					zip: payload.shipping.zip,
					country: payload.shipping.country,
				}),
			});

			await toast.promise(createPromise, {
				loading: "Creating vendor...",
				success: "Vendor created.",
				error: "Failed to create vendor.",
			});

			const result = await createPromise;

			await invalidateVendors();
			router.push(`/app/vendors/${result.supplier.id}`);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="container py-8 max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/app/vendors">
							<ArrowLeftIcon className="size-4" />
						</Link>
					</Button>
					<h1 className="text-3xl font-semibold tracking-tight">
						Create Vendor
					</h1>
				</div>
				<Button
					type="submit"
					form="create-vendor-form"
					disabled={!name.trim() || !email.trim() || isSubmitting}
				>
					Create Vendor
				</Button>
			</div>

			<form
				id="create-vendor-form"
				onSubmit={handleSubmit}
				className="space-y-4"
			>
				<Card className="rounded-2xl border">
					<CardContent className="space-y-5 p-4 md:p-6">
						<div className="grid gap-4 md:grid-cols-[1fr_180px]">
							<div className="space-y-1.5">
								<Label htmlFor="vendor-name">
									Vendor name{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									id="vendor-name"
									value={name}
									onChange={(event) =>
										setName(event.target.value)
									}
									required
								/>
							</div>
							<div className="space-y-1.5">
								<Label
									htmlFor="vendor-prefix"
									className="flex items-center gap-1"
								>
									Prefix*{" "}
									<InfoIcon className="size-3.5 text-muted-foreground" />
								</Label>
								<Input
									id="vendor-prefix"
									value={prefix}
									onChange={(event) =>
										setPrefix(event.target.value)
									}
									maxLength={3}
								/>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="vendor-email">
									Email{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									id="vendor-email"
									type="email"
									placeholder="Add Email"
									value={email}
									onChange={(event) =>
										setEmail(event.target.value)
									}
									required
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="vendor-phone">Phone</Label>
								<Input
									id="vendor-phone"
									type="tel"
									placeholder="+1 123-456-7890"
									value={phone}
									onChange={(event) =>
										setPhone(event.target.value)
									}
								/>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							<div className="space-y-1.5">
								<Label
									htmlFor="vendor-communication"
									className="flex items-center gap-1"
								>
									Communication Preference
									<InfoIcon className="size-3.5 text-muted-foreground" />
								</Label>
								<Select
									value={communicationPreference}
									onValueChange={(value) =>
										setCommunicationPreference(
											value ?? "none",
										)
									}
								>
									<SelectTrigger
										id="vendor-communication"
										className="w-full"
									>
										<SelectValue placeholder="Select preference">
											{COMMUNICATION_OPTIONS.find(
												(o) =>
													o.value ===
													communicationPreference,
											)?.label ?? "Select preference"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{COMMUNICATION_OPTIONS.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="vendor-rep">
									Representative Name
								</Label>
								<Input
									id="vendor-rep"
									value={representativeName}
									onChange={(event) =>
										setRepresentativeName(
											event.target.value,
										)
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="vendor-account">
									Account #
								</Label>
								<Input
									id="vendor-account"
									value={accountNumber}
									onChange={(event) =>
										setAccountNumber(event.target.value)
									}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="vendor-notes">Notes</Label>
							<textarea
								id="vendor-notes"
								className="flex min-h-[108px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
								value={notes}
								onChange={(event) =>
									setNotes(event.target.value)
								}
							/>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="vendor-brands"
								className="flex items-center gap-1"
							>
								Brands{" "}
								<InfoIcon className="size-3.5 text-muted-foreground" />
							</Label>
							<Input
								id="vendor-brands"
								placeholder="Add Brand"
								value={brands}
								onChange={(event) =>
									setBrands(event.target.value)
								}
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border">
					<CardHeader className="py-4 border-b">
						<CardTitle className="text-sm font-semibold uppercase tracking-wider">
							Shipping Location
						</CardTitle>
					</CardHeader>
					<CardContent className="p-4 md:p-6">
						<AddressFields
							prefix="shipping"
							address={shippingAddress}
							onChange={(patch) =>
								setShippingAddress((current) => ({
									...current,
									...patch,
								}))
							}
						/>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border">
					<CardHeader className="flex-row items-center justify-between py-4 border-b space-y-0">
						<CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-1">
							Billing Location{" "}
							<InfoIcon className="size-3.5 text-muted-foreground" />
						</CardTitle>
						<div className="flex items-center gap-2">
							<Label
								htmlFor="same-as-shipping"
								className="text-sm text-muted-foreground"
							>
								Same as shipping
							</Label>
							<Switch
								id="same-as-shipping"
								checked={sameAsShipping}
								onCheckedChange={setSameAsShipping}
							/>
						</div>
					</CardHeader>
					{!sameAsShipping && (
						<CardContent className="p-4 md:p-6">
							<AddressFields
								prefix="billing"
								address={billingAddress}
								onChange={(patch) =>
									setBillingAddress((current) => ({
										...current,
										...patch,
									}))
								}
							/>
						</CardContent>
					)}
				</Card>
			</form>
		</div>
	);
}
