import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { getMembershipOrThrow } from "../lib/access";
import { PERMISSION_GROUPS } from "../lib/permission-groups";

export const listAccessConfig = protectedProcedure
	.route({
		method: "GET",
		path: "/workforce/access-config",
		tags: ["Workforce"],
		summary: "List role-group access config",
		description:
			"Returns permission catalog, warehouses, role groups, and members for an organization.",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input: { organizationId } }) => {
		await getMembershipOrThrow(organizationId, user.id);

		const [warehouses, roleGroups, members] = await Promise.all([
			db.warehouse.findMany({
				where: { organizationId },
				select: {
					id: true,
					code: true,
					name: true,
					status: true,
				},
				orderBy: {
					createdAt: "asc",
				},
			}),
			db.roleGroup.findMany({
				where: { organizationId },
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
				orderBy: {
					createdAt: "asc",
				},
			}),
			db.member.findMany({
				where: { organizationId },
				select: {
					id: true,
					role: true,
					roleGroupId: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					roleGroup: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: {
					createdAt: "asc",
				},
			}),
		]);

		return {
			permissionGroups: PERMISSION_GROUPS,
			warehouses,
			roleGroups,
			members,
		};
	});
