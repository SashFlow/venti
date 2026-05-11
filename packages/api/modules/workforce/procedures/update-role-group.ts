import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { assertCanManageWorkforce, getMembershipOrThrow } from "../lib/access";
import { ALL_PERMISSION_KEYS } from "../lib/permission-groups";

const updateRoleGroupInput = z.object({
	organizationId: z.string(),
	roleGroupId: z.string(),
	name: z.string().trim().min(1).max(120),
	description: z.string().trim().max(400).nullable().optional(),
	warehouseIds: z.array(z.string()).default([]),
	permissions: z.array(z.string()).default([]),
});

export const updateRoleGroup = protectedProcedure
	.route({
		method: "PATCH",
		path: "/workforce/role-groups",
		tags: ["Workforce"],
		summary: "Update role group",
		description:
			"Updates role group details, warehouse scope, and action permissions for an organization.",
	})
	.input(updateRoleGroupInput)
	.handler(async ({ context: { user }, input }) => {
		const membership = await getMembershipOrThrow(
			input.organizationId,
			user.id,
		);
		assertCanManageWorkforce(membership);

		const roleGroup = await db.roleGroup.findFirst({
			where: {
				id: input.roleGroupId,
				organizationId: input.organizationId,
			},
			select: {
				id: true,
			},
		});

		if (!roleGroup) {
			throw new ORPCError("NOT_FOUND", {
				message: "Role group not found in organization.",
			});
		}

		const normalizedWarehouseIds = [...new Set(input.warehouseIds)];
		const normalizedPermissions = [...new Set(input.permissions)];

		for (const permission of normalizedPermissions) {
			if (!ALL_PERMISSION_KEYS.has(permission)) {
				throw new ORPCError("BAD_REQUEST", {
					message: `Unknown permission key: ${permission}`,
				});
			}
		}

		if (normalizedPermissions.length === 0) {
			throw new ORPCError("BAD_REQUEST", {
				message: "At least one permission is required.",
			});
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

		const updatedRoleGroup = await db.roleGroup.update({
			where: {
				id: input.roleGroupId,
			},
			data: {
				name: input.name,
				description: input.description ?? null,
				permissions: normalizedPermissions,
				warehouses: {
					set: normalizedWarehouseIds.map((id) => ({ id })),
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
					orderBy: {
						createdAt: "asc",
					},
				},
				createdAt: true,
				updatedAt: true,
			},
		});

		return {
			roleGroup: updatedRoleGroup,
		};
	});
