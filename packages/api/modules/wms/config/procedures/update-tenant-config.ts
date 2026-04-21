import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";
import { WMS_RESOURCES, WMS_ACTIONS } from "@repo/wms-auth";

export const updateTenantConfig = wmsProcedure
	.route({
		method: "PATCH",
		path: "/wms/config",
		tags: ["WMS", "Config"],
		summary: "Update WMS tenant configuration",
	})
	.input(
		z.object({
			organizationId: z.string(),
			industryType: z.string().optional(),
			enableMezzanine: z.boolean().optional(),
			enableRefrigerantModule: z.boolean().optional(),
			enableASPChannel: z.boolean().optional(),
			enableWeatherDemand: z.boolean().optional(),
			enableMultiTierDC: z.boolean().optional(),
			enableSerialTracking: z.boolean().optional(),
			enableBatchTracking: z.boolean().optional(),
			enableLandedCost: z.boolean().optional(),
			enableCycleCount: z.boolean().optional(),
			enableDeadStockAnalysis: z.boolean().optional(),
			enableLastMile: z.boolean().optional(),
			enableConsignment: z.boolean().optional(),
			enableWarranty: z.boolean().optional(),
			enableQCInspection: z.boolean().optional(),
			defaultReceivingWorkflow: z
				.enum(["TWO_STEP", "ONE_STEP", "THREE_STEP"])
				.optional(),
			defaultShippingWorkflow: z
				.enum(["TWO_STEP", "ONE_STEP", "THREE_STEP"])
				.optional(),
			defaultDispatchMethod: z.enum(["FIFO", "FEFO", "LIFO", "MANUAL"]).optional(),
			defaultCostMethod: z.enum(["FIFO", "FEFO", "LIFO", "AVERAGE", "STANDARD"]).optional(),
			deadStockThreshold30: z.boolean().optional(),
			deadStockThreshold60: z.boolean().optional(),
			deadStockThreshold90: z.boolean().optional(),
			deadStockThreshold180: z.boolean().optional(),
			metadata: z.record(z.unknown()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { organizationId, ...data } = input;

		const membership = await verifyOrganizationMembership(
			organizationId,
			context.user.id,
		);
		if (!membership) throw new ORPCError("FORBIDDEN");

		if (
			!(await context.can(
				organizationId,
				WMS_RESOURCES.CONFIG,
				WMS_ACTIONS.UPDATE,
			))
		)
			throw new ORPCError("FORBIDDEN");

		const config = await db.wmsTenantConfig.upsert({
			where: { organizationId },
			update: data,
			create: {
				organizationId,
				...data,
			},
		});

		return { config };
	});
