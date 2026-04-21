import { ORPCError } from "@orpc/client";
import { loadPolicyStatements } from "@repo/wms-auth";
import { z } from "zod";
import { wmsProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

/**
 * list-my-permissions
 *
 * Returns the flat PolicyStatement[] that applies to the current user in
 * the given organization. Used by the client-side useWmsPermission hook
 * to evaluate permissions locally (pure evaluate() call, no extra HTTP requests).
 *
 * Only effect, actions, and resources are returned — no internal policy IDs,
 * names, or conditions are exposed to the client.
 *
 * This endpoint is for UX gating only (show/hide UI elements).
 * Server-side context.can() is always the authoritative source of truth.
 */
export const listMyPermissions = wmsProcedure
	.route({
		method: "GET",
		path: "/wms/permissions/me",
		tags: ["WMS", "Permissions"],
		summary: "Get my WMS permissions",
		description:
			"Returns policy statements for the current user in the given organization.",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			context.user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const statements = await loadPolicyStatements(
			context.user.id,
			input.organizationId,
		);

		return {
			statements: statements.map((s) => ({
				effect: s.effect,
				actions: s.actions,
				resources: s.resources,
			})),
		};
	});
