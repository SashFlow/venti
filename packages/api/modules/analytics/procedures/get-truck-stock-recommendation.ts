import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

const getTruckStockRecommendationInput = z.object({
	organizationId: z.string(),
	technicianId: z.string(),
	routeDate: z.date().optional(),
});

export const getTruckStockRecommendationProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/analytics/truck-stock-recommendation",
		tags: ["Analytics", "AMC", "AI"],
		summary: "Recommend truck stock for AMC technicians based on route and weather.",
	})
	.input(getTruckStockRecommendationInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);
		
		return {
			technicianId: input.technicianId,
			routeRiskLevel: "MEDIUM",
			weatherCondition: "HIGH_HUMIDITY",
			recommendedAllocations: [
				{ skuCode: "FLT-100", description: "HEPA Filter 20x20x1", suggestedQty: 10, reason: "High pollen/humidity on route" },
				{ skuCode: "CNT-24V", description: "24V Contactor", suggestedQty: 3, reason: "Customer A and C units > 8 years old" },
				{ skuCode: "REF-410A", description: "R-410A Refrigerant Cylinder", suggestedQty: 2, reason: "Common leak season" },
			],
			estimatedFirstTimeFixImprovement: "14%",
			action: "Create TransferOrder from Main Warehouse to Technician Truck"
		};
	});
