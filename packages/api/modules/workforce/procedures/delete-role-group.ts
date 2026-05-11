import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { assertCanManageWorkforce, getMembershipOrThrow } from "../lib/access";

export const deleteRoleGroup = protectedProcedure
	.route({
		method: "DELETE",
		path: "/workforce/role-groups",
		tags: ["Workforce"],
		summary: "Delete role group",
		description:
			"Deletes a role group from an organization. Member assignments are detached automatically.",
	})
	.input(
		z.object({
			organizationId: z.string(),
			roleGroupId: z.string(),
		}),
	)
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
				name: true,
			},
		});

		if (!roleGroup) {
			throw new ORPCError("NOT_FOUND", {
				message: "Role group not found in organization.",
			});
		}

		await db.roleGroup.delete({
			where: {
				id: input.roleGroupId,
			},
		});

		return {
			deleted: true,
			roleGroupId: input.roleGroupId,
		};
	});
