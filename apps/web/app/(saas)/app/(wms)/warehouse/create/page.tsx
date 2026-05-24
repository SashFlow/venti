"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
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
				timezone: timezone.trim() || undefined,
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
