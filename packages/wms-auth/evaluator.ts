/**
 * WMS Permission Evaluator
 *
 * Split into two sections:
 *   Section A — Pure functions (no imports). Safe to import client-side.
 *   Section B — Server-side loader. Imports @repo/database. Server only.
 */

// ============================================================
// SECTION A — Pure Evaluation (safe for client-side import)
// ============================================================

import type { PolicyStatement, WmsCanFn } from "./types";

/**
 * matchResource
 *
 * Glob-style ARN matching. "*" in the pattern becomes ".*" in a regex,
 * allowing cross-segment matches.
 *
 * Examples:
 *   matchResource("wms:*",          "wms:warehouse")        → true
 *   matchResource("wms:*",          "wms:warehouse:wh_abc") → true
 *   matchResource("wms:warehouse:*","wms:warehouse:wh_abc") → true
 *   matchResource("wms:warehouse:*","wms:picking:wave_1")   → false
 *   matchResource("wms:warehouse:wh_abc", "wms:warehouse:wh_abc") → true
 *   matchResource("wms:warehouse:wh_abc", "wms:warehouse:wh_xyz") → false
 */
export function matchResource(pattern: string, resource: string): boolean {
	if (pattern === "*") return true;
	// Escape all regex specials except "*", then replace "*" with ".*"
	const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`).test(resource);
}

/**
 * matchAction
 *
 * Exact match or wildcard. Actions have no sub-segments so "*" = any action.
 */
export function matchAction(pattern: string, action: string): boolean {
	return pattern === "*" || pattern === action;
}

/**
 * evaluate
 *
 * IAM-style policy evaluation engine.
 *
 * Algorithm:
 *   1. Default deny — returns false unless at least one ALLOW is found.
 *   2. Iterate all statements that match both resource and action.
 *   3. First DENY found → return false immediately (explicit DENY beats ALLOW).
 *   4. Any ALLOW found → set hasAllow = true (but keep scanning for DENY).
 *   5. After all statements → return hasAllow.
 *
 * Permissions are additive across all attached policies.
 * Evaluation order: DENY is checked inline, not after ALLOW collection.
 */
export function evaluate(
	statements: PolicyStatement[],
	resource: string,
	action: string,
): boolean {
	let hasAllow = false;

	for (const stmt of statements) {
		const rMatch = stmt.resources.some((r) => matchResource(r, resource));
		const aMatch = stmt.actions.some((a) => matchAction(a, action));

		if (!rMatch || !aMatch) continue;

		if (stmt.effect === "DENY") {
			// Explicit DENY is final — no further evaluation needed
			return false;
		}

		if (stmt.effect === "ALLOW") {
			hasAllow = true;
			// Do NOT break: a later DENY statement must still be checked
		}
	}

	return hasAllow;
}

// ============================================================
// SECTION B — Server-Side Loader (imports @repo/database)
// ============================================================

import { db } from "@repo/database";

/**
 * loadPolicyStatements
 *
 * Fetches all PolicyStatement rows that apply to a (userId, organizationId) pair.
 *
 * Two statement sources are merged into a flat array:
 *   1. Via WMS roles assigned to the member:
 *        WmsMemberRole → WmsRole → WmsRolePolicyAttachment → WmsPolicy → WmsPolicyStatement
 *   2. Via policies attached directly to the member (inline/boundary policies):
 *        WmsMemberPolicyAttachment → WmsPolicy → WmsPolicyStatement
 *
 * Built-in roles (organizationId = null, isBuiltIn = true) are loaded
 * transparently because WmsMemberRole.wmsRoleId may point to a global built-in.
 *
 * Returns a flat PolicyStatement[] — the evaluator does not care about grouping.
 * Returns [] if the user is not a member of the organization.
 */
export async function loadPolicyStatements(
	userId: string,
	organizationId: string,
): Promise<PolicyStatement[]> {
	const member = await db.member.findUnique({
		where: {
			organizationId_userId: { organizationId, userId },
		},
		include: {
			wmsRoles: {
				include: {
					wmsRole: {
						include: {
							policyAttachments: {
								include: {
									policy: {
										include: { statements: true },
									},
								},
							},
						},
					},
				},
			},
			wmsPolicies: {
				include: {
					policy: {
						include: { statements: true },
					},
				},
			},
		},
	});

	if (!member) return [];

	const statements: PolicyStatement[] = [];

	// Role → policy → statements
	for (const mr of member.wmsRoles) {
		for (const rpa of mr.wmsRole.policyAttachments) {
			for (const stmt of rpa.policy.statements) {
				statements.push({
					id: stmt.id,
					effect: stmt.effect as "ALLOW" | "DENY",
					actions: stmt.actions,
					resources: stmt.resources,
					conditions: stmt.conditions,
				});
			}
		}
	}

	// Direct member policy attachments → statements (inline / DENY boundary policies)
	for (const mpa of member.wmsPolicies) {
		for (const stmt of mpa.policy.statements) {
			statements.push({
				id: stmt.id,
				effect: stmt.effect as "ALLOW" | "DENY",
				actions: stmt.actions,
				resources: stmt.resources,
				conditions: stmt.conditions,
			});
		}
	}

	return statements;
}

/**
 * createWmsCanFn
 *
 * Returns a WmsCanFn suitable for attaching to the oRPC context in wmsProcedure.
 *
 * The returned function:
 *   - Accepts (organizationId, resource, action)
 *   - Lazily loads and caches statements per organizationId via a per-request Map
 *     (DB query fires at most once per org per request, even with multiple can() calls)
 *   - Runs evaluate() synchronously once statements are loaded
 *
 * The Map is scoped to the closure — it lives only for the duration of one request.
 */
export function createWmsCanFn(userId: string): WmsCanFn {
	// Per-request cache: organizationId → pending/resolved Promise<PolicyStatement[]>
	const cache = new Map<string, Promise<PolicyStatement[]>>();

	return async (organizationId: string, resource: string, action: string) => {
		if (!cache.has(organizationId)) {
			cache.set(
				organizationId,
				loadPolicyStatements(userId, organizationId),
			);
		}

		// biome-ignore lint/style/noNonNullAssertion: set in the branch above
		const statements = await cache.get(organizationId)!;
		return evaluate(statements, resource, action);
	};
}
