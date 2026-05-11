import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { assertCanManageWorkforce, getMembershipOrThrow } from "../lib/access";

export const assignMemberRoleGroup = protectedProcedure
	.route({
		method: "PATCH",
		path: "/workforce/member-role-group",
		tags: ["Workforce"],
		summary: "Assign role group to member",
		description:
			"Assigns or removes a role-group access profile for a member in the organization.",
	})
	.input(
		z.object({
			organizationId: z.string(),
			memberId: z.string(),
			roleGroupId: z.string().nullable(),
		}),
	)
	.handler(async ({ context: { user }, input }) => {
		const membership = await getMembershipOrThrow(
			input.organizationId,
			user.id,
		);
		assertCanManageWorkforce(membership);

		const memberToUpdate = await db.member.findFirst({
			where: {
				id: input.memberId,
				organizationId: input.organizationId,
			},
			select: {
				id: true,
			},
		});

		if (!memberToUpdate) {
			throw new ORPCError("NOT_FOUND", {
				message: "Member not found in organization.",
			});
		}

		if (input.roleGroupId) {
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
				throw new ORPCError("BAD_REQUEST", {
					message: "Role group is not valid for this organization.",
				});
			}
		}

		const updatedMember = await db.member.update({
			where: {
				id: input.memberId,
			},
			data: {
				roleGroupId: input.roleGroupId,
			},
			select: {
				id: true,
				roleGroupId: true,
				roleGroup: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return {
			member: updatedMember,
		};
	});
