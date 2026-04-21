import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { WMS_ACTIONS, WMS_RESOURCES } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../../organizations/lib/membership";

export const listCustomers = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/customers",
		tags: ["WMS", "Customers"],
		summary: "List customers",
	})
	.input(
		z.object({
			organizationId: z.string(),
			query: z.string().optional(),
			includeInactive: z.boolean().optional(),
			limit: z.number().int().min(1).max(200).default(50),
			offset: z.number().int().min(0).default(0),
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
				WMS_RESOURCES.RETURNS,
				WMS_ACTIONS.READ,
			))
		) {
			throw new ORPCError("FORBIDDEN");
		}

		const where = {
			organizationId: input.organizationId,
			...(input.includeInactive ? {} : { active: true }),
			...(input.query
				? {
						OR: [
							{
								name: {
									contains: input.query,
									mode: "insensitive" as const,
								},
							},
							{
								code: {
									contains: input.query,
									mode: "insensitive" as const,
								},
							},
						],
					}
				: {}),
		};

		const [customers, total] = await Promise.all([
			db.customer.findMany({
				where,
				orderBy: { name: "asc" },
				take: input.limit,
				skip: input.offset,
			}),
			db.customer.count({ where }),
		]);

		return { customers, total };
	});
