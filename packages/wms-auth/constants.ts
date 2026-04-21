/**
 * ARN-style resource identifiers for WMS modules.
 * Format: wms:{module}[:{sub-resource}[:{resourceId}]]
 *
 * Wildcards in policy statements:
 *   "wms:*"              → matches everything in the WMS domain
 *   "wms:warehouse:*"    → matches any warehouse resource
 *   "wms:warehouse:wh_x" → matches exactly that warehouse
 */
export const WMS_RESOURCES = {
	CONFIG: "wms:config",
	WAREHOUSE: "wms:warehouse",
	PRODUCT: "wms:product",
	INVENTORY: "wms:inventory",
	PROCUREMENT: "wms:procurement",
	QC: "wms:qc",
	PICKING: "wms:picking",
	DISPATCH: "wms:dispatch",
	RETURNS: "wms:returns",
	VALUATION: "wms:valuation",
	REPLENISHMENT: "wms:replenishment",
	ASP: "wms:asp",
	DEADSTOCK: "wms:deadstock",
	LASTMILE: "wms:lastmile",
	REFRIGERANT: "wms:refrigerant",
} as const;

/** All actions that can be granted or denied per resource */
export const WMS_ACTIONS = {
	READ: "read",
	CREATE: "create",
	UPDATE: "update",
	DELETE: "delete",
	APPROVE: "approve",
	RECEIVE: "receive",
	DISPATCH: "dispatch",
	PICK: "pick",
	PACK: "pack",
	COUNT: "count",
	ADJUST: "adjust",
	INSPECT: "inspect",
	SCRAP: "scrap",
	TRANSFER: "transfer",
	ALL: "*",
} as const;

/**
 * Stable code strings for the 10 built-in WMS roles.
 * These match WmsRole.code in the database and are used as seed keys.
 */
export const BUILT_IN_ROLES = {
	WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER",
	RECEIVING_STAFF: "RECEIVING_STAFF",
	PICKER: "PICKER",
	QC_INSPECTOR: "QC_INSPECTOR",
	PROCUREMENT_MANAGER: "PROCUREMENT_MANAGER",
	RETURNS_COORDINATOR: "RETURNS_COORDINATOR",
	FINANCE: "FINANCE",
	INVENTORY_CONTROLLER: "INVENTORY_CONTROLLER",
	ASP_COORDINATOR: "ASP_COORDINATOR",
	DIRECTOR: "DIRECTOR",
} as const;

export type WmsResource = (typeof WMS_RESOURCES)[keyof typeof WMS_RESOURCES];
export type WmsAction = (typeof WMS_ACTIONS)[keyof typeof WMS_ACTIONS];
export type BuiltInRole = (typeof BUILT_IN_ROLES)[keyof typeof BUILT_IN_ROLES];
