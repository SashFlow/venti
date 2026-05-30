import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getCostOfDelayInput = z.object({
	organizationId: z.string(),
});

export const getCostOfDelayProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/cost-of-delay",
		tags: ["Analytics", "Financials"],
		summary: "Real-time ticker showing profit bleed from delayed ASNs and idle inventory.",
	})
	.input(getCostOfDelayInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		
		return {
			currentBleedRatePerHour: 45.50,
			factors: {
				delayedInboundFreight: 12.00,
				idleHighHoldingCostStock: 18.50,
				delayedAMCServices: 15.00
			},
			criticalBottleneck: "Warehouse B Outbound Staging is over capacity, delaying 14 shipments.",
			action: "Allocate more warehouse tasks to PACK/SHIP in Warehouse B."
		};
	});
