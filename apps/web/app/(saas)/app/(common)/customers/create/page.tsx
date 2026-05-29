"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCustomersContext } from "../lib/customers-context";

type CreateCustomerInput = {
	name: string;
	email: string;
	phone: string;
	notes: string;
	isWholesaler: boolean;
};

export default function CreateCustomerPage() {
	const router = useRouter();
	const { organizationId, invalidateCustomers } = useCustomersContext();
	const createCustomerMutation = useMutation(
		orpc.customers.create.mutationOptions(),
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [notes, setNotes] = useState("");
	const [isWholesaler, setIsWholesaler] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!organizationId) {
			toast.error("No active organization selected.");
			return;
		}

		if (!name.trim()) {
			return;
		}
		setIsSubmitting(true);
		try {
			const payload: CreateCustomerInput = {
				name,
				email,
				phone,
				notes,
				isWholesaler,
			};

			const createPromise = createCustomerMutation.mutateAsync({
				organizationId,
				name: payload.name.trim(),
				email: payload.email.trim() || undefined,
				phone: payload.phone.trim() || undefined,
				notes: payload.notes.trim() || undefined,
				isWholesaler: payload.isWholesaler,
			});

			await toast.promise(createPromise, {
				loading: "Creating customer…",
				success: "Customer created.",
				error: "Failed to create customer.",
			});

			const result = await createPromise;
			await invalidateCustomers();
			router.push(`/app/customers/${result.customer.id}`);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="container py-8 max-w-3xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/app/customers">
							<ArrowLeftIcon className="size-4" />
						</Link>
					</Button>
					<h1 className="text-2xl font-semibold tracking-tight">
						Create Customer
					</h1>
				</div>
				<Button
					type="submit"
					form="create-customer-form"
					disabled={!name.trim() || isSubmitting}
				>
					Create Customer
				</Button>
			</div>

			<Card className="rounded-2xl border">
				<CardContent className="pt-6 space-y-5">
					<form
						id="create-customer-form"
						onSubmit={handleSubmit}
						className="space-y-5"
					>
						<div className="space-y-1.5">
							<Label htmlFor="customer-name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="customer-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<Label htmlFor="customer-email">Email</Label>
								<Input
									id="customer-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="customer-phone">Phone</Label>
								<Input
									id="customer-phone"
									type="tel"
									placeholder="+1 123-456-7890"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="customer-notes">Notes</Label>
							<textarea
								id="customer-notes"
								className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							/>
						</div>

						<div className="flex items-center gap-3 pt-1">
							<Checkbox
								id="customer-wholesaler"
								checked={isWholesaler}
								onCheckedChange={(checked) =>
									setIsWholesaler(checked === true)
								}
							/>
							<Label
								htmlFor="customer-wholesaler"
								className="cursor-pointer"
							>
								Customer is a wholesaler
							</Label>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
