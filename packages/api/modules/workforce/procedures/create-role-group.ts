import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { assertCanManageWorkforce, getMembershipOrThrow } from "../lib/access";
import { ALL_PERMISSION_KEYS } from "../lib/permission-groups";

const createRoleGroupInput = z.object({
	organizationId: z.string(),
	name: z.string().trim().min(1).max(120),
	description: z.string().trim().max(400).optional(),
	warehouseIds: z.array(z.string()).default([]),
	permissions: z.array(z.string()).default([]),
});

export const createRoleGroup = protectedProcedure
	.route({
		method: "POST",
		path: "/workforce/role-groups",
		tags: ["Workforce"],
		summary: "Create role group",
		description:
			"Creates a role group with warehouse scope and action permissions for an organization.",
	})
	.input(createRoleGroupInput)
	.handler(async ({ context: { user }, input }) => {
		const membership = await getMembershipOrThrow(
			input.organizationId,
			user.id,
		);
		assertCanManageWorkforce(membership);

		const normalizedWarehouseIds = [...new Set(input.warehouseIds)];
		const normalizedPermissions = [...new Set(input.permissions)];

		for (const permission of normalizedPermissions) {
			if (!ALL_PERMISSION_KEYS.has(permission)) {
				throw new ORPCError("BAD_REQUEST", {
					message: `Unknown permission key: ${permission}`,
				});
			}
		}

		if (normalizedWarehouseIds.length > 0) {
			const warehouses = await db.warehouse.findMany({
				where: {
					id: { in: normalizedWarehouseIds },
					organizationId: input.organizationId,
				},
				select: {
					id: true,
				},
			});

			if (warehouses.length !== normalizedWarehouseIds.length) {
				throw new ORPCError("BAD_REQUEST", {
					message:
						"One or more warehouse scopes are invalid for this organization.",
				});
			}
		}

		const roleGroup = await db.roleGroup.create({
			data: {
				organizationId: input.organizationId,
				name: input.name,
				description: input.description,
				permissions: normalizedPermissions,
				warehouses: {
					connect: normalizedWarehouseIds.map((id) => ({ id })),
				},
			},
			select: {
				id: true,
				name: true,
				description: true,
				permissions: true,
				warehouses: {
					select: {
						id: true,
						code: true,
						name: true,
					},
				},
				createdAt: true,
				updatedAt: true,
			},
		});

		return { roleGroup };
	});
