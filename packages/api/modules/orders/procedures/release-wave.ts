import { releaseAndOptimizeWave } from "@repo/database";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const releaseWaveProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/waves/{waveId}/release",
		tags: ["Orders"],
		summary: "Release wave and optimize pick routes",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
			pickerCount: z.number().int().min(1).max(10).default(3),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		return releaseAndOptimizeWave({
			organizationId: input.organizationId,
			waveId: input.waveId,
			releasedByUserId: user.id,
			pickerCount: input.pickerCount,
		});
	});
