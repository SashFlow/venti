import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";
import { getWaveById } from "../services/orders-service";

export const getWaveProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/orders/waves/{waveId}",
		tags: ["Orders"],
		summary: "Get wave/fulfillment batch by ID",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		await requireOrganizationMembership(input.organizationId, user.id);

		const wave = await getWaveById(input);

		if (!wave) {
			throw new ORPCError("NOT_FOUND", {
				message: "Wave not found.",
			});
		}

		return { wave };
	});
