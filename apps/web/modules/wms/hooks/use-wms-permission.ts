"use client";

import type { PolicyStatement } from "@repo/wms-auth";
import { evaluate } from "@repo/wms-auth";
import { orpcClient } from "@shared/lib/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export const wmsPermissionsQueryKey = (organizationId: string) =>
	["wms", "permissions", organizationId] as const;

type UseWmsPermissionReturn = {
	/** Synchronous permission check — uses cached statements, no extra HTTP calls */
	can: (resource: string, action: string) => boolean;
	isLoading: boolean;
	isError: boolean;
};

/**
 * useWmsPermission
 *
 * Fetches the current user's WMS policy statements for the given organization
 * and exposes a synchronous `can(resource, action)` function backed by the
 * same IAM-style evaluate() engine used on the server.
 *
 * - While loading, can() returns false (optimistic deny — never show gated UI before ready).
 * - Statements are cached for 5 minutes (staleTime) and refreshed in the background.
 * - The evaluate() function imported from @repo/wms-auth is pure (no DB, no network).
 *   It is safe to call on every render.
 *
 * This hook is for UX gating only (show/hide/disable UI elements).
 * Server-side context.can() is always the authoritative source of truth.
 *
 * Usage:
 *   const { can, isLoading } = useWmsPermission(organizationId);
 *   if (can(WMS_RESOURCES.WAREHOUSE, WMS_ACTIONS.READ)) { ... }
 */
export function useWmsPermission(
	organizationId: string,
): UseWmsPermissionReturn {
	const { data, isLoading, isError } = useQuery({
		queryKey: wmsPermissionsQueryKey(organizationId),
		queryFn: async () => {
			const result = await orpcClient.wms.permissions.me({
				organizationId,
			});
			return result.statements as PolicyStatement[];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!organizationId,
	});

	const statements: PolicyStatement[] = data ?? [];

	const can = useCallback(
		(resource: string, action: string): boolean => {
			if (isLoading || !data) return false;
			return evaluate(statements, resource, action);
		},
		[statements, isLoading, data],
	);

	return { can, isLoading, isError };
}
