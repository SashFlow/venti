export type WmsEffect = "ALLOW" | "DENY";

/** Flat in-memory representation of one WmsPolicyStatement DB row */
export type PolicyStatement = {
	id: string;
	effect: WmsEffect;
	actions: string[]; // e.g. ["read", "create"] or ["*"]
	resources: string[]; // e.g. ["wms:warehouse:*", "wms:warehouse:wh_abc123"]
	conditions: unknown; // reserved for v2 condition evaluation
};

/**
 * Server-side can() function placed on the oRPC context by wmsProcedure.
 * Signature: (organizationId, resource, action) → Promise<boolean>
 */
export type WmsCanFn = (
	organizationId: string,
	resource: string,
	action: string,
) => Promise<boolean>;
