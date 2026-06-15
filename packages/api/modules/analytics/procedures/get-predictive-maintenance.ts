import { getPredictiveMaintenanceAlerts } from "@repo/database";
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
		summary: "Identify serialized SKUs at elevated failure risk from return patterns.",
	})
	.input(getPredictiveMaintenanceInput)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return getPredictiveMaintenanceAlerts(input.organizationId);
	});
