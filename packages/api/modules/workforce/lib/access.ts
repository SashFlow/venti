import { ORPCError } from "@orpc/server";
import { db } from "@repo/database";

type Membership = {
	organizationId: string;
	role: string;
};

export async function getMembershipOrThrow(
	organizationId: string,
	userId: string,
): Promise<Membership> {
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

export function assertCanManageWorkforce(membership: Membership) {
	if (membership.role !== "owner" && membership.role !== "admin") {
		throw new ORPCError("FORBIDDEN", {
			message: "Only organization admins can manage workforce access.",
		});
	}
}
