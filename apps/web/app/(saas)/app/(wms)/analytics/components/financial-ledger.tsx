"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@repo/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { orpc } from "@shared/lib/orpc-query-utils";
import { DollarSign } from "lucide-react";

export function FinancialLedger({
	organizationId,
}: {
	organizationId: string;
}) {
	const { data, isLoading } = orpc.analytics.getCostLedger.useQuery({
		organizationId,
		limit: 10,
	});

	const getBadgeVariant = (type: string) => {
		if (
			type === "PURCHASE" ||
			type === "FREIGHT" ||
			type === "HOLDING_COST"
		)
			return "destructive";
		if (type === "COGS") return "default";
		if (type === "INVENTORY_GAIN" || type === "RTV_CREDIT")
			return "outline";
		return "secondary";
	};

	const formatCurrency = (amount: any) => {
		const val = typeof amount === "string" ? parseFloat(amount) : amount;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(val);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<DollarSign className="w-5 h-5 text-green-500" />
					Capital & Cost Ledger
				</CardTitle>
				<CardDescription>
					Real-time transactional breakdown of Landed Costs, Holding
					Costs, and COGS.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="border rounded-md">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Warehouse</TableHead>
								<TableHead className="text-right">
									Amount
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center py-8"
									>
										Loading ledger data...
									</TableCell>
								</TableRow>
							) : data?.entries.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center py-8 text-muted-foreground"
									>
										No ledger entries found.
									</TableCell>
								</TableRow>
							) : (
								data?.entries.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell className="font-medium">
											{new Date(
												entry.createdAt,
											).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													getBadgeVariant(
														entry.type,
													) as any
												}
											>
												{entry.type}
											</Badge>
										</TableCell>
										<TableCell>
											{entry.warehouseId}
										</TableCell>
										<TableCell
											className={`text-right font-mono ${getBadgeVariant(entry.type) === "destructive" ? "text-red-500" : "text-green-500"}`}
										>
											{getBadgeVariant(entry.type) ===
											"destructive"
												? "-"
												: "+"}
											{formatCurrency(entry.amount)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
