import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { createWave } from "@repo/database";

export const createWaveProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/waves",
		tags: ["Orders"],
		summary: "Create fulfillment wave/batch",
	})
	.input(
		z.object({
			organizationId: z.string(),
			warehouseId: z.string(),
			waveNumber: z.string().min(1).max(100),
			type: z
				.enum(["SINGLE_ORDER", "BATCH", "ZONE", "CLUSTER"])
				.default("BATCH"),
			salesOrderIds: z.array(z.string()).min(1),
			notes: z.string().optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return createWave({
			...input,
		});
	});
