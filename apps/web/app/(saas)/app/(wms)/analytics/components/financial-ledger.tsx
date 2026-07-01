"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
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
import {
	OrgCurrencyProvider,
	useOrgCurrency,
} from "@saas/organizations/hooks/use-org-currency";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";

function FinancialLedgerContent({
	organizationId,
}: {
	organizationId: string;
}) {
	const { formatCurrencyFull } = useOrgCurrency();
	const { data, isLoading } = useQuery({
		...orpc.analytics.getCostLedger.queryOptions({
			input: { organizationId, limit: 10 },
		}),
		enabled: Boolean(organizationId),
	});

	const getBadgeVariant = (type: string) => {
		if (
			type === "PURCHASE" ||
			type === "FREIGHT" ||
			type === "HOLDING_COST"
		) {
			return "destructive";
		}
		if (type === "COGS") {
			return "default";
		}
		if (type === "INVENTORY_GAIN" || type === "RTV_CREDIT") {
			return "outline";
		}
		return "secondary";
	};

	const formatCurrency = (amount: unknown) => {
		const val =
			typeof amount === "string" ? Number.parseFloat(amount) : Number(amount);
		return formatCurrencyFull(Number.isFinite(val) ? val : 0);
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
													) as
														| "default"
														| "secondary"
														| "destructive"
														| "outline"
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

export function FinancialLedger({
	organizationId,
}: {
	organizationId: string;
}) {
	return (
		<OrgCurrencyProvider organizationId={organizationId}>
			<FinancialLedgerContent organizationId={organizationId} />
		</OrgCurrencyProvider>
	);
}
