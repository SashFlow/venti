import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getPredictiveMaintenanceInput = z.object({
	organizationId: z.string(),
	customerLocationId: z.string().optional(),
});

export const getPredictiveMaintenanceProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/predictive-maintenance",
		tags: ["Analytics", "IoT", "AI"],
		summary: "Identify HVAC units at risk of failure using IoT data curves.",
	})
	.input(getPredictiveMaintenanceInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return {
			alerts: [
				{
					customerLocationId: input.customerLocationId || "CUST-LOC-101",
					unitId: "HVAC-ROOF-01",
					alertType: "COMPRESSOR_STRAIN",
					confidence: 0.89,
					daysToFailureEstimate: 12,
					requiredParts: [
						{ skuCode: "COMP-500", qty: 1, availableInLocalWarehouse: false }
					],
					action: "Draft PurchaseOrder for COMP-500 to arrive before estimated failure."
				}
			]
		};
	});
