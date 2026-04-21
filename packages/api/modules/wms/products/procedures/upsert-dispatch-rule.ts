import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const upsertDispatchRule = wmsProcedure
	.route({
		method: "PUT",
		path: "/wms/dispatch-rules",
		tags: ["WMS", "Products"],
		summary: "Upsert a dispatch rule (by product or category)",
	})
	.input(
		z
			.object({
				organizationId: z.string(),
				productId: z.string().optional(),
				category: z.string().optional(),
				method: z.enum(["FIFO", "FEFO", "DATE_BASED", "LIFO"] as [
					string,
					...string[],
				]),
				active: z.boolean().optional(),
				metadata: z.record(z.unknown()).optional(),
			})
			.refine((data) => data.productId || data.category, {
				message: "Either productId or category must be provided.",
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
				WMS_RESOURCES.PRODUCT,
				WMS_ACTIONS.UPDATE,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		if (input.productId) {
			const product = await db.product.findFirst({
				where: {
					id: input.productId,
					organizationId: input.organizationId,
				},
				select: { id: true },
			});
			if (!product) {
				throw new ORPCError("NOT_FOUND", {
					message:
						"Product not found or does not belong to this organization.",
				});
			}
		}

		const sharedData = {
			method: input.method as any,
			active: input.active ?? true,
			metadata: input.metadata ?? null,
		};

		const lookupWhere = input.productId
			? {
					organizationId: input.organizationId,
					productId: input.productId,
				}
			: {
					organizationId: input.organizationId,
					category: input.category,
					productId: null,
				};

		const existing = await db.dispatchRule.findFirst({
			where: lookupWhere,
		});

		const rule = existing
			? await db.dispatchRule.update({
					where: { id: existing.id },
					data: sharedData,
				})
			: await db.dispatchRule.create({
					data: {
						organizationId: input.organizationId,
						productId: input.productId ?? null,
						category: input.category ?? null,
						...sharedData,
					},
				});

		return { rule };
	});
