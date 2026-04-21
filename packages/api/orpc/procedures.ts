import { ORPCError, os } from "@orpc/server";
import { auth } from "@repo/auth";
import type { WmsCanFn } from "@repo/wms-auth";
import { createWmsCanFn } from "@repo/wms-auth";

export const publicProcedure = os.$context<{
	headers: Headers;
}>();

export const protectedProcedure = publicProcedure.use(
	async ({ context, next }) => {
		const session = await auth.api.getSession({
			headers: context.headers,
		});

		if (!session) {
			throw new ORPCError("UNAUTHORIZED");
		}

		return await next({
			context: {
				session: session.session,
				user: session.user,
			},
		});
	},
);

export const adminProcedure = protectedProcedure.use(
	async ({ context, next }) => {
		if (context.user.role !== "admin") {
			throw new ORPCError("FORBIDDEN");
		}

		return await next();
	},
);

/**
 * wmsProcedure
 *
 * Extends protectedProcedure with a `can` function on the context.
 * The can() function is lazy — no DB query fires until it is called.
 *
 * Usage in a WMS handler:
 *
 *   export const myHandler = wmsProcedure.handler(async ({ input, context }) => {
 *     const membership = await verifyOrganizationMembership(
 *       input.organizationId, context.user.id
 *     );
 *     if (!membership) throw new ORPCError("FORBIDDEN");
 *
 *     if (!await context.can(input.organizationId, WMS_RESOURCES.WAREHOUSE, WMS_ACTIONS.READ)) {
 *       throw new ORPCError("FORBIDDEN");
 *     }
 *     // ... business logic
 *   });
 *
 * Two gates work together:
 *   verifyOrganizationMembership → "Is this user a member of this org?" (coarse)
 *   context.can                  → "Does this member hold the WMS permission?" (fine)
 */
export const wmsProcedure = protectedProcedure.use(
	async ({ context, next }) => {
		const can: WmsCanFn = createWmsCanFn(context.user.id);
		return await next({ context: { can } });
	},
);
