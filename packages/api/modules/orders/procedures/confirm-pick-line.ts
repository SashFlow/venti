import { confirmPickLine } from "@repo/database";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { requireOrganizationMembership } from "../../../lib/organization-access";
import { protectedProcedure } from "../../../orpc/procedures";

export const confirmPickLineProcedure = protectedProcedure
	.route({
		method: "POST",
		path: "/orders/waves/{waveId}/lines/{lineId}/confirm-pick",
		tags: ["Orders"],
		summary: "Confirm pick for a wave line",
	})
	.input(
		z.object({
			organizationId: z.string(),
			waveId: z.string(),
			lineId: z.string(),
			qtyPicked: z.number().positive().optional(),
			scanCode: z.string().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		await requireOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		try {
			return await confirmPickLine({
				organizationId: input.organizationId,
				waveId: input.waveId,
				lineId: input.lineId,
				userId: context.user.id,
				qtyPicked: input.qtyPicked,
				scanCode: input.scanCode,
			});
		} catch (err) {
			if (
				err instanceof Error &&
				(err as Error & { code?: string }).code === "SCAN_MISMATCH"
			) {
				throw new ORPCError("BAD_REQUEST", {
					message: err.message,
				});
			}
			if (err instanceof Error) {
				throw new ORPCError("BAD_REQUEST", { message: err.message });
			}
			throw err;
		}
	});
