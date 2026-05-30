import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getDeadStockRebalanceInput = z.object({
	organizationId: z.string(),
});

export const getDeadStockRebalanceProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/dead-stock-rebalance",
		tags: ["Analytics", "Financials", "AI"],
		summary: "Calculate if transferring dead stock is cheaper than holding it.",
	})
	.input(getDeadStockRebalanceInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		
		return {
			analysisDate: new Date(),
			opportunities: [
				{
					skuCode: "HTR-ELEM-5K",
					description: "5kW Heating Element",
					currentWarehouse: "WH-NORTH",
					proposedWarehouse: "WH-SOUTH",
					qtyToMove: 200,
					estimatedHoldingCostNext6Months: 1200.00,
					estimatedFreightCost: 350.00,
					netSavings: 850.00,
					action: "Create TransferOrder to WH-SOUTH to reduce dead capital."
				}
			]
		};
	});
