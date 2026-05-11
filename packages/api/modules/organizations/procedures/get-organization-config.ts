import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import z from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../lib/membership";

export const getOrganizationConfig = protectedProcedure
	.route({
		method: "GET",
		path: "/organizations/config",
		tags: ["Organizations"],
		summary: "Get organization config",
		description: "Get persisted organization configuration JSON sections.",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input: { organizationId } }) => {
		const membership = await verifyOrganizationMembership(
			organizationId,
			user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const config = await db.organizationConfig.findUnique({
			where: {
				organizationId,
			},
			select: {
				id: true,
				organizationId: true,
				fulfillment: true,
				inventory: true,
				units: true,
				barcodeScanner: true,
				purchaseOrders: true,
				transfers: true,
				cycleCount: true,
				dataRetention: true,
				updatedAt: true,
			},
		});

		return {
			config,
		};
	});
