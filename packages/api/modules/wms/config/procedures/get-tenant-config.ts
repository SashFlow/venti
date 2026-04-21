import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

const DEFAULT_CONFIG = {
	industryType: null,
	enableMezzanine: false,
	enableRefrigerantModule: false,
	enableASPChannel: false,
	enableWeatherDemand: false,
	enableMultiTierDC: false,
	enableSerialTracking: true,
	enableBatchTracking: true,
	enableLandedCost: true,
	enableCycleCount: true,
	enableDeadStockAnalysis: true,
	enableLastMile: false,
	enableConsignment: false,
	enableWarranty: false,
	enableQCInspection: false,
	defaultReceivingWorkflow: "TWO_STEP" as const,
	defaultShippingWorkflow: "TWO_STEP" as const,
	defaultDispatchMethod: "FIFO" as const,
	defaultCostMethod: "FIFO" as const,
	deadStockThreshold30: true,
	deadStockThreshold60: true,
	deadStockThreshold90: true,
	deadStockThreshold180: true,
	metadata: null,
};

export const getTenantConfig = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/config",
		tags: ["WMS", "Config"],
		summary: "Get WMS tenant configuration",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		if (
			!(await context.can(
				input.organizationId,
				WMS_RESOURCES.CONFIG,
				WMS_ACTIONS.READ,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const config = await db.wmsTenantConfig.findUnique({
			where: { organizationId: input.organizationId },
		});

		if (!config) {
			return {
				config: {
					id: null,
					organizationId: input.organizationId,
					...DEFAULT_CONFIG,
					createdAt: null,
					updatedAt: null,
				},
			};
		}

		return { config };
	});
