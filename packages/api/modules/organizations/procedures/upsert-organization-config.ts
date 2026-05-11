import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import z from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../lib/membership";

const jsonObjectSchema = z.record(z.string(), z.any());

export const upsertOrganizationConfig = protectedProcedure
	.route({
		method: "POST",
		path: "/organizations/config",
		tags: ["Organizations"],
		summary: "Upsert organization config",
		description:
			"Create or update persisted organization configuration JSON sections.",
	})
	.input(
		z.object({
			organizationId: z.string(),
			fulfillment: jsonObjectSchema.optional(),
			inventory: jsonObjectSchema.optional(),
			units: jsonObjectSchema.optional(),
			barcodeScanner: jsonObjectSchema.optional(),
			purchaseOrders: jsonObjectSchema.optional(),
			transfers: jsonObjectSchema.optional(),
			cycleCount: jsonObjectSchema.optional(),
			dataRetention: jsonObjectSchema.optional(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const {
			organizationId,
			fulfillment,
			inventory,
			units,
			barcodeScanner,
			purchaseOrders,
			transfers,
			cycleCount,
			dataRetention,
		} = input;

		const config = await db.$transaction(async (tx) => {
			const existing = await tx.organizationConfig.findUnique({
				where: {
					organizationId,
				},
				select: {
					id: true,
				},
			});

			if (existing) {
				return tx.organizationConfig.update({
					where: {
						organizationId,
					},
					data: {
						fulfillment,
						inventory,
						units,
						barcodeScanner,
						purchaseOrders,
						transfers,
						cycleCount,
						dataRetention,
					},
					select: {
						id: true,
						organizationId: true,
						updatedAt: true,
					},
				});
			}

			const headquarter = await tx.address.create({
				data: {
					addressLine1: "Pending setup",
					city: "Pending",
					country: "Pending",
					state: "Pending",
					zip: "00000",
				},
				select: {
					id: true,
				},
			});

			return tx.organizationConfig.create({
				data: {
					organizationId,
					headquarterId: headquarter.id,
					fulfillment,
					inventory,
					units,
					barcodeScanner,
					purchaseOrders,
					transfers,
					cycleCount,
					dataRetention,
				},
				select: {
					id: true,
					organizationId: true,
					updatedAt: true,
				},
			});
		});

		return {
			config,
		};
	});
