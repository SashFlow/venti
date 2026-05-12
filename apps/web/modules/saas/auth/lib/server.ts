import "server-only";
import { auth } from "@repo/auth";
import { db, getInvitationById } from "@repo/database";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () => {
	const requestHeaders = await headers();

	const session = await auth.api.getSession({
		headers: requestHeaders,
		query: {
			disableCookieCache: true,
		},
	});

	if (!session) {
		return null;
	}

	let organization = null;
	const activeOrganizationId = session.session.activeOrganizationId;

	if (activeOrganizationId) {
		try {
			const activeOrganization = await db.organization.findUnique({
				where: {
					id: activeOrganizationId,
				},
				select: {
					id: true,
					name: true,
					slug: true,
					createdAt: true,
					logo: true,
					metadata: true,
				},
			});

			organization = activeOrganization
				? {
						id: activeOrganization.id,
						name: activeOrganization.name,
						slug: activeOrganization.slug,
						createdAt: activeOrganization.createdAt,
						logo: activeOrganization.logo ?? null,
						metadata: activeOrganization.metadata,
					}
				: null;
		} catch {
			organization = null;
		}
	}

	return {
		...session,
		organization,
	};
});

export const getOrganizationList = cache(async () => {
	try {
		const organizationList = await auth.api.listOrganizations({
			headers: await headers(),
		});

		return organizationList;
	} catch {
		return [];
	}
});

export const getUserAccounts = cache(async () => {
	try {
		const userAccounts = await auth.api.listUserAccounts({
			headers: await headers(),
		});

		return userAccounts;
	} catch {
		return [];
	}
});

export const getUserPasskeys = cache(async () => {
	try {
		const userPasskeys = await auth.api.listPasskeys({
			headers: await headers(),
		});

		return userPasskeys;
	} catch {
		return [];
	}
});

export const getInvitation = cache(async (id: string) => {
	try {
		return await getInvitationById(id);
	} catch {
		return null;
	}
});
