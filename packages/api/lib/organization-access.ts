import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";

export type OrganizationMembership = {
	organizationId: string;
	role: string;
};

export async function requireOrganizationMembership(
	organizationId: string,
	userId: string,
): Promise<OrganizationMembership> {
	const membership = await db.member.findUnique({
		where: {
			organizationId_userId: {
				organizationId,
				userId,
			},
		},
		select: {
			organizationId: true,
			role: true,
		},
	});

	if (!membership) {
		throw new ORPCError("FORBIDDEN", {
			message: "You are not a member of this organization.",
		});
	}

	return membership;
}
